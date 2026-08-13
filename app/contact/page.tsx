import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Meraki",
  description: "Get in touch with Meraki for custom orders and enquiries.",
};

// Contact channels (email/phone/WhatsApp) aren't published yet — the client
// hasn't given us real ones, and a placeholder-looking-real address would
// be worse than none at all. The form below is disabled for the same
// reason the newsletter box is: no email-sending backend (Resend etc.) is
// wired up, so a "working" form would just silently drop submissions.
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

      <form className="mx-auto mt-10 max-w-md space-y-4 text-left">
        <div>
          <label className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Name
          </label>
          <input
            type="text"
            disabled
            placeholder="Your name"
            className="mt-1 w-full rounded-lg border border-[var(--border-strong)] bg-white px-4 py-2 text-sm text-[var(--muted)] disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Email
          </label>
          <input
            type="email"
            disabled
            placeholder="you@example.com"
            className="mt-1 w-full rounded-lg border border-[var(--border-strong)] bg-white px-4 py-2 text-sm text-[var(--muted)] disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
            Message
          </label>
          <textarea
            disabled
            rows={4}
            placeholder="How can we help?"
            className="mt-1 w-full rounded-lg border border-[var(--border-strong)] bg-white px-4 py-2 text-sm text-[var(--muted)] disabled:cursor-not-allowed"
          />
        </div>
        <button
          type="button"
          disabled
          title="Contact form is coming soon"
          className="w-full cursor-not-allowed rounded-lg bg-[var(--ink)]/40 px-8 py-3 text-xs uppercase tracking-[0.15em] text-white"
        >
          Send Message &mdash; Coming Soon
        </button>
      </form>
    </main>
  );
}
