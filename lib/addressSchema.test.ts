import { describe, it, expect } from "vitest";
import { addressFormSchema } from "./addressSchema";

const base = {
  fullName: "Diya Sharma",
  phone: "9876543210",
  line1: "123 Main Street",
  city: "New Delhi",
  state: "Delhi",
  pincode: "110001",
};

describe("addressFormSchema", () => {
  it("accepts a valid address", () => {
    expect(addressFormSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a pincode that isn't exactly 6 digits", () => {
    expect(addressFormSchema.safeParse({ ...base, pincode: "1100" }).success).toBe(false);
    expect(addressFormSchema.safeParse({ ...base, pincode: "1100011" }).success).toBe(false);
  });

  it("rejects a pincode with non-digit characters", () => {
    expect(addressFormSchema.safeParse({ ...base, pincode: "11000A" }).success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const withoutCity: Record<string, unknown> = { ...base };
    delete withoutCity.city;
    expect(addressFormSchema.safeParse(withoutCity).success).toBe(false);
  });
});
