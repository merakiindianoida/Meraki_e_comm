import { z } from "zod";

// Same honeypot trick as contactFormSchema - "company" should always be empty.
export const newsletterFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  company: z.string().max(0).optional(),
});

export type NewsletterFormInput = z.infer<typeof newsletterFormSchema>;
