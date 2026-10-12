import "server-only";
import type { OrderStatus } from "@/app/generated/prisma/client";

const STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  PENDING: "payment pending",
  PAYMENT_FAILED: "payment failed",
  PAID: "payment confirmed",
  PACKED: "packed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

export function normalizeWhatsAppPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (/^[6-9]\d{9}$/.test(digits)) return `91${digits}`;
  if (/^91[6-9]\d{9}$/.test(digits)) return digits;
  return null;
}

export async function sendOrderWhatsAppUpdate(params: {
  to: string | null;
  optedIn: boolean;
  customerName: string | null;
  orderId: string;
  status: OrderStatus;
}) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION;
  const templateName = process.env.WHATSAPP_ORDER_STATUS_TEMPLATE ?? "meraki_order_status_update";

  if (!params.optedIn || !params.to || !token || !phoneNumberId || !apiVersion) return;

  const to = normalizeWhatsAppPhone(params.to);
  const statusLabel = STATUS_LABELS[params.status];
  if (!to || !statusLabel) return;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE ?? "en_US" },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: (params.customerName ?? "there").slice(0, 80) },
                  { type: "text", text: params.orderId.slice(0, 8).toUpperCase() },
                  { type: "text", text: statusLabel },
                ],
              },
            ],
          },
        }),
      }
    );

    if (!response.ok) {
      console.error("WhatsApp order update failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("WhatsApp order update request failed:", error);
  }
}
