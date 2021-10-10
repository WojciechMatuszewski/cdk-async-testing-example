import * as cdk from "@aws-cdk/core";
import * as sqs from "@aws-cdk/aws-sqs";
import * as nodeLambda from "@aws-cdk/aws-lambda-nodejs";
import * as lambda from "@aws-cdk/aws-lambda";
import * as lambdaEventSources from "@aws-cdk/aws-lambda-event-sources";
import * as httpApi from "@aws-cdk/aws-apigatewayv2";
import * as httpApiIntegrations from "@aws-cdk/aws-apigatewayv2-integrations";
import * as customResources from "@aws-cdk/custom-resources";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

interface TestStackProps extends cdk.NestedStackProps {
  workQueue: sqs.Queue;
  workDQL: sqs.Queue;
}

export class TestStack extends cdk.NestedStack {
  constructor(scope: cdk.Construct, id: string, props: TestStackProps) {
    super(scope, id, props);

    const { workQueue, workDQL } = props;

    const initTestFunction = new nodeLambda.NodejsFunction(
      this,
      "initTestFunction",
      {
        entry: join(__dirname, "init-test.ts"),
        handler: "handler",
        environment: {
          QUEUE_NAME: workQueue.queueName,
          QUEUE_ARN: workQueue.queueArn,
          QUEUE_URL: workQueue.queueUrl
        }
      }
    );
    workQueue.grantSendMessages(initTestFunction);

    const assertFunction = new nodeLambda.NodejsFunction(
      this,
      "assertDLQFunction",
      {
        entry: join(__dirname, "assert-function.ts"),
        handler: "handler",
        environment: {
          QUEUE_NAME: workDQL.queueName,
          QUEUE_ARN: workDQL.queueArn,
          QUEUE_URL: workDQL.queueUrl
        }
      }
    );
    workDQL.grantConsumeMessages(assertFunction);

    const testProvider = new customResources.Provider(this, "testProvider", {
      onEventHandler: initTestFunction,
      isCompleteHandler: assertFunction,
      totalTimeout: cdk.Duration.minutes(1)
    });

    const initTestFunctionResource = new cdk.CustomResource(
      this,
      "initTestFunctionResource",
      {
        properties: { Version: uuidv4() },
        serviceToken: testProvider.serviceToken,
        removalPolicy: cdk.RemovalPolicy.DESTROY
      }
    );
  }
}
