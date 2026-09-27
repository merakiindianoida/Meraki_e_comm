import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export type RateRule = { name: string; limit: number; windowSeconds: number };

// Limits agreed with the client 2026-09-28.
export const RATE_RULES = {
  contactShort: { name: "contact-10m", limit: 3, windowSeconds: 10 * 60 },
  contactDaily: { name: "contact-1d", limit: 10, windowSeconds: 24 * 60 * 60 },
  newsletter: { name: "newsletter-1h", limit: 5, windowSeconds: 60 * 60 },
  placeOrder: { name: "order-10m", limit: 5, windowSeconds: 10 * 60 },
} satisfies Record<string, RateRule>;

export const RATE_LIMIT_MESSAGE = "Too many attempts. Please try again in a few minutes.";

// Vercel sets x-forwarded-for itself, so the first entry is the real client address.
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

// One atomic upsert per check: resets the window once it has expired, otherwise bumps the count.
async function hit(rule: RateRule, id: string): Promise<boolean> {
  const key = `${rule.name}:${id}`;
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "windowStart")
    VALUES (${key}, 1, NOW())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimit"."windowStart" < NOW() - (${rule.windowSeconds}::int * INTERVAL '1 second') THEN 1
        ELSE "RateLimit"."count" + 1
      END,
      "windowStart" = CASE
        WHEN "RateLimit"."windowStart" < NOW() - (${rule.windowSeconds}::int * INTERVAL '1 second') THEN NOW()
        ELSE "RateLimit"."windowStart"
      END
    RETURNING "count"`;
  return Number(rows[0]?.count ?? 0) <= rule.limit;
}

// Returns true if allowed. Fails open - a database hiccup should never block a real customer.
export async function checkRateLimit(id: string, ...rules: RateRule[]): Promise<boolean> {
  try {
    for (const rule of rules) {
      if (!(await hit(rule, id))) return false;
    }
    // Occasional sweep so expired counters don't pile up forever.
    if (Math.random() < 0.01) {
      await prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "windowStart" < NOW() - INTERVAL '2 days'`;
    }
    return true;
  } catch (error) {
    console.error("Rate limit check failed, allowing request:", error);
    return true;
  }
}
