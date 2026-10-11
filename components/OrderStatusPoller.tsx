"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 15; // ~1 minute, then it's on the customer to refresh manually

// Rendered only while an order is still PENDING (see app/orders/[id]) —
// refreshes briefly so a customer redirected back from PhonePe doesn't
// have to reload manually while its webhook or status endpoint catches up.
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
