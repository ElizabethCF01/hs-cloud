import { PrismaClient } from "@prisma/client";
import { IncomingShift } from "../types";
const prisma = new PrismaClient();

export async function createBookingRequestWithShifts(shifts: IncomingShift[]) {
  const parsedShifts = shifts.map((shift) => ({
    ...shift,
    startTime: new Date(shift.startTime),
    endTime: new Date(shift.endTime),
    status: "pending" as const,
  }));

  const bookingRequest = await prisma.bookingRequest.create({
    data: {
      shifts: {
        create: parsedShifts,
      },
    },
  });

  return bookingRequest;
}
