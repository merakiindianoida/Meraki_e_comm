import type { Metadata } from "next";
import PolicyPage, { PolicySection } from "@/components/PolicyPage";
import { BUSINESS, POLICY } from "@/lib/siteInfo";
import { SERVICE_AREA_LABEL } from "@/lib/serviceArea";

export const metadata: Metadata = {
  title: "Shipping Policy | Meraki",
  description: `Delivery area, timelines and charges for ${BUSINESS.name} orders.`,
};

export default function ShippingPolicyPage() {
  return (
    <PolicyPage title="Shipping Policy" current="/shipping-policy">
      <PolicySection title="Where we deliver">
        <p>
          We currently deliver within <strong className="text-[var(--ink)]">{POLICY.shippingArea}</strong>{" "}
          only ({SERVICE_AREA_LABEL}). Checkout will let you know if your PIN code is outside
          this area. If you&apos;re just outside it, please contact us and we&apos;ll see
          whether we can help.
        </p>
      </PolicySection>

      <PolicySection title="Delivery time">
        <p>
          Orders are packed and delivered by our own team, not a third-party courier. Delivery
          usually takes <strong className="text-[var(--ink)]">{POLICY.deliveryDays}</strong> from the
          date your payment is confirmed. Sundays and public holidays are not counted as
          business days.
        </p>
        <p>
          Occasionally delays can happen because of weather, local restrictions or high order
          volumes. If that happens, we&apos;ll contact you on the phone number or email given at
          checkout.
        </p>
      </PolicySection>

      <PolicySection title="Shipping charges">
        <p>
          There is no separate shipping charge. The total shown at checkout is the full amount
          you pay.
        </p>
      </PolicySection>

      <PolicySection title="Order tracking">
        <p>
          You can see the status of every order (Paid, Shipped, Delivered) under{" "}
          <strong className="text-[var(--ink)]">My Orders</strong> once you&apos;re signed in. We
          also email you when your order ships.
        </p>
      </PolicySection>

      <PolicySection title="Receiving your order">
        <p>
          Please make sure someone is available at the delivery address. Before accepting,
          check that the package is sealed and undamaged. If it looks tampered with, please
          refuse the delivery and contact us right away.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
