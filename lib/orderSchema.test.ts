import { describe, it, expect } from "vitest";
import { createOrderSchema } from "./orderSchema";

const items = [{ productId: "123e4567-e89b-12d3-a456-426614174000", quantity: 1 }];

describe("createOrderSchema", () => {
  it("accepts a saved addressId with no phone/shippingAddress", () => {
    const result = createOrderSchema.safeParse({
      items,
      addressId: "123e4567-e89b-12d3-a456-426614174001",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a one-off phone + shippingAddress with no addressId", () => {
    const result = createOrderSchema.safeParse({
      items,
      phone: "9876543210",
      shippingAddress: "123 Main Street, Delhi, 110001",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when neither addressId nor phone+shippingAddress is given", () => {
    const result = createOrderSchema.safeParse({ items });
    expect(result.success).toBe(false);
  });

  it("rejects an empty cart", () => {
    const result = createOrderSchema.safeParse({
      items: [],
      addressId: "123e4567-e89b-12d3-a456-426614174001",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a quantity above the max", () => {
    const result = createOrderSchema.safeParse({
      items: [{ productId: items[0].productId, quantity: 21 }],
      addressId: "123e4567-e89b-12d3-a456-426614174001",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid productId", () => {
    const result = createOrderSchema.safeParse({
      items: [{ productId: "not-a-uuid", quantity: 1 }],
      addressId: "123e4567-e89b-12d3-a456-426614174001",
    });
    expect(result.success).toBe(false);
  });
});
