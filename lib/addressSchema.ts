import { z } from "zod";

// Shared between the address form (client-side validation feedback) and
// the create/update Server Actions in app/account/addresses/actions.ts -
// same division of responsibility as lib/orderSchema.ts and
// lib/productSchema.ts.
export const addressFormSchema = z.object({
  label: z.string().trim().max(40).optional(),
  fullName: z.string().trim().min(1, "Name is required").max(120),
  phone: z.string().trim().min(6, "Enter a valid phone number").max(20),
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
