import * as lambdaEventSources from "@aws-cdk/aws-lambda-event-sources";
import * as nodeLambda from "@aws-cdk/aws-lambda-nodejs";
import * as sqs from "@aws-cdk/aws-sqs";
import * as cdk from "@aws-cdk/core";
import { join } from "path";

export class AppStack extends cdk.NestedStack {
  public workQueue: sqs.Queue;
  public workDQL: sqs.Queue;
  constructor(scope: cdk.Construct, id: string, props?: cdk.NestedStackProps) {
    super(scope, id, props);

    this.workDQL = new sqs.Queue(this, "workDLQ", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      visibilityTimeout: cdk.Duration.seconds(10)
    });
    this.workQueue = new sqs.Queue(this, "workQueue", {
      deadLetterQueue: {
        maxReceiveCount: 1,
        queue: this.workDQL
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      visibilityTimeout: cdk.Duration.seconds(10)
    });

    const drainFunction = new nodeLambda.NodejsFunction(this, "drainFunction", {
      entry: join(__dirname, "./handler.ts"),
      handler: "handler",
      retryAttempts: 0,
      environment: {
        QUEUE_URL: this.workQueue.queueUrl
      }
    });

    drainFunction.addEventSource(
      new lambdaEventSources.SqsEventSource(this.workQueue, {
        batchSize: 1,
        enabled: true
      })
    );
  }
}
