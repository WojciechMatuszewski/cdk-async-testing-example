import SQS from "aws-sdk/clients/sqs";
import type { CloudFormationCustomResourceEvent } from "aws-lambda";

const sqs = new SQS();
export const handler = async (
  event: CloudFormationCustomResourceEvent
): Promise<{ IsComplete: boolean }> => {
  if (event.RequestType === "Delete") {
    return { IsComplete: true };
  }

  const { Version } = event.ResourceProperties;

  console.log({ Version });

  const { Attributes } = await sqs
    .getQueueAttributes({
      QueueUrl: process.env.QUEUE_URL as string,
      AttributeNames: ["All"]
    })
    .promise();

  console.log({ Attributes });

  if (!Attributes) {
    return { IsComplete: false };
  }

  if (Attributes.ApproximateNumberOfMessages !== "1") {
    return { IsComplete: false };
  }

  if (Attributes.ApproximateNumberOfMessagesNotVisible !== "0") {
    return { IsComplete: false };
  }

  const { Messages } = await sqs
    .receiveMessage({
      QueueUrl: process.env.QUEUE_URL as string,
      MaxNumberOfMessages: 1,
      AttributeNames: ["All"]
    })
    .promise();

  console.log({ Messages });

  if (!Messages) {
    return { IsComplete: false };
  }

  const testMessage = Messages.find(
    message => JSON.parse(message.Body ?? "{}").id == `${Version}-bad`
  );
  if (testMessage) {
    console.log("Test message found");

    await sqs
      .deleteMessage({
        QueueUrl: process.env.QUEUE_URL as string,
        ReceiptHandle: testMessage.ReceiptHandle as string
      })
      .promise();

    return { IsComplete: true };
  }

  return { IsComplete: false };
};
