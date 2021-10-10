import * as sqs from "@aws-cdk/aws-sqs";
import * as cdk from "@aws-cdk/core";
import { AppStack } from "./app-stack";
import { TestStack } from "./test-stack";

export class CdkProviderAsyncTestingStack extends cdk.Stack {
  public workQueue: sqs.Queue;
  public workDQL: sqs.Queue;
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const appStack = new AppStack(this, "appStack");

    const testStack = new TestStack(this, "testStack", {
      workDQL: appStack.workDQL,
      workQueue: appStack.workQueue
    });

    testStack.addDependency(appStack);
  }
}
