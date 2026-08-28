import "server-only";
import { Resend } from "resend";
import { formatPrice } from "@/lib/catalog";
import type { OrderStatus } from "@/app/generated/prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

// merakifinesilver.com verified in Resend 2026-08-28 - this is what
// unblocks sending to real customer addresses instead of only the
// account's own signup email (see git history for the pre-verification
// restriction this used to hit).
const FROM = "Meraki <orders@merakifinesilver.com>";

// orders@ isn't a monitored inbox — replies to any of these emails should
// land somewhere a human actually reads, same address the contact form uses.
const REPLY_TO = "merakiindianoida@gmail.com";

// Product images live at relative /product-photos/... paths (see Product.images
// in schema.prisma) - fine for the site itself, but an email client has no
// origin to resolve a relative URL against, so these need to be absolute.
// This MUST be the real production domain once deployed, or every image in
// every order email 404s in the customer's inbox.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type OrderEmailItem = {
  name: string;
  quantity: number;
  priceAtSale: string | number;
  image: string | null;
};

// Every function here swallows its own errors rather than throwing -
// a failed email should never take down order creation or an admin status
// update, which is why these are called fire-and-forget from their call
// sites rather than awaited-and-checked.
async function send(to: string, subject: string, html: string) {
  try {
    const result = await resend.emails.send({ from: FROM, to, subject, html, replyTo: REPLY_TO });
    if (result.error) {
      // Resend's error is an Error-like object whose message/name aren't
      // enumerable own properties — logging it directly renders as "{}"
      // in most consoles (including Next's dev overlay), which hides the
      // one thing actually worth seeing. Pull those fields out explicitly.
      console.error("Resend send failed:", {
        name: result.error.name,
        message: result.error.message,
      });
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Absolute, falling back to a plain placeholder box when a product has no
// image at all (existing data allows an empty images[] - see ProductCard)
// rather than emitting a broken <img> tag.
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

// Shared chrome (wordmark header + footer) for every customer-facing email.
// A styled text wordmark rather than the SVG logo - inline SVG support is
// inconsistent across email clients (notably Outlook), and this domain has
// no PNG/JPG copy of the mark to fall back to.
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
    <table style="width:100%;border-collapse:collapse;">
      ${itemsRows(params.items)}
      <tr>
        <td colspan="2" style="padding:14px 0 0;font-size:14px;font-weight:bold;">Total</td>
        <td style="padding:14px 0 0;text-align:right;font-size:14px;font-weight:bold;">${formatPrice(params.totalAmount)}</td>
      </tr>
    </table>
    <p style="margin:24px 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Order #${orderNumber}</p>
    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Shipping to</p>
    <p style="margin:0;font-size:13px;color:#444;line-height:1.5;">${params.shippingAddress.replace(/\n/g, "<br />")}</p>`;

  await send(params.to, `Order Confirmed — #${orderNumber}`, emailShell(body));
}

// Meraki's own inbox for enquiries — set once here rather than threaded
// through every call site, since (unlike order/status emails) there's only
// ever one destination for a contact-form submission.
const CONTACT_INBOX = "merakiindianoida@gmail.com";

// The order/status emails above interpolate straight from authenticated
// session data (Clerk name, a saved address) — this one is the one place
// an anonymous visitor's free-text ends up in an HTML email, so it's the
// one place that actually needs escaping before interpolation.
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
  const body = `
    <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;margin:0 0 12px;">Hi ${params.customerName ?? "friend"},</h1>
    <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 16px;">${copy.body}</p>
    <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#999;">Order #${orderNumber}</p>`;

  await send(params.to, copy.subject, emailShell(body));
}
