import { z } from "zod";

// Same honeypot pattern as contactFormSchema (lib/contactSchema.ts) - a real
// visitor never sees or fills "company", so anything in it means a bot.
export const newsletterFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  company: z.string().max(0).optional(),
});

export type NewsletterFormInput = z.infer<typeof newsletterFormSchema>;
