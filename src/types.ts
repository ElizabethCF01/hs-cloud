import type { Shift } from "./generated/prisma/shard0";

export type IncomingShift = Omit<Shift, "id" | "requestId" | "status">;
