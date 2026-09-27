import type { Metadata } from "next";
import Link from "next/link";
import { BUSINESS, POLICY_PAGES } from "@/lib/siteInfo";

export const metadata: Metadata = {
  title: "Policies | Meraki",
  description: "Shipping, refunds & returns, privacy, and terms for Meraki.",
};

// Kept as an index so older links to /policies still land somewhere useful.
export default function PoliciesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{BUSINESS.name}</p>
      <h1 className="mt-3 font-serif text-4xl text-[var(--ink)]">Policies</h1>

      <ul className="mt-8 divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {POLICY_PAGES.map((page) => (
          <li key={page.href}>
            <Link
              href={page.href}
              className="flex items-center justify-between py-4 text-[var(--ink)] transition hover:text-[var(--accent)]"
            >
              <span className="font-serif text-xl">{page.label}</span>
              <span aria-hidden>&rarr;</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
