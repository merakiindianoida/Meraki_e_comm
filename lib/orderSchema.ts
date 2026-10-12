import { z } from "zod";
import { addressFormSchema } from "@/lib/addressSchema";

export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(20),
});

export const newAddressSchema = addressFormSchema.omit({ label: true, isDefault: true });

export const createOrderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1, "Your bag is empty").max(20),
    addressId: z.string().uuid().optional(),
    newAddress: newAddressSchema.optional(),
    whatsappUpdatesOptIn: z.boolean().optional().default(false),
  })
  .refine((data) => Boolean(data.addressId) || Boolean(data.newAddress), {
    message: "Choose a delivery address or enter one",
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
