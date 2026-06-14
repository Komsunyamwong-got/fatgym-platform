import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

// Use WebSocket polyfill for local Node.js environment
neonConfig.webSocketConstructor = ws;

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || "";
  
  // Use Neon adapter only if the connection string contains 'neon.tech'
  // or if we are clearly running on Vercel. For local docker postgres, use standard PrismaClient.
  if (connectionString.includes("neon.tech") || process.env.VERCEL) {
    const adapter = new PrismaNeon({ connectionString } as any);
    return new PrismaClient({ adapter });
  }
  
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;
