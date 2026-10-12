import "server-only";
import crypto from "crypto";

const IS_SANDBOX = process.env.PHONEPE_ENV !== "PRODUCTION";

const AUTH_BASE = IS_SANDBOX
  ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
  : "https://api.phonepe.com/apis/identity-manager";

const PG_BASE = IS_SANDBOX
  ? "https://api-preprod.phonepe.com/apis/pg-sandbox"
  : "https://api.phonepe.com/apis/pg";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - 30 > Date.now() / 1000) {
    return cachedToken.value;
  }

  const body = new URLSearchParams({
    client_id: process.env.PHONEPE_CLIENT_ID!,
    client_secret: process.env.PHONEPE_CLIENT_SECRET!,
    client_version: process.env.PHONEPE_CLIENT_VERSION!,
    grant_type: "client_credentials",
  });

  const res = await fetch(`${AUTH_BASE}/v1/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new Error(`PhonePe auth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  cachedToken = { value: data.access_token, expiresAt: data.expires_at };
  return cachedToken.value;
}

export type CreatePhonePeOrderResult = {
  phonepeOrderId: string;
  redirectUrl: string;
};

export async function createPhonePeOrder(params: {
  merchantOrderId: string;
  amountPaise: number;
  redirectUrl: string;
}): Promise<CreatePhonePeOrderResult> {
  const token = await getAccessToken();

  const res = await fetch(`${PG_BASE}/checkout/v2/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `O-Bearer ${token}`,
    },
    body: JSON.stringify({
      merchantOrderId: params.merchantOrderId,
      amount: params.amountPaise,
      expireAfter: 1200, // Let PhonePe expire an abandoned checkout; terminal expiry is recorded as Payment Failed.
      paymentFlow: {
        type: "PG_CHECKOUT",
        merchantUrls: { redirectUrl: params.redirectUrl },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`PhonePe create-order failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return { phonepeOrderId: data.orderId, redirectUrl: data.redirectUrl };
}

export type PhonePeOrderState = "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED";

export async function getPhonePeOrderStatus(
  merchantOrderId: string
): Promise<{ state: PhonePeOrderState; transactionId: string | null }> {
  const token = await getAccessToken();

  const res = await fetch(
    `${PG_BASE}/checkout/v2/order/${merchantOrderId}/status?errorContext=true`,
    { headers: { Authorization: `O-Bearer ${token}` } }
  );

  if (!res.ok) {
    throw new Error(`PhonePe order-status failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return {
    state: data.state,
    transactionId: data.paymentDetails?.[0]?.transactionId ?? null,
  };
}

// Keep timingSafeEqual to avoid leaking webhook credentials through response timing.
export function verifyPhonePeWebhookAuth(authorizationHeader: string | null): boolean {
  if (!authorizationHeader) return false;

  const expected = crypto
    .createHash("sha256")
    .update(`${process.env.PHONEPE_WEBHOOK_USERNAME}:${process.env.PHONEPE_WEBHOOK_PASSWORD}`)
    .digest("hex");

  const a = Buffer.from(authorizationHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
