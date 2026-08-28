import { z } from "zod";

// Shared between the address form (client-side validation feedback) and
// the create/update Server Actions in app/account/addresses/actions.ts -
// same division of responsibility as lib/orderSchema.ts and
// lib/productSchema.ts.
export const addressFormSchema = z.object({
  label: z.string().trim().max(40).optional(),
  fullName: z.string().trim().min(1, "Name is required").max(120),
  // Indian mobile numbers: 10 digits starting 6-9, optional +91 prefix -
  // this is a delivery contact number, not a general phone field. Spaces
  // and hyphens are stripped before checking, so "+91 98765 43210" and
  // "9876543210" both validate the same way.
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine((v) => /^(?:\+?91)?[6-9]\d{9}$/.test(v), "Enter a valid 10-digit mobile number"),
  line1: z.string().trim().min(1, "Address line is required").max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  isDefault: z.boolean().optional(),
});

export type AddressFormInput = z.infer<typeof addressFormSchema>;
