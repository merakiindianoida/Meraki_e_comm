import type { Metadata } from "next";
import PolicyPage, { PolicySection } from "@/components/PolicyPage";
import { BUSINESS } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "Privacy Policy | Meraki",
  description: `How ${BUSINESS.name} collects, uses and protects your personal information.`,
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage title="Privacy Policy" current="/privacy-policy">
      <PolicySection title="Who we are">
        <p>
          This website ({BUSINESS.website}) is run by {BUSINESS.name}, {BUSINESS.location}. This
          policy explains what personal information we collect when you use the site and how we
          use it.
        </p>
      </PolicySection>

      <PolicySection title="What we collect">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-[var(--ink)]">Account details:</strong> your name and email
            address when you create an account.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Order details:</strong> phone number, delivery
            address and the items you buy.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Messages:</strong> anything you send us through the
            contact form, reviews or return requests.
          </li>
          <li>
            <strong className="text-[var(--ink)]">Newsletter:</strong> your email address, if you
            subscribe.
          </li>
        </ul>
        <p>
          We do not collect or store your card, UPI or bank details. Payments are processed
          directly by our payment partner, PhonePe.
        </p>
      </PolicySection>

      <PolicySection title="How we use it">
        <ul className="list-disc space-y-1 pl-5">
          <li>to process, deliver and support your orders</li>
          <li>to send order confirmations and delivery updates</li>
          <li>to handle cancellations, returns and refunds</li>
          <li>to reply to your questions</li>
          <li>to send our newsletter, only if you have subscribed</li>
        </ul>
      </PolicySection>

      <PolicySection title="Who we share it with">
        <p>
          We never sell your personal information. We share only what is needed with the
          services that help run this site:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Clerk, for account sign-in</li>
          <li>PhonePe, for processing payments</li>
          <li>Resend, for sending order emails</li>
          <li>our hosting and database providers, for storing order information securely</li>
        </ul>
        <p>We may also disclose information if required to by law.</p>
      </PolicySection>

      <PolicySection title="Cookies">
        <p>
          We use cookies to keep you signed in and to make the site work properly. Your bag and
          wishlist are saved in your own browser. We don&apos;t use advertising cookies.
        </p>
      </PolicySection>

      <PolicySection title="Your choices">
        <p>
          You can view and update your saved addresses under your account at any time. To access,
          correct or delete your personal information, or to unsubscribe from the newsletter,
          email us at{" "}
          <a href={`mailto:${BUSINESS.email}`} className="underline-hover text-[var(--accent)]">
            {BUSINESS.email}
          </a>
          . We may need to keep order records where the law requires it.
        </p>
      </PolicySection>

      <PolicySection title="Grievances">
        <p>
          If you have a concern about how your information is handled, please write to us at{" "}
          <a href={`mailto:${BUSINESS.email}`} className="underline-hover text-[var(--accent)]">
            {BUSINESS.email}
          </a>
          . We will acknowledge your complaint within 48 hours and aim to resolve it within 30
          days.
        </p>
      </PolicySection>

      <PolicySection title="Changes to this policy">
        <p>
          We may update this policy from time to time. The date at the top of this page shows
          when it was last changed.
        </p>
      </PolicySection>
    </PolicyPage>
  );
}
