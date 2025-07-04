import { mainPrisma, shardClients, getShardForKey } from "../db/shards";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { retry } from "../utils/retry";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { AWS_REGION, SQS_QUEUE_URL } from "../config";

const sqs = new SQSClient({ region: AWS_REGION });

async function processPendingRequests() {
  const requests = await mainPrisma.bookingRequest.findMany({
    where: {
      status: {
        in: ["pending", "processing"],
      },
    },
  });

  for (const request of requests) {
    console.log(`⏳ Processing request ${request.id}`);

    if (request.status === "pending") {
      await mainPrisma.bookingRequest.update({
        where: { id: request.id },
        data: { status: "processing" },
      });
    }

    let allShifts = [];
    for (const client of shardClients) {
      const s = await client.shift.findMany({
        where: { requestId: request.id },
      });
      allShifts.push(...s);
    }

    for (const shift of allShifts) {
      if (shift.status === "success") continue;
      const shardClient = getShardForKey(shift.userId);

      try {
        await retry(() =>
          axios.post(`${API_BASE_URL}/shift`, {
            companyId: shift.companyId,
            userId: shift.userId,
            startTime: shift.startTime,
            endTime: shift.endTime,
            action: shift.action,
          })
        );

        // Update shift status and enqueue outbox record atomically
        const created = await shardClient.$transaction(async (tx: any) => {
          const updated = await tx.shift.update({
            where: { id: shift.id },
            data: { status: "success" },
          });
          await tx.outbox.create({
            data: {
              aggregateId: updated.id,
              eventType: "ShiftProcessed",
              payload: updated,
            },
          });
          return updated;
        });
      } catch (err) {
        await shardClient.shift.update({
          where: { id: shift.id },
          data: { status: "failed" },
        });
      }
    }

    let statuses = [];
    for (const client of shardClients) {
      const s = await client.shift.findMany({
        where: { requestId: request.id },
      });
      statuses.push(...s.map((x) => x.status));
    }

    const allSuccess = statuses.every((st) => st === "success");

    await mainPrisma.bookingRequest.update({
      where: { id: request.id },
      data: { status: allSuccess ? "done" : "processing" },
    });

    console.log(
      allSuccess
        ? `✅ Request ${request.id} is fully processed`
        : `🔁 Request ${request.id} still has pending/failed shifts`
    );
  }
}

export { processPendingRequests };
