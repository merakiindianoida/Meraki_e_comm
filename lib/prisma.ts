import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Stash the client on `globalThis` in dev so Next's hot-reload doesn't spin
// up a fresh PrismaClient (and a fresh connection pool) on every file save —
// Neon's free tier has a low connection ceiling and this burns through it fast.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}