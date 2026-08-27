import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/orderSchema";
import { createPhonePeOrder } from "@/lib/phonepe";

// Checkout requires a signed-in Clerk user (proxy.ts redirects anonymous
// visitors to /sign-in before they ever reach this route) - but proxy is
// only an optimistic check, so this route re-verifies the session itself
// rather than trusting that request even got here legitimately.

// Distinguishes "this order can't be placed as requested" (bad but
// expected - sold out mid-checkout) from a genuine server fault, so the
// catch block below can return the right status/message for each instead
// of collapsing everything into a generic 500.
class OrderError extends Error {}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to place an order." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid order" },
      { status: 400 }
    );
  }

  const { items, addressId } = parsed.data;

  // Name/email are never taken from the request - they come straight from
  // the verified Clerk session, so there's no way to place an order under
  // someone else's identity by editing the request body.
  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const name = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null : null;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // A saved address's own phone number is used when addressId is
      // given, so the Customer's on-file phone only gets touched by the
      // one-off manual-entry path below.
      const customer = await tx.customer.upsert({
        where: { clerkId: userId },
        update: addressId ? {} : { phone: parsed.data.phone },
        create: {
          clerkId: userId,
          email: email ?? `${userId}@unknown.local`,
          name,
          phone: addressId ? undefined : parsed.data.phone,
        },
      });

      // Resolve delivery details from whichever path was used: a saved
      // address (ownership re-checked here, never trusted from the client)
      // or the phone + shippingAddress typed directly into the form.
      let phone: string;
      let shippingAddress: string;

      if (addressId) {
        const address = await tx.address.findUnique({ where: { id: addressId } });
        if (!address || address.customerId !== customer.id) {
          throw new OrderError("That delivery address could not be found.");
        }
        phone = address.phone;
        shippingAddress = [
          address.fullName,
          [address.line1, address.line2].filter(Boolean).join(", "),
          `${address.city}, ${address.state} - ${address.pincode}`,
          `Phone: ${address.phone}`,
        ].join("\n");
      } else {
        phone = parsed.data.phone!;
        shippingAddress = parsed.data.shippingAddress!;
      }

      // Only productId + quantity come from the client — price and
      // availability are always re-read from the DB inside the
      // transaction, never trusted from the request.
      const products = await tx.product.findMany({
        where: { id: { in: items.map((item) => item.productId) }, isActive: true },
      });
      const productsById = new Map(products.map((product) => [product.id, product]));

      for (const item of items) {
        if (!productsById.has(item.productId)) {
          throw new OrderError("One of the items in your bag is no longer available.");
        }
      }

      const totalAmount = items.reduce((sum, item) => {
        const product = productsById.get(item.productId)!;
        return sum + parseFloat(product.price.toString()) * item.quantity;
      }, 0);

      // Stock is only checked here, not decremented — a decrement now
      // (before any money has actually moved) would let anyone lock up a
      // one-off piece as "sold out" for free by starting checkout and
      // never paying. The real, atomic decrement happens in the PhonePe
      // webhook once payment is confirmed (see app/api/phonepe/webhook).
      for (const item of items) {
        const product = productsById.get(item.productId)!;
        if (product.stock < item.quantity) {
          throw new OrderError(
            `Only ${product.stock} left of "${product.name}" — please update the quantity.`
          );
        }
      }

      // Every order starts PENDING until PhonePe's webhook confirms
      // payment. guestName/guestEmail/guestPhone are a point-in-time
      // snapshot (kept even though customerId is always set now) — a
      // customer's profile can change after the fact, but the order
      // should keep showing what was true when it was actually placed.
      return tx.order.create({
        data: {
          customerId: customer.id,
          guestName: name,
          guestEmail: email,
          guestPhone: phone,
          shippingAddress,
          totalAmount,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtSale: productsById.get(item.productId)!.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });
    });

    // The customer never sees this order again until they've either paid
    // or bailed out, so the confirmation email waits for the webhook too
    // (see app/api/phonepe/webhook) — sending it here would tell someone
    // "thank you for your order" before they've actually paid for it.
    try {
      const { redirectUrl } = await createPhonePeOrder({
        merchantOrderId: order.id,
        amountPaise: Math.round(parseFloat(order.totalAmount.toString()) * 100),
        redirectUrl: new URL(`/orders/${order.id}`, request.nextUrl.origin).toString(),
      });
      return NextResponse.json({ order: { id: order.id }, redirectUrl }, { status: 201 });
    } catch (phonepeError) {
      // The order row already committed above, but with no way to pay for
      // it — cancel it here rather than leaving a dead PENDING order
      // behind with no path forward (stock was never touched, so there's
      // nothing to release).
      console.error("PhonePe order creation failed:", phonepeError);
      await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      throw new OrderError("Couldn't start the payment. Please try again.");
    }
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    // Log the real error server-side only — the client just gets a
    // generic message, never stack traces or query details.
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Couldn't place your order. Please try again." },
      { status: 500 }
    );
  }
}
