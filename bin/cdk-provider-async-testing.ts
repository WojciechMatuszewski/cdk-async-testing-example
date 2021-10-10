#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { CdkProviderAsyncTestingStack } from "../lib/cdk-provider-async-testing-stack";

const app = new cdk.App();
new CdkProviderAsyncTestingStack(app, "CdkProviderAsyncTestingStack");
