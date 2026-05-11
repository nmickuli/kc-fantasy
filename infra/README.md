# Infra — temporary S3 + CloudFront hosting

AWS CDK app that provisions an S3 bucket and a CloudFront distribution to host
the KC Current Fantasy prototype during the client-review window. **Throw-away
infrastructure** — tear it down with `npm run destroy` once the project
migrates to AWS Amplify.

## What this stack creates

- **S3 bucket** (private, encrypted with SSE-S3, public access blocked)
- **CloudFront distribution** in front of the bucket, with:
  - Origin Access Control (OAC) so CloudFront is the only thing that can read
    from the bucket
  - HTTPS-only at the edge (HTTP → HTTPS redirect)
  - SPA fallback via `errorResponses`: 403/404 from S3 → 200 + `/index.html`
    so React Router routes survive a hard refresh
  - `CACHING_OPTIMIZED` default behaviour + gzip/brotli compression
  - Price class 100 (US + EU edge locations only) — cheap, fine for a demo
- **BucketDeployment** that syncs `../dist/` into the bucket and invalidates
  the distribution on every `cdk deploy`

`removalPolicy: DESTROY` + `autoDeleteObjects: true` mean a single
`cdk destroy` cleans up everything. No console cleanup afterwards.

## Prerequisites

- Node 18+ (a `.nvmrc` at the repo root pins Node 22 — `nvm use` from the
  repo root)
- AWS CLI installed and authenticated (`aws sts get-caller-identity` should
  return your YinzCam account)
- `npm install` inside this directory
- `cdk bootstrap` run once per account/region you deploy to (see below)

```bash
cd infra
npm install
```

## First-time setup: bootstrap the account

CDK needs a small set of resources (a staging S3 bucket + IAM roles) in each
account/region you target. Run this once per account/region:

```bash
npm run bootstrap
# equivalent: cdk bootstrap aws://ACCOUNT/REGION
```

If you've used CDK before in this YinzCam account in `us-east-1`, this is
already done.

## Deploy

From this directory:

```bash
npm run deploy
```

That script:

1. Runs `npm run build` at the repo root → fresh `../dist/`
2. Runs `cdk deploy` → creates/updates the stack, uploads `dist/` to S3,
   invalidates CloudFront

On success, the CLI prints the CloudFront URL as a stack output:

```
Outputs:
KcFantasyStack.Url = https://dXXXXXXXXXXXXX.cloudfront.net
KcFantasyStack.BucketName = kcfantasystack-sitebucket-XXXXXXXX
KcFantasyStack.DistributionId = EXXXXXXXXXXX
```

The first deploy takes ~5 minutes (CloudFront propagation). Subsequent deploys
take ~30s once the distribution exists — `cdk deploy` only updates what
changed, and the cache invalidation propagates in seconds.

## Verify the SPA fallback works

After the URL is live, paste it into the browser and navigate to
`/select-team`, then hit hard refresh (⌘⇧R). If the screen re-renders
correctly (not a 404 or the CloudFront error page), the SPA fallback is
wired up. If you see a 404, something's wrong with the `errorResponses`
config in `lib/kc-fantasy-stack.ts` — open an issue.

## Iterate

Just re-run `npm run deploy`. The bucket and distribution stick around;
CDK only redeploys the changed files and triggers a `/*` invalidation. Each
deploy is ~30 seconds end-to-end after the first one.

## Tear down

```bash
npm run destroy
```

This empties the bucket (via the `autoDeleteObjects` custom resource),
deletes the bucket, deletes the CloudFront distribution, and removes the
stack. There's nothing to clean up in the console afterwards.

> Note: deleting a CloudFront distribution takes ~5 minutes (the disable +
> delete flow). `cdk destroy` waits it out.

## Customising

- **Custom domain (`fantasy.kccurrent.com` etc.):** add a `certificate` and
  `domainNames` to the `Distribution` construct, plus an ACM cert in
  `us-east-1` (CloudFront requirement). Skipped here because the prototype
  is being shared via the auto-generated `*.cloudfront.net` URL.
- **More edge locations:** bump `priceClass` to `PRICE_CLASS_ALL`.
- **Different region for the bucket:** set `CDK_DEFAULT_REGION` or pass
  `--region` to the CDK CLI. The bucket region only affects origin latency;
  CloudFront's POPs are global regardless.
