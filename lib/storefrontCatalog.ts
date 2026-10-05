import { CATEGORIES } from "@/lib/catalog";

const HIDDEN_STOREFRONT_CATEGORIES = ["Bangle", "Nose Pin"] as const;

export const STOREFRONT_CATEGORIES = CATEGORIES.filter(
  (c) => !(HIDDEN_STOREFRONT_CATEGORIES as readonly string[]).includes(c)
);

export type StorefrontCategory = (typeof STOREFRONT_CATEGORIES)[number];
