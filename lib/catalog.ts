export const CATEGORIES = [
  "Nazariya",
  "Bracelet",
  "Bangle",
  "Stud",
  "Nose Pin",
  "Pendant",
  "Chain",
  "Anklet",
  "Ring",
  "Toe Ring",
  "Necklace",
  "Earrings",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const AUDIENCES = ["Kids", "Men", "Women", "Unisex"] as const;

export type Audience = (typeof AUDIENCES)[number];

export const COLLECTIONS = ["Birthday Gifting", "Marriage", "Kids Collection"] as const;

export type Collection = (typeof COLLECTIONS)[number];

export type StockStatus = "out_of_stock" | "low_stock" | "in_stock";

const LOW_STOCK_THRESHOLD = 5;

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

export function toPublicProduct<T extends { sku: string | null; stock: number }>(
  product: T
): Omit<T, "sku" | "stock"> & { availability: StockStatus } {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructuring is the omit
  const { sku: _sku, stock, ...rest } = product;
  return { ...rest, availability: stockStatus(stock) };
}

export function formatPrice(price: number | string) {
  const value = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
