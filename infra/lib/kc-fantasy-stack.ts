import * as path from 'node:path';
import {
  Stack,
  StackProps,
  RemovalPolicy,
  CfnOutput,
  Duration,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

/**
 * Hosts the React SPA on S3 + CloudFront with sensible defaults for a
 * client-review prototype:
 *
 *   - Private bucket; CloudFront pulls via Origin Access Control (OAC).
 *   - HTTPS-only at the edge (HTTP requests redirect).
 *   - SPA fallback via CloudFront `errorResponses`: any 403/404 from S3
 *     returns `/index.html` with status 200, so React Router can take over
 *     on routes like `/select-team`, `/player/abc`, etc. without 404ing on
 *     a hard refresh.
 *   - `BucketDeployment` syncs the local `../dist/` into the bucket on every
 *     `cdk deploy` and invalidates the distribution so the next request hits
 *     the new bundle immediately.
 *   - `removalPolicy: DESTROY` + `autoDeleteObjects: true` means `cdk destroy`
 *     actually cleans up — important since this stack is meant to be torn
 *     down when the project migrates to Amplify.
 *
 * Cost shape for a prototype this size (~250KB of assets + a few KB of HTML/
 * JS/CSS per request, US/EU traffic only): a few cents per month at idle,
 * under a dollar even with hundreds of demo sessions.
 */
export class KcFantasyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Bucket — private, encrypted, auto-emptied on stack destroy so
    // teardown is a single command with no console clean-up afterwards.
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // CloudFront distribution. `S3BucketOrigin.withOriginAccessControl` wires
    // up an OAC and patches the bucket policy so only this distribution can
    // read from the bucket — no need to make the bucket public.
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        // SPA fallback. S3 returns 403 (not 404) for missing keys when the
        // bucket is private; CloudFront sees that and we rewrite both to a
        // 200 + index.html so React Router handles the route client-side.
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.minutes(0),
        },
      ],
      // PRICE_CLASS_100 covers North America + Europe. Cheaper than _ALL,
      // fine for a client review demo. Bump to _ALL if Rich's stakeholders
      // are testing from Asia/SA.
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      comment: 'KC Current Fantasy prototype',
    });

    // We deploy in two passes so `index.html` gets `no-cache` while
    // everything else keeps a 1h cache. Why this matters:
    //   - `index.html` is the only file the browser fetches by stable name.
    //     It references the JS/CSS bundle by content-hashed filename
    //     (`/assets/index-XXXXXXXX.js`), so if a browser/WebView ever
    //     serves a stale `index.html` from its HTTP cache, it'll keep
    //     loading the old bundle hashes — and a CloudFront invalidation
    //     can't reach into a client's local cache to fix it. `no-cache`
    //     forces every page load to revalidate against the origin, which
    //     means new deploys are visible immediately.
    //   - The hashed `assets/index-*.{js,css}` are content-addressed — a
    //     new build emits new filenames — so they're safe to cache for as
    //     long as we like.
    //   - Photos, fonts, and the pitch image (also under `assets/`) share
    //     the 1h cache. They're not content-hashed but they change rarely
    //     and a 1h max-age + CloudFront invalidation on deploy is fine.
    //
    // Pass 1 uploads everything with the 1h cache header and prunes files
    // that no longer exist in the source. Pass 2 re-uploads just
    // `index.html` with `no-cache`, overwriting pass 1's header on that
    // one file. The CloudFront invalidation runs after pass 2 so the
    // edge cache is cleared once both passes have landed.
    const websiteDist = path.join(__dirname, '..', '..', 'dist');

    const longCacheDeployment = new s3deploy.BucketDeployment(this, 'DeployStaticAssets', {
      sources: [
        s3deploy.Source.asset(websiteDist, {
          // macOS Finder leaves these around; harmless but pointless to ship.
          exclude: ['**/.DS_Store'],
        }),
      ],
      destinationBucket: siteBucket,
      prune: true,
      cacheControl: [
        s3deploy.CacheControl.setPublic(),
        s3deploy.CacheControl.maxAge(Duration.hours(1)),
      ],
    });

    const indexHtmlDeployment = new s3deploy.BucketDeployment(this, 'DeployIndexHtml', {
      sources: [
        s3deploy.Source.asset(websiteDist, {
          // Skip everything except `index.html` — we only want this
          // deployment to overwrite the one file's cache headers.
          exclude: ['**/.DS_Store', 'assets/**', 'fonts/**'],
        }),
      ],
      destinationBucket: siteBucket,
      // Don't prune — pass 1 already pruned the bucket, and this source
      // only contains `index.html`, so a prune here would delete every
      // asset under `/assets/` and `/fonts/`.
      prune: false,
      // `no-cache` (despite the name) doesn't mean "don't cache"; it means
      // "cache, but revalidate with the origin every time before serving".
      // That's exactly what we want for the HTML entry point.
      cacheControl: [s3deploy.CacheControl.noCache()],
      // Run the CloudFront invalidation on this deployment so it fires
      // after both uploads have finished.
      distribution,
      distributionPaths: ['/*'],
    });

    // Force ordering so the no-cache `index.html` upload happens after the
    // long-cache pass. Without this CDK could parallelise them and the
    // wrong header could win the race. CDK usually figures this out via
    // implicit dependencies on the shared bucket, but making it explicit
    // is cheap insurance.
    indexHtmlDeployment.node.addDependency(longCacheDeployment);

    new CfnOutput(this, 'Url', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'CloudFront URL — share with Rich for client review.',
    });

    new CfnOutput(this, 'BucketName', {
      value: siteBucket.bucketName,
      description: 'S3 bucket holding the static assets.',
    });

    new CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
      description: 'CloudFront distribution ID — useful for manual invalidations.',
    });
  }
}
