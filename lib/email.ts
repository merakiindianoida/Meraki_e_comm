import "server-only";
import { Resend } from "resend";
import { formatPrice } from "@/lib/catalog";
import type { OrderStatus } from "@/app/generated/prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

// Meraki doesn't have a verified domain yet, so this is the only sender
// address Resend will accept — and until a domain is verified, Resend will
// only actually deliver to the account's own signup email regardless of
// what's in `to`. Swap this to something like "orders@merakijewelry.com"
// the moment a real domain is verified in the Resend dashboard.
const FROM = "Meraki <onboarding@resend.dev>";

type OrderEmailItem = {
  name: string;
  quantity: number;
  priceAtSale: string | number;
};

// Every function here swallows its own errors rather than throwing —
// a failed email should never take down order creation or an admin status
// update, which is why these are called fire-and-forget from their call
// sites rather than awaited-and-checked.
async function send(to: string, subject: string, html: string) {
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html });
    if (result.error) {
      console.error("Resend send failed:", result.error);
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

function itemsRows(items: OrderEmailItem[]): string {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;">${item.name} &times; ${item.quantity}</td>
          <td style="padding:8px 0;text-align:right;">
            ${formatPrice(parseFloat(item.priceAtSale.toString()) * item.quantity)}
          </td>
        </tr>`
    )
    .join("");
}

export async function sendOrderConfirmationEmail(params: {
  to: string;
  customerName: string | null;
  orderId: string;
  items: OrderEmailItem[];
  totalAmount: string | number;
  shippingAddress: string;
}) {
  const orderNumber = params.orderId.slice(0, 8).toUpperCase();
  const html = `
    <div style="font-family:sans-serif;color:#1a1a1a;max-width:480px;margin:0 auto;">
      <h1 style="font-size:20px;">Thank you, ${params.customerName ?? "friend"}.</h1>
      <p>Your Meraki order #${orderNumber} has been received and is pending confirmation.
      We'll be in touch to arrange payment and delivery.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        ${itemsRows(params.items)}
        <tr style="border-top:1px solid #ddd;font-weight:bold;">
          <td style="padding:8px 0;">Total</td>
          <td style="padding:8px 0;text-align:right;">${formatPrice(params.totalAmount)}</td>
        </tr>
      </table>
      <p style="color:#666;font-size:13px;">Shipping to:<br />${params.shippingAddress.replace(/\n/g, "<br />")}</p>
      <p style="color:#666;font-size:13px;">We currently ship within Delhi NCR only, with delivery in 3–10 business days.</p>
    </div>`;

  await send(params.to, `Order Confirmed — #${orderNumber}`, html);
}

const STATUS_COPY: Partial<Record<OrderStatus, { subject: string; body: string }>> = {
  SHIPPED: {
    subject: "Your order has shipped",
    body: "Your order is on its way and should arrive within 3–10 business days.",
  },
  DELIVERED: {
    subject: "Your order has been delivered",
    body: "Your order has been marked as delivered. We hope you love it — you can rate it or request a return anytime from My Orders.",
  },
  CANCELLED: {
    subject: "Your order has been cancelled",
    body: "Your order has been cancelled. If this wasn't expected, please reach out to us.",
  },
};

// Only SHIPPED/DELIVERED/CANCELLED get an email — PENDING and PAID aren't
// meaningful updates the customer needs to be told about separately from
// the order-confirmation email they already got.
export async function sendOrderStatusEmail(params: {
  to: string;
  customerName: string | null;
  orderId: string;
  status: OrderStatus;
}) {
  const copy = STATUS_COPY[params.status];
  if (!copy) return;

  const orderNumber = params.orderId.slice(0, 8).toUpperCase();
  const html = `
    <div style="font-family:sans-serif;color:#1a1a1a;max-width:480px;margin:0 auto;">
      <h1 style="font-size:20px;">Hi ${params.customerName ?? "friend"},</h1>
      <p>${copy.body}</p>
      <p style="color:#666;font-size:13px;">Order #${orderNumber}</p>
    </div>`;

  await send(params.to, copy.subject, html);
}
