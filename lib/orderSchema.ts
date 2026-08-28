import { z } from "zod";
import { addressFormSchema } from "@/lib/addressSchema";

// Shared between the checkout form (client-side validation) and
// POST /api/orders (the source of truth). Only shape/format is validated
// here - price and stock are never trusted from the client and get
// recomputed server-side against the DB in the route itself.
export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(20),
});

// Same fields as a saved Address, minus label/isDefault - those only make
// sense in the address book, not for a one-off entry typed at checkout.
export const newAddressSchema = addressFormSchema.omit({ label: true, isDefault: true });

// No name/email fields - checkout requires a signed-in Clerk user (enforced
// in proxy.ts and re-checked in the route itself), so name/email come from
// the authenticated session server-side, never from the request body.
//
// Delivery details come one of two ways: a saved Address (addressId, looked
// up and ownership-checked server-side in the route) or a one-off newAddress
// typed directly into the checkout form (saved for reuse there - see
// POST /api/orders). Exactly one of the two must be present - enforced
// below with .refine() since a plain object shape can't express "this OR
// that" on its own.
export const createOrderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1, "Your bag is empty").max(20),
    addressId: z.string().uuid().optional(),
    newAddress: newAddressSchema.optional(),
  })
  .refine((data) => Boolean(data.addressId) || Boolean(data.newAddress), {
    message: "Choose a delivery address or enter one",
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
