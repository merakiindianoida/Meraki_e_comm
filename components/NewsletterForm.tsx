"use client";

import { useActionState } from "react";
import { subscribeToNewsletter, type NewsletterFormState } from "@/app/newsletter/actions";

export default function NewsletterForm() {
  const [state, formAction, pending] = useActionState<NewsletterFormState, FormData>(
    subscribeToNewsletter,
    undefined
  );

  if (state?.success) {
    return (
      <p className="mt-2 max-w-xs text-sm text-white/80">
        You&apos;re on the list — thank you.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-2 max-w-xs">
      {/* Honeypot - same pattern as ContactForm, invisible to a real visitor */}
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="newsletter-company">Company</label>
        <input
          id="newsletter-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="flex">
        <input
          type="email"
          name="email"
          required
          placeholder="Your email"
          className="w-full rounded-l-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/40"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-r-lg bg-white/10 px-4 text-xs uppercase tracking-[0.1em] text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "…" : "Join"}
        </button>
      </div>
      {state?.error && (
        <p role="alert" className="mt-1.5 text-xs text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
