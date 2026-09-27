import { describe, expect, it } from "vitest";
import { isWithinReturnWindow } from "@/lib/returnWindow";

const delivered = new Date("2026-09-01T10:00:00Z");

describe("isWithinReturnWindow", () => {
  it("is open on delivery day and right up to 7 days later", () => {
    expect(isWithinReturnWindow(delivered, delivered)).toBe(true);
    expect(isWithinReturnWindow(delivered, new Date("2026-09-08T10:00:00Z"))).toBe(true);
  });

  it("closes after 7 days", () => {
    expect(isWithinReturnWindow(delivered, new Date("2026-09-08T10:00:01Z"))).toBe(false);
    expect(isWithinReturnWindow(delivered, new Date("2026-10-01T00:00:00Z"))).toBe(false);
  });

  it("stays open when the delivery date is unknown", () => {
    expect(isWithinReturnWindow(null)).toBe(true);
  });
});
