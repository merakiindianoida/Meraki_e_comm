import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us | Meraki",
  description: "Get in touch with Meraki for custom orders and enquiries.",
};

// Contact channels (email/phone/WhatsApp) aren't published yet - the client
// hasn't given us real ones, and a placeholder-looking-real address would
// be worse than none at all. The form itself is real (see
// components/ContactForm.tsx + app/contact/actions.ts, sending via Resend)
// - this page just doesn't publish a direct email/phone alongside it yet.
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

      <ContactForm />
    </main>
  );
}
