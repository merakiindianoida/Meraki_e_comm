import { describe, it, expect } from "vitest";
import { slugify, productFormSchema } from "./productSchema";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Fine Box Chain")).toBe("fine-box-chain");
  });

  it("strips punctuation", () => {
    expect(slugify("Men's Rapper Chain")).toBe("men-s-rapper-chain");
  });

  it("collapses repeated separators and trims leading/trailing hyphens", () => {
    expect(slugify("  Green   Chunky, Kundan Ring! ")).toBe("green-chunky-kundan-ring");
  });
});

describe("productFormSchema", () => {
  const base = {
    name: "Test Ring",
    category: "Ring",
    price: 1000,
    stock: 5,
    images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
  };

  it("accepts a minimal valid product", () => {
    expect(productFormSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a category outside the taxonomy", () => {
    const result = productFormSchema.safeParse({ ...base, category: "Crown" });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive price", () => {
    const result = productFormSchema.safeParse({ ...base, price: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative stock", () => {
    const result = productFormSchema.safeParse({ ...base, stock: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects an image that isn't a URL", () => {
    const result = productFormSchema.safeParse({ ...base, images: ["not-a-url"] });
    expect(result.success).toBe(false);
  });

  it("rejects more than 12 images", () => {
    const images = Array.from({ length: 13 }, (_, i) => `https://example.com/${i}.jpg`);
    const result = productFormSchema.safeParse({ ...base, images });
    expect(result.success).toBe(false);
  });
});
