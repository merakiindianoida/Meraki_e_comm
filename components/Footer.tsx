import Link from "next/link";
import { AUDIENCES } from "@/lib/catalog";
import IconStub from "@/components/IconStub";
import NewsletterForm from "@/components/NewsletterForm";

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
              WhatsApp is real too (client's number, confirmed 2026-08-28).
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
            <a
              href="https://wa.me/919599133900"
              target="_blank"
              rel="noopener noreferrer"
              title="WhatsApp"
              className="inline-flex h-10 w-10 items-center justify-center text-white/70 transition hover:text-[var(--accent)]"
            >
              {/* Official mark, from simple-icons (unpkg.com/simple-icons/icons/whatsapp.svg) -
                  not hand-drawn, so the shape is exact. Sized down from the
                  other two icons' h-6 w-6 - a solid fill reads visually
                  larger than their thin stroke outlines at the same box size. */}
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path
                  fill="currentColor"
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
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

          <div className="mt-4">
            <p className="text-xs uppercase tracking-[0.15em] text-white/40">
              Newsletter
            </p>
            <NewsletterForm />
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
