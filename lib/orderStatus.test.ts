import { describe, expect, it } from "vitest";
import {
  canAdminTransitionOrderStatus,
  canCustomerCancelOrder,
} from "@/lib/orderStatus";

describe("order status transitions", () => {
  it("allows admins to correct PACKED back to PAID", () => {
    expect(canAdminTransitionOrderStatus("PACKED", "PAID")).toBe(true);
  });

  it("keeps the normal fulfillment path moving forward", () => {
    expect(canAdminTransitionOrderStatus("PACKED", "SHIPPED")).toBe(true);
    expect(canAdminTransitionOrderStatus("SHIPPED", "DELIVERED")).toBe(true);
  });

  it("does not let admins reverse a shipment", () => {
    expect(canAdminTransitionOrderStatus("SHIPPED", "PACKED")).toBe(false);
  });
});

describe("customer cancellation after packing", () => {
  it("allows pending or paid orders that have never been packed", () => {
    expect(canCustomerCancelOrder("PENDING", null)).toBe(true);
    expect(canCustomerCancelOrder("PAID", null)).toBe(true);
  });

  it("keeps cancellation locked after an admin reverts a packed order to paid", () => {
    expect(canCustomerCancelOrder("PAID", new Date("2026-10-12T00:00:00Z"))).toBe(false);
  });
});
