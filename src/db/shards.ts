import { PrismaClient as MainClient } from "@prisma/client";
import { PrismaClient as Shard } from "../generated/prisma/shard";

export const mainPrisma = new MainClient();
const shardClients = [
  new Shard({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_SHARD_0,
      },
    },
  }),
  new Shard({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_SHARD_1,
      },
    },
  }),
];

// simple hash -> shard index
export function getShardForKey(key: string) {
  const sum = Array.from(key).reduce((s, c) => s + c.charCodeAt(0), 0);
  return shardClients[sum % shardClients.length];
}

export { shardClients };
