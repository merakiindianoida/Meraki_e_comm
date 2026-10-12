import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email"),
  message: z.string().trim().min(10, "Tell us a bit more").max(2000),
  company: z.string().max(0).optional(),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;
