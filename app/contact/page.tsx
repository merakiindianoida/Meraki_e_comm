import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { BUSINESS } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "Contact Us | Meraki",
  description: "Get in touch with Meraki for custom orders and enquiries.",
};

// Direct channels up top for people who'd rather call or email than fill in the form.
export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
        Get in Touch
      </p>
      <h1 className="mt-4 font-serif text-4xl text-[var(--ink)]">
        We&apos;d love to hear from you.
      </h1>
      <p className="mx-auto mt-5 max-w-md text-sm text-[var(--muted)]">
        Custom orders, bulk enquiries, or questions about a piece &mdash;
        reach out and we&apos;ll get back to you.
      </p>

      <dl className="mx-auto mt-10 grid max-w-lg gap-6 border-y border-[var(--border)] py-6 text-sm sm:grid-cols-2 md:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Phone / WhatsApp</dt>
          <dd className="mt-2">
            <a href={BUSINESS.phoneHref} className="underline-hover text-[var(--ink)]">
              {BUSINESS.phoneDisplay}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Email</dt>
          <dd className="mt-2">
            <a href={`mailto:${BUSINESS.email}`} className="underline-hover break-all text-[var(--ink)]">
              {BUSINESS.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Support Hours</dt>
          <dd className="mt-2 text-[var(--ink)]">{BUSINESS.supportHours}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">Owner</dt>
          <dd className="mt-2 text-[var(--ink)]">Sumita Singh</dd>
          <dd className="text-xs text-[var(--muted)]">MERAKI INDIA</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-[var(--muted)]">
        {BUSINESS.name} &middot; {BUSINESS.location}
      </p>

      <ContactForm />
    </main>
  );
}
