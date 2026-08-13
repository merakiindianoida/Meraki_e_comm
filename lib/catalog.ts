// Shared product taxonomy + display helpers used across the storefront
// (header nav, filter chips, product cards, seed data). Category is a
// free-text column on the Product model, not a DB enum - the client's
// still finalizing the list, so this array is the single place to update
// it rather than a hard schema migration. See prisma/schema.prisma.
export const CATEGORIES = [
  "Nazariya",
  "Bracelet",
  "Bangle",
  "Stud",
  "Nose Pin",
  "Pendant",
  "Chain",
  "Anklet",
  // Added 2026-08-08 importing the client's real catalog - rings,
  // necklaces, toe rings, and non-stud earrings (hooks/drops/jhumkis) never
  // had a home in the original 8, which were sized around the initial
  // seed data rather than the full real product range.
  "Ring",
  "Toe Ring",
  "Necklace",
  "Earrings",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const AUDIENCES = ["Kids", "Men", "Women", "Unisex"] as const;

export type Audience = (typeof AUDIENCES)[number];

// Curated groupings, orthogonal to category/audience (a Bangle could be in
// both "Marriage" and "Birthday Gifting"). Real names from the client;
// Product.collections is migrated and admin-editable, but no customer-facing
// browse-by-collection page exists yet - still shown as "coming soon" in
// the nav for that reason, not because the data layer is missing.
export const COLLECTIONS = ["Birthday Gifting", "Marriage", "Kids Collection"] as const;

export type Collection = (typeof COLLECTIONS)[number];

export type StockStatus = "out_of_stock" | "low_stock" | "in_stock";

const LOW_STOCK_THRESHOLD = 5;

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out_of_stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low_stock";
  return "in_stock";
}

// Strips fields that shouldn't leave the server on the public API - the
// exact stock count would let anyone scrape sell-through rate per product,
// and the SKU's sequential numbering (MRK-ANK-001, 002, ...) leaks total
// catalog size and add order. The site's own pages don't need this (they
// query Prisma directly and only ever render a threshold-limited "Only N
// left" once stock is already low), but a public JSON endpoint is a much
// easier thing to scrape in bulk, so it gets the stricter treatment.
export function toPublicProduct<T extends { sku: string | null; stock: number }>(
  product: T
): Omit<T, "sku" | "stock"> & { availability: StockStatus } {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- destructuring is the omit
  const { sku: _sku, stock, ...rest } = product;
  return { ...rest, availability: stockStatus(stock) };
}

// Prisma's Decimal comes back as a string over the wire in a couple of our
// server components - accept both so callers don't have to think about it.
export function formatPrice(price: number | string) {
  const value = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}
