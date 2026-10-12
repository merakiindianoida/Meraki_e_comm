import { z } from "zod";
import { CATEGORIES, AUDIENCES } from "@/lib/catalog";

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  category: z.enum(CATEGORIES, { error: "Choose a category" }),
  audience: z.enum(AUDIENCES).optional(),
  description: z.string().trim().max(2000).optional(),
  price: z.coerce.number().positive("Price must be greater than 0"),
  weightGrams: z.coerce.number().positive().optional(),
  purity: z.string().trim().max(50).optional(),
  sku: z.string().trim().max(50).optional(),
  stock: z.coerce.number().int().min(0, "Stock can't be negative"),
  images: z
    .array(z.string().trim().url("Each image must be a valid URL"))
    .max(12, "That's a lot of images — trim it down a little"),
  collections: z.array(z.string()).optional(),
  // Local video paths are for development; production clips use Cloudinary URLs.
  videoUrl: z.string().trim().max(500).optional(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
