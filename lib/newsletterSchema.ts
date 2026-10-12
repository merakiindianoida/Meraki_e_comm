import { z } from "zod";

export const newsletterFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  company: z.string().max(0).optional(),
});

export type NewsletterFormInput = z.infer<typeof newsletterFormSchema>;
