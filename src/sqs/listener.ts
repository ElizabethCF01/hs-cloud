import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";
import { AWS_REGION, SQS_QUEUE_URL } from "../config";

const sqs = new SQSClient({ region: AWS_REGION });

export async function startQueueListener() {
  console.log("🟢 SQS listener started");
  while (true) {
    const { Messages } = await sqs.send(
      new ReceiveMessageCommand({
        QueueUrl: SQS_QUEUE_URL,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      })
    );
    if (Messages) {
      for (const m of Messages) {
        console.log("📥 Received:", m.Body);
        if (m.ReceiptHandle) {
          await sqs.send(
            new DeleteMessageCommand({
              QueueUrl: SQS_QUEUE_URL,
              ReceiptHandle: m.ReceiptHandle,
            })
          );
        }
      }
    }
  }
}
