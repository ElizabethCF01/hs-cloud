import { Shift } from "@prisma/client";

export type IncomingShift = Omit<Shift, "id" | "requestId" | "status">;
