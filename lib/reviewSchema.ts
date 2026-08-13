import { z } from "zod";

// Shared between the review form (client-side validation feedback) and
// submitReview in app/orders/actions.ts - same division of responsibility
// as the other *Schema.ts files in this directory.
export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Choose a rating").max(5),
  comment: z.string().trim().max(500).optional(),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
