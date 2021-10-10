import { SQSEvent } from "aws-lambda";
import SQS from "aws-sdk/clients/sqs";

const sqs = new SQS();

export const handler = async (event: SQSEvent) => {
  console.log({ event });
  const promises = event.Records.map(async record => {
    console.log("reading", record);

    if (!record.body) {
      console.log("No body!", record);
      return;
    }

    const messageBody = JSON.parse(record.body);
    if (!messageBody.id) {
      console.log("No id within the body", record);
      return;
    }

    if (messageBody.id.includes("good")) {
      return await sqs
        .deleteMessage({
          QueueUrl: process.env.QUEUE_URL as string,
          ReceiptHandle: record.receiptHandle
        })
        .promise();
    }

    console.log("throwing");
    throw new Error("boom!");
  });

  const results = await Promise.allSettled(promises);
  const hasErrors = results.find(result => result.status === "rejected");
  if (hasErrors) {
    throw new Error("Errors");
  }

  return;
};
