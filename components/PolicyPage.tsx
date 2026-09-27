import Link from "next/link";
import { BUSINESS, POLICY, POLICY_PAGES } from "@/lib/siteInfo";

// Common shell for the four policy pages - title, cross-links, and a contact footer.
export default function PolicyPage({
  title,
  current,
  children,
}: {
  title: string;
  current: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{BUSINESS.name}</p>
      <h1 className="mt-3 font-serif text-4xl text-[var(--ink)]">{title}</h1>
      <p className="mt-2 text-xs text-[var(--muted)]">Last updated: {POLICY.lastUpdated}</p>

      <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-[var(--border)] py-4 text-sm">
        {POLICY_PAGES.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            aria-current={page.href === current ? "page" : undefined}
            className={
              page.href === current
                ? "text-[var(--ink)] font-medium"
                : "underline-hover text-[var(--accent)]"
            }
          >
            {page.label}
          </Link>
        ))}
      </nav>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-[var(--muted)]">
        {children}
      </div>

      <section className="mt-12 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted)]">
        <h2 className="font-serif text-xl text-[var(--ink)]">Questions?</h2>
        <p className="mt-3">
          {BUSINESS.name}, {BUSINESS.location}
          <br />
          Email:{" "}
          <a href={`mailto:${BUSINESS.email}`} className="underline-hover text-[var(--accent)]">
            {BUSINESS.email}
          </a>
          <br />
          Phone:{" "}
          <Link href="/contact" className="underline-hover text-[var(--accent)]">
            see Contact Us
          </Link>
          <br />
          Support hours: {BUSINESS.supportHours}
        </p>
      </section>
    </main>
  );
}

// Section heading + body, so each policy page reads as plain content rather than markup.
export function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-2xl text-[var(--ink)]">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
