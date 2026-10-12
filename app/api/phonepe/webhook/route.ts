import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPhonePeWebhookAuth } from "@/lib/phonepe";
import {
  markOrderPaid,
  markOrderPaymentFailed,
  revalidateStorefrontForOrder,
} from "@/lib/orderFulfillment";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!verifyPhonePeWebhookAuth(authHeader)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    payload?: {
      merchantOrderId?: string;
      state?: string;
      paymentDetails?: { transactionId?: string }[];
    };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const merchantOrderId = body.payload?.merchantOrderId;
  const state = body.payload?.state;
  if (!merchantOrderId || !state) {
    return NextResponse.json({ ok: true });
  }

  const order = await prisma.order.findUnique({ where: { id: merchantOrderId } });
  if (!order) {
    return NextResponse.json({ ok: true });
  }

  try {
    if (state === "COMPLETED") {
      const transactionId = body.payload?.paymentDetails?.[0]?.transactionId ?? null;
      await markOrderPaid(order.id, transactionId);
      await revalidateStorefrontForOrder(order.id);
    } else if (state === "FAILED" || state === "EXPIRED") {
      await markOrderPaymentFailed(order.id);
    }
  } catch (error) {
    console.error("Error processing PhonePe webhook:", error);
  }

  return NextResponse.json({ ok: true });
}
