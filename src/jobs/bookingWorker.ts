import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { API_BASE_URL } from "../config";
import { retry } from "../utils/retry";

const prisma = new PrismaClient();

async function processPendingRequests() {
  const requests = await prisma.bookingRequest.findMany({
    where: {
      status: {
        in: ["pending", "processing"],
      },
    },
    include: { shifts: true },
  });

  for (const request of requests) {
    console.log(`⏳ Processing request ${request.id}`);

    if (request.status === "pending") {
      await prisma.bookingRequest.update({
        where: { id: request.id },
        data: { status: "processing" },
      });
    }

    for (const shift of request.shifts) {
      if (shift.status === "success") continue;

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

        await prisma.shift.update({
          where: { id: shift.id },
          data: { status: "success" },
        });
      } catch (err) {
        await prisma.shift.update({
          where: { id: shift.id },
          data: { status: "failed" },
        });
      }
    }

    const updatedShifts = await prisma.shift.findMany({
      where: { requestId: request.id },
    });

    const allSuccess = updatedShifts.every((s) => s.status === "success");

    await prisma.bookingRequest.update({
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
