import SQS from "aws-sdk/clients/sqs";
import type { CloudFormationCustomResourceEvent } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";

const sqs = new SQS();

export const handler = async (event: CloudFormationCustomResourceEvent) => {
  const { RequestType } = event;
  if (RequestType === "Delete") {
    return;
  }

  const { Version } = event.ResourceProperties;

  console.log({ Version });

  console.log("Sending the messages");
  const result = await sqs
    .sendMessageBatch({
      Entries: [
        {
          Id: uuidv4(),
          MessageBody: JSON.stringify({
            destination: "ok@ok.com",
            id: `${Version}-good`
          })
        },
        {
          Id: uuidv4(),
          MessageBody: JSON.stringify({
            destination: "fail@fail.com",
            id: `${Version}-bad`
          })
        }
      ],
      QueueUrl: process.env.QUEUE_URL as string
    })
    .promise();

  console.log("Messages sent!", {
    failed: result.Failed,
    successful: result.Successful
  });
};
