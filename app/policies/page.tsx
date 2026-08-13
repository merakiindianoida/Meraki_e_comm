import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Policies | Meraki",
  description: "Shipping, cancellations & returns, privacy, and terms for Meraki.",
};

// Single page with anchored sections rather than four separate routes —
// small site, small policy surface, easier for a first-time visitor to
// scan the whole thing than to hunt across pages. Content here is honest
// about what's actually decided vs. still open with the client (see
// project notes) — a plausible-sounding fake GSTIN or return window would
// be worse than a plainly marked "to be confirmed", the same principle
// behind the disabled contact form and "coming soon" nav entries elsewhere.
const SECTIONS = [
  { id: "shipping", label: "Shipping & Delivery" },
  { id: "returns", label: "Cancellations & Returns" },
  { id: "privacy", label: "Privacy" },
  { id: "terms", label: "Terms of Service" },
];

export default function PoliciesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
        Meraki
      </p>
      <h1 className="mt-3 font-serif text-4xl text-[var(--ink)]">Policies</h1>

      <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-[var(--border)] py-4 text-sm">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="underline-hover text-[var(--accent)]"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <section id="shipping" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl text-[var(--ink)]">Shipping &amp; Delivery</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            We currently ship within <span className="text-[var(--ink)]">Delhi NCR only</span>.
            Orders are shipped directly by our own team, not through a courier partner, and
            typically arrive within <span className="text-[var(--ink)]">3–10 business days</span>{" "}
            of your order being confirmed.
          </p>
          <p>
            Online payment isn&apos;t live on the site yet — once you place an order, our team
            will reach out using the phone number or email on your account to confirm payment
            and delivery details before it ships.
          </p>
        </div>
      </section>

      <section id="returns" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl text-[var(--ink)]">Cancellations &amp; Returns</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            You can cancel an order yourself, free of charge, any time before it ships — go to{" "}
            <span className="text-[var(--ink)]">My Orders</span> and select{" "}
            <span className="text-[var(--ink)]">Cancel Order</span>.
          </p>
          <p>
            Once an order has been delivered, you can request a return for any item from the
            same <span className="text-[var(--ink)]">My Orders</span> page. Our team reviews
            each request individually — we&apos;ll be in touch about the outcome and, where a
            return is approved, how the refund will be handled.
          </p>
          <p className="border-l-2 border-[var(--accent)] pl-3 text-[var(--ink)]">
            Exact return eligibility (condition of the item, time window) is still being
            finalized — this section will be updated with specifics once that&apos;s confirmed.
          </p>
        </div>
      </section>

      <section id="privacy" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl text-[var(--ink)]">Privacy</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            When you create an account, we collect your name and email address. If you save a
            delivery address or place an order, we also collect your phone number and shipping
            address. Account sign-in is handled by our authentication provider (Clerk); order
            and product information is stored in our own secure database.
          </p>
          <p>
            This information is used solely to process, ship, and support your orders — we
            don&apos;t sell it, and we don&apos;t share it with third parties for marketing
            purposes.
          </p>
        </div>
      </section>

      <section id="terms" className="mt-10 scroll-mt-24">
        <h2 className="font-serif text-2xl text-[var(--ink)]">Terms of Service</h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            Every Meraki piece is a one-of-a-kind design, made in limited quantity — when a
            listing shows stock, that&apos;s a count of that exact design, not a choice of size
            or color. All jewellery is 925 sterling silver unless a listing states otherwise.
          </p>
          <p>
            Prices shown are current at the time you view them and may change for future
            orders without prior notice; the price at checkout is the price you pay for that
            order.
          </p>
          <p className="border-l-2 border-[var(--accent)] pl-3 text-[var(--ink)]">
            Business registration details (GSTIN, BIS hallmarking registration) will be
            published here once finalized.
          </p>
        </div>
      </section>
    </main>
  );
}
