#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { KcFantasyStack } from '../lib/kc-fantasy-stack';

const app = new cdk.App();

new KcFantasyStack(app, 'KcFantasyStack', {
  env: {
    // Picks up from your AWS profile / env (`AWS_PROFILE`, `aws configure`).
    // CloudFront certs and OAC don't care about region, but the S3 bucket
    // does. Default to us-east-1 unless you explicitly set CDK_DEFAULT_REGION
    // or AWS_REGION.
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
  },
  description:
    'Temporary S3 + CloudFront hosting for the KC Current Fantasy prototype. ' +
    'Throw-away — destroy with `npm run destroy` once the project moves to Amplify.',
  tags: {
    Project: 'kc-current-fantasy',
    Owner: 'yinzcam-labs',
    Lifecycle: 'prototype',
  },
});
