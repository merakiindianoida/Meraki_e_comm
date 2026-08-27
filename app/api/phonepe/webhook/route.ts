import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPhonePeWebhookAuth } from "@/lib/phonepe";
import { markOrderPaid, markOrderCancelled } from "@/lib/orderFulfillment";

// PhonePe calls this server-to-server once a payment reaches a terminal
// state — this, not the customer's browser redirect, is the source of
// truth for whether an order actually got paid (a redirect can be closed,
// spoofed, or never arrive at all). See lib/orderFulfillment.ts for the
// actual "mark paid, decrement stock" logic, shared with the order page's
// own fallback check in case this webhook is slow to arrive.
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
    // Malformed payload — acknowledge with 2xx anyway so PhonePe doesn't
    // retry something that will never parse correctly.
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
    } else if (state === "FAILED") {
      await markOrderCancelled(order.id);
    }
    // Any other state (still PENDING on PhonePe's side) — nothing to do
    // until a later delivery reports a terminal state.
  } catch (error) {
    console.error("Error processing PhonePe webhook:", error);
    // Still acknowledge — a non-2xx here just makes PhonePe retry a
    // delivery that will hit the same error again. The log line above is
    // what actually needs a human to see it.
  }

  return NextResponse.json({ ok: true });
}
