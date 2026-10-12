import "server-only";
import { Resend } from "resend";
import { formatPrice } from "@/lib/catalog";
import type { OrderStatus } from "@/app/generated/prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Meraki <orders@merakifinesilver.com>";

const REPLY_TO = "merakiindianoida@gmail.com";

// Set NEXT_PUBLIC_APP_URL to the production domain so email image links resolve.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export type OrderEmailItem = {
  name: string;
  quantity: number;
  priceAtSale: string | number;
  image: string | null;
};

export function toOrderEmailItems(
  lines: Array<{
    quantity: number;
    priceAtSale: { toString(): string } | string | number;
    product: { name: string; images: string[] };
  }>
): OrderEmailItem[] {
  return lines.map((line) => ({
    name: line.product.name,
    quantity: line.quantity,
    priceAtSale: line.priceAtSale.toString(),
    image: line.product.images[0] ?? null,
  }));
}

async function send(to: string, subject: string, html: string) {
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html, replyTo: REPLY_TO });
    if (result.error) {
      console.error("Resend send failed:", {
        name: result.error.name,
        message: result.error.message,
      });
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

function itemImageCell(image: string | null): string {
  if (!image) {
    return `<td style="width:64px;padding:12px 0;"><div style="width:56px;height:56px;background:#f2efe9;border:1px solid #e6e0d4;"></div></td>`;
  }
  const src = image.startsWith("http") ? image : `${APP_URL}${image}`;
  return `<td style="width:64px;padding:12px 0;"><img src="${src}" width="56" height="56" alt="" style="width:56px;height:56px;object-fit:cover;border:1px solid #e6e0d4;display:block;" /></td>`;
}

function itemsRows(items: OrderEmailItem[]): string {
  return items
    .map(
      (item) => `
        <tr style="border-bottom:1px solid #eee;">
          ${itemImageCell(item.image)}
          <td style="padding:12px 12px;">
            <div style="font-size:14px;color:#1a1a1a;">${item.name}</div>
            <div style="font-size:12px;color:#999;margin-top:2px;">Qty ${item.quantity}</div>
          </td>
          <td style="padding:12px 0;text-align:right;font-size:14px;color:#1a1a1a;white-space:nowrap;">
            ${formatPrice(parseFloat(item.priceAtSale.toString()) * item.quantity)}
          </td>
        </tr>`
    )
    .join("");
}

function orderItemsTable(items: OrderEmailItem[], totalAmount: string | number): string {
  return `
    <table style="width:100%;border-collapse:collapse;">
      ${itemsRows(items)}
      <tr>
        <td colspan="2" style="padding:14px 0 0;font-size:14px;font-weight:bold;">Order total</td>
        <td style="padding:14px 0 0;text-align:right;font-size:14px;font-weight:bold;">${formatPrice(totalAmount)}</td>
      </tr>
    </table>`;
}

function emailShell(bodyHtml: string): string {
  return `
    <div style="font-family:Georgia,'Times New Roman',serif;background:#faf9f6;padding:32px 16px;">
      <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e6e0d4;">
        <div style="background:#0E1822;padding:24px;text-align:center;">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.15em;color:#ffffff;">MERAKI</span>
        </div>
        <div style="padding:28px 28px 8px;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
          ${bodyHtml}
        </div>
        <div style="padding:20px 28px;margin-top:16px;border-top:1px solid #eee;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#999;text-align:center;">
          Fine 925 silver jewellery, made with soul.<br />
          Questions? Just reply to this email — we read every one.
        </div>
      </div>
    </div>`;
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
  const body = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 4px;">Thank you, ${params.customerName ?? "friend"}.</h1>
    <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 20px;">
      We've received your order and your payment — it's confirmed and we're
      getting it ready. Delivery usually takes <strong>3–10 business days</strong>
      (Delhi NCR only, for now).
    </p>
    ${orderItemsTable(params.items, params.totalAmount)}
    <p style="margin:24px 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Order #${orderNumber}</p>
    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Shipping to</p>
    <p style="margin:0;font-size:13px;color:#444;line-height:1.5;">${params.shippingAddress.replace(/\n/g, "<br />")}</p>`;

  await send(params.to, `Order Confirmed — #${orderNumber}`, emailShell(body));
}

const CONTACT_INBOX = "merakiindianoida@gmail.com";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactEmail(params: {
  name: string;
  email: string;
  message: string;
}) {
  const name = escapeHtml(params.name);
  const email = escapeHtml(params.email);
  const message = escapeHtml(params.message);

  const html = `
    <div style="font-family:sans-serif;color:#1a1a1a;max-width:480px;margin:0 auto;">
      <h1 style="font-size:20px;">New enquiry from ${name}</h1>
      <p style="color:#666;font-size:13px;">Reply-to: ${email}</p>
      <p style="white-space:pre-wrap;">${message}</p>
    </div>`;

  await send(CONTACT_INBOX, `Contact form: ${name}`, html);
}

const STATUS_COPY: Partial<Record<OrderStatus, { subject: string; body: string }>> = {
  PAYMENT_FAILED: {
    subject: "Payment not completed",
    body: "We couldn't confirm payment for your order. You can place the order again whenever you're ready.",
  },
  PACKED: {
    subject: "Your order has been packed",
    body: "Your order has been packed and is being prepared for dispatch. It can no longer be cancelled through the site. We’ll email you again when it ships.",
  },
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
    body: `Your order has been cancelled. If payment was captured, any applicable refund will be handled under our <a href="${APP_URL}/refund-policy" style="color:#8a6a2f;">Refund &amp; Returns Policy</a>. If this cancellation wasn't expected, please reach out to us.`,
  },
  REFUNDED: {
    subject: "Your refund has been completed",
    body: "Your refund has been marked as completed. Please allow your payment provider time to show the amount in your account.",
  },
};

