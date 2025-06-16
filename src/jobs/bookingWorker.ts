import { PrismaClient } from "@prisma/client";

import axios from "axios";
import { API_BASE_URL } from "../config";
import { retry } from "../utils/retry";

const prisma = new PrismaClient();

async function processPendingRequests() {
  const pendingRequests = await prisma.bookingRequest.findMany({
    where: { status: "pending" },
    include: { shifts: true },
  });

  for (const request of pendingRequests) {
    console.log(`⏳ Processing request ${request.id}`);

    await prisma.bookingRequest.update({
      where: { id: request.id },
      data: { status: "processing" },
    });

    let allSuccess = true;

    for (const shift of request.shifts) {
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
        allSuccess = false;
        await prisma.shift.update({
          where: { id: shift.id },
          data: { status: "failed" },
        });
      }
    }

    await prisma.bookingRequest.update({
      where: { id: request.id },
      data: { status: allSuccess ? "done" : "failed" },
    });

    console.log(`✅ Finished request ${request.id}`);
  }
}

export { processPendingRequests };
