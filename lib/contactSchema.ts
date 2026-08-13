import { z } from "zod";

// Shared between ContactForm (client-side validation feedback) and
// submitContact in app/contact/actions.ts — same division of
// responsibility as the other *Schema.ts files in this directory.
// `company` is a honeypot: a real visitor never sees or fills this field
// (hidden via CSS), so anything in it means a bot filled every input it
// could find — reject silently rather than telling the bot why.
export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().trim().min(10, "Tell us a bit more").max(2000),
  company: z.string().max(0).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
