"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 15; // ~1 minute, then it's on the customer to refresh manually

// Rendered only while an order is still PENDING (see app/orders/[id]) —
// refreshes the page every few seconds so a customer who completed
// payment on PhonePe and got redirected back doesn't have to manually
// reload to see it flip to PAID once the webhook (or this page's own
// fallback check, on the next load) catches up.
export default function OrderStatusPoller() {
  const router = useRouter();

  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      if (count > MAX_POLLS) {
        clearInterval(interval);
        return;
      }
      router.refresh();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [router]);

  return null;
}
