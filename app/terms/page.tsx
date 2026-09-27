import type { Metadata } from "next";
import Link from "next/link";
import PolicyPage, { PolicySection } from "@/components/PolicyPage";
import { BUSINESS } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "Terms & Conditions | Meraki",
  description: `Terms for buying from ${BUSINESS.name}.`,
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms & Conditions" current="/terms">
      <PolicySection title="About these terms">
        <p>
          This website ({BUSINESS.website}) is run by {BUSINESS.name}, {BUSINESS.location}. By
          using the site or placing an order, you agree to these terms. Please read them along
          with our{" "}
          <Link href="/shipping-policy" className="underline-hover text-[var(--accent)]">
            Shipping Policy
          </Link>
          ,{" "}
          <Link href="/refund-policy" className="underline-hover text-[var(--accent)]">
            Refund &amp; Returns Policy
          </Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="underline-hover text-[var(--accent)]">
            Privacy Policy
          </Link>
          .
        </p>
      </PolicySection>

      <PolicySection title="Our products">
        <p>
          All jewellery is 925 sterling silver unless a listing says otherwise. Every Meraki piece
          is a one-off design made in limited quantity, so the stock shown is for that exact
          design, not a choice of size or colour.
        </p>
        <p>
          Because pieces are handcrafted, small differences in finish, weight or shade from the
          photos are normal and are not considered defects. Screen settings can also affect how
          colours look.
        </p>
      </PolicySection>

      <PolicySection title="Prices and payment">
        <p>
          All prices are in Indian Rupees (INR) and include applicable taxes. Prices may change
          without notice, but the price shown at checkout is the price you pay for that order.
        </p>
        <p>
          Payment is taken online through PhonePe (UPI, cards and net banking). Your order is
          confirmed only once payment is successful.
        </p>
      </PolicySection>

      <PolicySection title="Orders">
        <p>
          We may cancel an order if an item turns out to be unavailable, if a price or listing
          error is found, or if we suspect fraud. If we cancel an order you have paid for, you
          will receive a full refund as set out in our Refund &amp; Returns Policy.
        </p>
      </PolicySection>

      <PolicySection title="Your account">
        <p>
          You are responsible for keeping your account login safe and for any orders placed from
          it. Please give accurate contact and delivery details so we can fulfil your order.
        </p>
      </PolicySection>

      <PolicySection title="Reviews and content">
        <p>
          Reviews can only be left for items you have bought and received. Please keep them
          honest and respectful. We may remove content that is offensive, misleading or
          unrelated to the product.
        </p>
      </PolicySection>

      <PolicySection title="Intellectual property">
        <p>
          All designs, photos, text and logos on this site belong to {BUSINESS.name} and may not
          be copied or used without our written permission.
        </p>
      </PolicySection>

      <PolicySection title="Liability">
        <p>
          To the extent permitted by law, our liability for any order is limited to the amount
          you paid for it. We are not responsible for delays caused by events outside our
          control.
        </p>
      </PolicySection>

      <PolicySection title="Governing law">
        <p>
          These terms are governed by the laws of India. Any disputes will be subject to the
          courts of Gautam Buddh Nagar (Noida), Uttar Pradesh.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
