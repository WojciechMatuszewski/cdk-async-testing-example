# Async testing via providers framework example

This repo contains an example of how one might colocate integration/e2e tests along side infrastructure.
Inspired by [this article](https://dev.to/aws-builders/testing-the-async-cloud-with-aws-cdk-33aj) and [this repository](https://github.com/elthrasher/cdk-async-testing-example).

There are pros and cons to this approach. I have whole document dedicated to testing asynchronous flows.
The [document I'm referring to can be found here](https://github.com/WojciechMatuszewski/programming-notes/blob/master/aws/serverless/testing-serverless.md).

## Deployment

1. Bootstrap the AWS environment

   ```sh
   npm run bootstrap
   ```

2. Deploy the app (this step will also run the tests)

   ```sh
   npm run deploy
   ```

## Breaking the tests

The tests are run every-time the infrastructure is deployed. Try making changes to `lib/assert-function.ts` and see if you can break the deployment.

## Learnings

- Since our objective is to have tests for a given stack live next to that stack, `NestedStack` seems to be a way to go.
  The coupling that `NestedStack` introduces makes the relation between those two explicit.

- Reading and asserting on the DLQ, while precise, requires us to provision a "test-only" DLQ.
  We would not want to read messages from the production infrastructure as it might disrupt the flow of the production logic.

- The top `Id` property within the `sendMessageBatch` API is not the same as `messageId`.
  The top `Id` property is used to identify a message in batch. You would use that property to get the messages that failed to be sent within a given batch.

- Holy shit it takes long for the resources related to the _provider framework_ to deploy.
