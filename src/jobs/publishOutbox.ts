import { shardClients } from "../db/shards";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { AWS_REGION, SQS_QUEUE_URL } from "../config";

const sqs = new SQSClient({ region: AWS_REGION });

export async function processOutbox() {
  for (const client of shardClients) {
    const events = await client.outbox.findMany({
      where: { published: false },
    });
    for (const event of events) {
      await sqs.send(
        new SendMessageCommand({
          QueueUrl: SQS_QUEUE_URL,
          MessageBody: JSON.stringify(event.payload as object),
          MessageGroupId: event.aggregateId,
          MessageDeduplicationId: event.id,
        })
      );
      await client.outbox.update({
        where: { id: event.id },
        data: { published: true },
      });
    }
  }
}
