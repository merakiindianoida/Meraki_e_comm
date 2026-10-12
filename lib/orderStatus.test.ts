import { describe, expect, it } from "vitest";
import {
  canAdminTransitionOrderStatus,
  canCustomerCancelOrder,
  isForwardOrderTransition,
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

  it("lets admins mark a cancelled order refunded", () => {
    expect(canAdminTransitionOrderStatus("CANCELLED", "REFUNDED")).toBe(true);
  });

  it("does not allow a completed refund to move back", () => {
    expect(canAdminTransitionOrderStatus("REFUNDED", "CANCELLED")).toBe(false);
  });

  it("sends notifications only for forward stage changes", () => {
    expect(isForwardOrderTransition("PAID", "PACKED")).toBe(true);
    expect(isForwardOrderTransition("CANCELLED", "REFUNDED")).toBe(true);
    expect(isForwardOrderTransition("PACKED", "PAID")).toBe(false);
    expect(isForwardOrderTransition("SHIPPED", "SHIPPED")).toBe(false);
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
