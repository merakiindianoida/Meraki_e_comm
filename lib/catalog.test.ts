import { describe, it, expect } from "vitest";
import { stockStatus, toPublicProduct, formatPrice, AUDIENCES } from "./catalog";

describe("stockStatus", () => {
  it("is out_of_stock at zero or below", () => {
    expect(stockStatus(0)).toBe("out_of_stock");
    expect(stockStatus(-1)).toBe("out_of_stock");
  });

  it("is low_stock at or under the threshold", () => {
    expect(stockStatus(1)).toBe("low_stock");
    expect(stockStatus(5)).toBe("low_stock");
  });

  it("is in_stock above the threshold", () => {
    expect(stockStatus(6)).toBe("in_stock");
    expect(stockStatus(100)).toBe("in_stock");
  });
});

describe("toPublicProduct", () => {
  it("strips sku and exact stock, replacing stock with an availability bucket", () => {
    const result = toPublicProduct({ sku: "MRK-001", stock: 3, name: "Test" });
    expect(result).not.toHaveProperty("sku");
    expect(result).not.toHaveProperty("stock");
    expect(result).toEqual({ name: "Test", availability: "low_stock" });
  });

  it("handles a null sku", () => {
    const result = toPublicProduct({ sku: null, stock: 20, name: "Test" });
    expect(result.availability).toBe("in_stock");
  });
});

describe("formatPrice", () => {
  it("formats a number as rupees with no decimals", () => {
    expect(formatPrice(4500)).toBe("₹4,500");
  });

  it("formats a Prisma Decimal-as-string the same way", () => {
    expect(formatPrice("4500")).toBe("₹4,500");
  });

  it("handles large amounts with correct grouping", () => {
    expect(formatPrice(1250000)).toBe("₹12,50,000");
  });
});

describe("AUDIENCES", () => {
  it("no longer includes Elders", () => {
    expect(AUDIENCES).not.toContain("Elders");
  });

  it("has exactly the four current audiences", () => {
    expect([...AUDIENCES].sort()).toEqual(["Kids", "Men", "Unisex", "Women"]);
  });
});
