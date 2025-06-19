import { PrismaClient as MainClient } from "@prisma/client";
import { PrismaClient as Shard0 } from "../generated/prisma/shard0";
import { PrismaClient as Shard1 } from "../generated/prisma/shard1";

export const mainPrisma = new MainClient();
const shardClients = [new Shard0(), new Shard1()];

// simple hash -> shard index
export function getShardForKey(key: string) {
  const sum = Array.from(key).reduce((s, c) => s + c.charCodeAt(0), 0);
  return shardClients[sum % shardClients.length];
}

export { shardClients };
