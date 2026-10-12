"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 15;

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
