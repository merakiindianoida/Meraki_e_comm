import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/orderSchema";
import { createPhonePeOrder } from "@/lib/phonepe";
import { MAX_SAVED_ADDRESSES, formatAddress } from "@/lib/address";
import { SERVICE_AREA_LABEL, isServiceablePincode } from "@/lib/serviceArea";
import { RATE_LIMIT_MESSAGE, RATE_RULES, checkRateLimit } from "@/lib/rateLimit";
import { upsertCustomerByClerk } from "@/lib/customer";

class OrderError extends Error {}

function assertDeliverable(pincode: string) {
  if (!isServiceablePincode(pincode)) {
    throw new OrderError(
      `Sorry, we don't deliver to PIN code ${pincode} yet. We currently deliver only within Delhi NCR (${SERVICE_AREA_LABEL}).`
    );
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Please sign in to place an order." }, { status: 401 });
  }

  if (!(await checkRateLimit(userId, RATE_RULES.placeOrder))) {
    return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 });
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

  const { items, addressId, newAddress } = parsed.data;

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const name = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null : null;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const customer = await upsertCustomerByClerk(tx, {
        clerkId: userId,
        email: email ?? `${userId}@unknown.local`,
        name,
      });

      let phone: string;
      let shippingAddress: string;

      if (addressId) {
        const address = await tx.address.findUnique({ where: { id: addressId } });
        if (!address || address.customerId !== customer.id) {
          throw new OrderError("That delivery address could not be found.");
        }
        assertDeliverable(address.pincode);
        phone = address.phone;
        shippingAddress = formatAddress(address);
      } else {
        assertDeliverable(newAddress!.pincode);
        phone = newAddress!.phone;
        shippingAddress = formatAddress(newAddress!);

        const existingCount = await tx.address.count({ where: { customerId: customer.id } });
        if (existingCount < MAX_SAVED_ADDRESSES) {
          await tx.address.create({
            data: { ...newAddress!, customerId: customer.id, isDefault: existingCount === 0 },
          });
        }
      }

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

      for (const item of items) {
        const product = productsById.get(item.productId)!;
        if (product.stock < item.quantity) {
          throw new OrderError(
            `Only ${product.stock} left of "${product.name}" — please update the quantity.`
          );
        }
      }

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

    try {
      const { redirectUrl } = await createPhonePeOrder({
        merchantOrderId: order.id,
        amountPaise: Math.round(parseFloat(order.totalAmount.toString()) * 100),
        redirectUrl: new URL(`/orders/${order.id}`, request.nextUrl.origin).toString(),
      });
      return NextResponse.json({ order: { id: order.id }, redirectUrl }, { status: 201 });
    } catch (phonepeError) {
      console.error("PhonePe order creation failed:", phonepeError);
      await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
      throw new OrderError("Couldn't start the payment. Please try again.");
    }
  } catch (error) {
    if (error instanceof OrderError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Couldn't place your order. Please try again." },
      { status: 500 }
    );
  }
}