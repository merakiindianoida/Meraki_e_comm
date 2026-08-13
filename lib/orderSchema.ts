import { z } from "zod";

// Shared between the checkout form (client-side validation) and
// POST /api/orders (the source of truth). Only shape/format is validated
// here — price and stock are never trusted from the client and get
// recomputed server-side against the DB in the route itself.
export const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(20),
});

// No name/email fields — checkout requires a signed-in Clerk user (enforced
// in proxy.ts and re-checked in the route itself), so name/email come from
// the authenticated session server-side, never from the request body.
//
// Delivery details come one of two ways: a saved Address (addressId, looked
// up and ownership-checked server-side in the route) or a one-off phone +
// shippingAddress pair typed directly into the checkout form. Exactly one
// of the two must be present — enforced below with .refine() since a plain
// object shape can't express "this OR that" on its own.
export const createOrderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1, "Your bag is empty").max(20),
    addressId: z.string().uuid().optional(),
    phone: z.string().trim().min(6, "Enter a valid phone number").max(20).optional(),
    shippingAddress: z
      .string()
      .trim()
      .min(10, "Enter your full address")
      .max(500)
      .optional(),
  })
  .refine((data) => Boolean(data.addressId) || Boolean(data.phone && data.shippingAddress), {
    message: "Choose a delivery address or enter one",
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
