import { mainPrisma, getShardForKey } from "../db/shards";
import { IncomingShift } from "../types";

export async function createBookingRequestWithShifts(shifts: IncomingShift[]) {
  const parsedShifts = shifts.map((shift) => ({
    ...shift,
    startTime: new Date(shift.startTime),
    endTime: new Date(shift.endTime),
    status: "pending" as const,
  }));

  const bookingRequest = await mainPrisma.bookingRequest.create({
    data: {},
  });

  for (const shift of parsedShifts) {
    const client = getShardForKey(shift.userId);
    await client.shift.create({
      data: { ...shift, requestId: bookingRequest.id },
    });
  }

  return bookingRequest;
}
