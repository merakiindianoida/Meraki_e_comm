import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeWhatsAppPhone } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token &&
    token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN &&
    challenge
  ) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Webhook verification failed" }, { status: 403 });
}

export async function POST(request: NextRequest) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  const signature = request.headers.get("x-hub-signature-256");
  if (!appSecret || !signature) {
    return NextResponse.json({ error: "Webhook signature is required" }, { status: 401 });
  }

  const body = await request.text();
  const expected = `sha256=${createHmac("sha256", appSecret).update(body).digest("hex")}`;
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  try {
    const payload = JSON.parse(body) as {
      entry?: Array<{
        changes?: Array<{
          value?: {
            messages?: Array<{ from?: string; type?: string; text?: { body?: string } }>;
          };
        }>;
      }>;
    };
    const messages = payload.entry?.flatMap((entry) =>
      entry.changes?.flatMap((change) => change.value?.messages ?? []) ?? []
    ) ?? [];
    const optOutNumbers = new Set(
      messages
        .filter((message) => message.type === "text" && /^(stop|unsubscribe|opt\s*out)$/i.test(message.text?.body?.trim() ?? ""))
        .map((message) => (message.from ? normalizeWhatsAppPhone(message.from) : null))
        .filter((phone): phone is string => Boolean(phone))
    );

    if (optOutNumbers.size > 0) {
      const optedInOrders = await prisma.order.findMany({
        where: { whatsappOptIn: true, guestPhone: { not: null } },
        select: { id: true, guestPhone: true },
      });
      const orderIds = optedInOrders
        .filter((order) => order.guestPhone && optOutNumbers.has(normalizeWhatsAppPhone(order.guestPhone) ?? ""))
        .map((order) => order.id);
      if (orderIds.length > 0) {
        await prisma.order.updateMany({
          where: { id: { in: orderIds }, whatsappOptIn: true },
          data: { whatsappOptIn: false },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Could not process WhatsApp webhook:", error);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
