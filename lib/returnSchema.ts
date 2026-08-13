import { z } from "zod";

// Shared between the return-request form (client-side validation feedback)
// and requestReturn in app/orders/actions.ts — same division of
// responsibility as the other *Schema.ts files in this directory.
export const returnRequestSchema = z.object({
  reason: z.string().trim().min(10, "Tell us a bit more about why").max(500),
});

export type ReturnRequestInput = z.infer<typeof returnRequestSchema>;
