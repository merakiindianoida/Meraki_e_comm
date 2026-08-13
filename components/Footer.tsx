import Link from "next/link";
import { AUDIENCES } from "@/lib/catalog";
import IconStub from "@/components/IconStub";

// Deliberately doesn't repeat the category list from the header nav (that
// was here before and just duplicated it). "Shop For" below uses audience
// instead of category - a filter that otherwise has no entry point in the
// nav at all, so it's genuinely new rather than a re-listing.
//
// Dark navy background (#0E1822) - the one section on the site darker than
// the editorial banner's --ink, so it reads as the true "floor" of the
// page. The logo is monochrome black-on-white and would vanish here, so it
// runs through Tailwind's `invert` filter just in this one spot; the
// header's copy of the same file is untouched.
export default function Footer() {
  return (
    <footer className="bg-[#0E1822]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Meraki" className="h-14 w-14 invert" />
          <p className="mt-3 max-w-xs text-base text-white/70">
            Fine 925 silver jewellery, made with soul &mdash; for every member
            of the family.
          </p>
          {/* Instagram is real now (client's handle, confirmed 2026-08-08) -
              swapped over to an actual link per IconStub's own comment.
              Facebook stays a stub; no handle for that one yet. */}
          <div className="mt-4 flex gap-1">
            <a
              href="https://www.instagram.com/meraki_fine_silver/"
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
              className="inline-flex h-10 w-10 items-center justify-center text-white/70 transition hover:text-[var(--accent)]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="h-6 w-6"
              >
                <path
                  d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zM12 8a4 4 0 100 8 4 4 0 000-8zM17 6.5h.01"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <IconStub
              label="Facebook"
              className="text-white/70"
              path="M14 8h2V5h-2a4 4 0 00-4 4v2H8v3h2v6h3v-6h2.5l.5-3H13V9a1 1 0 011-1z"
            />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Shop For
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {AUDIENCES.map((audience) => (
              <li key={audience}>
                <Link
                  href={`/products?audience=${encodeURIComponent(audience)}`}
                  className="underline-hover transition hover:text-[var(--accent)]"
                >
                  {audience}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Get in Touch
          </p>
          <p className="mt-3 text-sm text-white/80">
            Reach out for custom orders and bulk enquiries.
          </p>
          <Link
            href="/contact"
            className="underline-hover mt-2 inline-block text-sm text-[var(--accent)]"
          >
            Contact Us &rarr;
          </Link>

          {/* Visual placeholder for a mailing list — not wired to anything
              yet (no email service integrated). Styled disabled rather than
              a fake form that would silently swallow submissions. The
              homepage has its own newsletter section now too; this one
              stays as a footer-level fallback for anyone who scrolls past
              it. */}
          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.15em] text-white/40">
              Newsletter — coming soon
            </p>
            <div className="mt-2 flex max-w-xs">
              <input
                type="email"
                disabled
                placeholder="Your email"
                className="w-full rounded-l-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/60 placeholder:text-white/40 disabled:cursor-not-allowed"
              />
              <button
                disabled
                className="cursor-not-allowed rounded-r-lg bg-white/10 px-4 text-xs uppercase tracking-[0.1em] text-white/60"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/40 sm:px-6">
        &copy; {new Date().getFullYear()} Meraki. All rights reserved.
        {" · "}
        <Link href="/policies" className="underline-hover hover:text-white/70">
          Shipping, Returns &amp; Policies
        </Link>
      </div>
    </footer>
  );
}
