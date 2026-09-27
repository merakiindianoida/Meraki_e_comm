import { POLICY } from "@/lib/siteInfo";

const DAY_MS = 24 * 60 * 60 * 1000;

export function returnDeadline(deliveredAt: Date): Date {
  return new Date(deliveredAt.getTime() + POLICY.returnWindowDays * DAY_MS);
}

// A missing deliveredAt never locks a customer out - it only means we don't know when it arrived.
export function isWithinReturnWindow(deliveredAt: Date | null, now: Date = new Date()): boolean {
  if (!deliveredAt) return true;
  return now.getTime() <= returnDeadline(deliveredAt).getTime();
}
