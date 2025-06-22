import type { Shift } from "./generated/prisma/shard";

export type IncomingShift = Omit<Shift, "id" | "requestId" | "status">;
