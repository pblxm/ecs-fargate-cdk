#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { FargateStack } from './lib/fargate-stack';

const app = new cdk.App();
new FargateStack(app, 'FargateStack', {});