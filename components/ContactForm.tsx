"use client";

import { useActionState } from "react";
import { submitContact, type ContactFormState } from "@/app/contact/actions";

export default function ContactForm() {
  const [state, formAction, pending] = useActionState<ContactFormState, FormData>(
    submitContact,
    undefined
  );

  if (state?.success) {
    return (
      <p className="mt-10 text-sm text-[var(--ink)]">
        Thank you — your message has been sent. We&apos;ll get back to you soon.
      </p>
    );
  }

  return (
    <form action={formAction} className="mx-auto mt-10 max-w-md space-y-4 text-left">
      {/* Honeypot - invisible to a real visitor (off-screen, not just
          display:none, since some bots skip fields that are display:none),
          never tabbable, autocomplete off so a browser doesn't offer to
          fill it. Anything in it on submit means a bot filled every input
          it could find. */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="name" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="Your name"
          className="mt-1 w-full rounded-lg border border-[var(--border-strong)] bg-white px-4 py-2 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
        />
      </div>
      <div>
        <label htmlFor="email" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="mt-1 w-full rounded-lg border border-[var(--border-strong)] bg-white px-4 py-2 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
        />
      </div>
      <div>
        <label htmlFor="message" className="text-xs uppercase tracking-[0.1em] text-[var(--muted)]">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="How can we help?"
          className="mt-1 w-full rounded-lg border border-[var(--border-strong)] bg-white px-4 py-2 text-sm text-[var(--ink)] outline-none transition duration-300 focus:border-[var(--accent)]"
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-[var(--ink)] px-8 py-3 text-xs uppercase tracking-[0.15em] text-white transition duration-500 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
