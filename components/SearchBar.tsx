"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";

// Cycles through real category names rather than made-up example queries -
// every phrase here is something that will actually return results.
const PHRASES = CATEGORIES.map((c) => `Search "${c}"...`);
const TYPE_SPEED_MS = 70;
const DELETE_SPEED_MS = 35;
const HOLD_MS = 1400;

// The one piece of this bar that needs client JS is the animated
// placeholder. Submission itself doesn't: it's a plain GET <form>, so it
// works even if this component fails to hydrate - the browser builds the
// query string on its own. /products reads `search` and filters for real
// (same Prisma `contains` pattern as the public API route).
export default function SearchBar({ className = "" }: { className?: string }) {
  const [placeholder, setPlaceholder] = useState("");

  useEffect(() => {
    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const phrase = PHRASES[phraseIndex];
      charIndex += deleting ? -1 : 1;
      setPlaceholder(phrase.slice(0, charIndex));

      let delay = deleting ? DELETE_SPEED_MS : TYPE_SPEED_MS;
      if (!deleting && charIndex === phrase.length) {
        deleting = true;
        delay = HOLD_MS;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % PHRASES.length;
      }
      timeoutId = setTimeout(tick, delay);
    };

    timeoutId = setTimeout(tick, 400);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <form action="/products" method="GET" className={`relative ${className}`}>
      <input
        type="text"
        name="search"
        placeholder={placeholder}
        aria-label="Search products"
        className="w-full rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] py-2 pl-9 pr-3 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] transition hover:text-[var(--accent)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
          <path d="M10 4a6 6 0 100 12 6 6 0 000-12zM20 20l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </form>
  );
}
