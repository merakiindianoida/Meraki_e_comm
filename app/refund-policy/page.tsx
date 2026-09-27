import type { Metadata } from "next";
import PolicyPage, { PolicySection } from "@/components/PolicyPage";
import { BUSINESS, POLICY } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "Refund & Returns Policy | Meraki",
  description: `Cancellations, returns and refund timelines for ${BUSINESS.name} orders.`,
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage title="Refund & Returns Policy" current="/refund-policy">
      <PolicySection title="Cancelling an order">
        <p>
          You can cancel an order free of charge any time before it ships. Go to{" "}
          <strong className="text-[var(--ink)]">My Orders</strong>, open the order and select{" "}
          <strong className="text-[var(--ink)]">Cancel Order</strong>. Once an order has shipped it
          can no longer be cancelled, but you can still request a return after delivery.
        </p>
      </PolicySection>

      <PolicySection title="Returns">
        <p>
          You can request a return within{" "}
          <strong className="text-[var(--ink)]">{POLICY.returnWindowDays} days of delivery</strong>{" "}
          from the <strong className="text-[var(--ink)]">My Orders</strong> page. To be accepted, the
          item must be:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>unused, unworn and undamaged</li>
          <li>returned with its original packaging, tags and any certificate it came with</li>
          <li>not customised or made to order for you</li>
        </ul>
        <p>
          Our team reviews every request and will contact you to arrange pickup. We may decline a
          return if the item doesn&apos;t meet these conditions when it reaches us.
        </p>
      </PolicySection>

      <PolicySection title="Damaged or wrong item">
        <p>
          If your order arrives damaged, or you received the wrong item, please contact us within
          24 hours of delivery with photos of the item and packaging. We&apos;ll arrange a
          replacement or a full refund at no extra cost to you.
        </p>
      </PolicySection>

      <PolicySection title="Refund timeline">
        <p>Refunds are always made to the original payment method:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-[var(--ink)]">Cancelled orders:</strong> refund started within{" "}
            {POLICY.refundDays} of cancellation.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Returns:</strong> refund started within{" "}
            {POLICY.refundDays} after the returned item reaches us and passes inspection.
          </li>
        </ul>
        <p>
          Once we start a refund, your bank or UPI app may take a few more days to show it in your
          account. If you haven&apos;t received it after that, please contact us with your order
          number.
        </p>
      </PolicySection>

      <PolicySection title="Exchanges">
        <p>
          Since every Meraki piece is a one-off design, we can&apos;t always offer a direct
          exchange for the same item. You&apos;re welcome to return it for a refund and place a
          new order for another piece.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
