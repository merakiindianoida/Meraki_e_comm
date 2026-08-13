import { z } from "zod";
import { CATEGORIES, AUDIENCES } from "@/lib/catalog";

// Shared between the admin product form (client-side validation feedback)
// and the create/update Server Actions (the source of truth) - same
// division of responsibility as lib/orderSchema.ts.
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
  // Not URL-validated like images - a local /videos/... path is valid
  // during testing (see components/ShoppableVideoFeed.tsx), a Cloudinary
  // URL is what production actually uses.
  videoUrl: z.string().trim().max(500).optional(),
});

export type ProductFormInput = z.infer<typeof productFormSchema>;

// Turns "Fine Box Chain" into "fine-box-chain" - same convention the seed
// data already uses. Collisions get a numeric suffix in the caller.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