export async function sendOrderStatusEmail(params: {
  to: string;
  customerName: string | null;
  orderId: string;
  status: OrderStatus;
  items: OrderEmailItem[];
  totalAmount: string | number;
  refundAmount?: string | number;
}) {
  const copy = STATUS_COPY[params.status];
  if (!copy) return;

  const orderNumber = params.orderId.slice(0, 8).toUpperCase();
  const body = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 12px;">Hi ${params.customerName ?? "friend"},</h1>
    <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 16px;">${copy.body}</p>
    ${params.status === "REFUNDED" && params.refundAmount !== undefined
      ? `<p style="padding:12px 14px;background:#f7f5ef;font-size:14px;color:#1a1a1a;"><strong>Refund amount:</strong> ${formatPrice(params.refundAmount)}</p>`
      : ""}
    ${orderItemsTable(params.items, params.totalAmount)}
    <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Order #${orderNumber}</p>`;

  await send(params.to, copy.subject, emailShell(body));
}

export async function sendStockShortfallAlert(params: {
  orderId: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  productNames: string[];
}) {
  const orderNumber = params.orderId.slice(0, 8).toUpperCase();
  const products = params.productNames.map((n) => `<li>${escapeHtml(n)}</li>`).join("");
  const html = `
    <div style="font-family:sans-serif;color:#1a1a1a;max-width:480px;margin:0 auto;">
      <h1 style="font-size:20px;color:#b91c1c;">Paid order needs attention — #${orderNumber}</h1>
      <p>This customer has paid, but the following item(s) were already out of stock:</p>
      <ul>${products}</ul>
      <p style="font-size:13px;color:#444;">
        Customer: ${escapeHtml(params.customerName ?? "—")}<br />
        Email: ${escapeHtml(params.customerEmail ?? "—")}<br />
        Phone: ${escapeHtml(params.customerPhone ?? "—")}
      </p>
      <p style="font-size:13px;color:#444;">
        Please contact them to arrange a refund or a replacement:
        <a href="${APP_URL}/admin/orders/${params.orderId}">open the order in admin</a>.
      </p>
    </div>`;

  await send(CONTACT_INBOX, `ACTION NEEDED: out of stock after payment — #${orderNumber}`, html);
}
