"use client";

import { useState } from "react";
import Link from "next/link";
import CategoryIcon from "@/components/CategoryIcon";
import type { Category } from "@/lib/catalog";

// Exactly 6 tiles visible at a time, centered, arrows page by 2 - with 8
// real categories that means one arrow press reveals the remaining 2. Track
// width/position are plain percentages of the track's own box, so the math
// doesn't depend on measuring pixel widths in an effect: with VISIBLE=6
// and `total` categories, the track is (total/VISIBLE)*100% wide and each
// step of the window shifts it by (1/total)*100%.
const VISIBLE = 6;
const STEP = 2;

export default function CategoryCarousel({
  categories,
}: {
  categories: readonly Category[];
}) {
  const [startIndex, setStartIndex] = useState(0);
  const total = categories.length;
  const maxStart = Math.max(0, total - VISIBLE);

  const atStart = startIndex <= 0;
  const atEnd = startIndex >= maxStart;

  const prev = () => setStartIndex((i) => Math.max(i - STEP, 0));
  const next = () => setStartIndex((i) => Math.min(i + STEP, maxStart));

  return (
    <div className="mx-auto flex max-w-6xl items-center gap-2 px-2 sm:gap-4 sm:px-4">
      <button
        type="button"
        onClick={prev}
        disabled={atStart}
        aria-label="Show previous categories"
        className="flex shrink-0 items-center justify-center rounded-lg bg-white p-2 text-[var(--ink)] shadow-md transition hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-[var(--ink)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className="overflow-hidden">
        <div
          className="flex"
          style={{
            width: `${(total / VISIBLE) * 100}%`,
            transform: `translateX(-${(startIndex / total) * 100}%)`,
            transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(category)}`}
              className="hover-lift group block px-0.5 text-center sm:px-3"
              style={{ width: `${100 / total}%` }}
            >
              <CategoryIcon category={category} />
              {/* break-words is the real fix here — a single-word name like
                  "BRACELET" has no space to wrap at, so without it the text
                  paints outside its 45px-ish mobile tile (invisible to a
                  layout-box overlap check, since the box itself is sized
                  correctly; only the painted text bleeds into the next
                  tile). Smaller text at the narrowest breakpoint means that
                  break less often actually has to fire. */}
              <p className="mt-3 break-words text-[11px] font-medium uppercase leading-tight tracking-[0.05em] text-[var(--ink)] sm:text-sm">
                {category}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={next}
        disabled={atEnd}
        aria-label="Show more categories"
        className="flex shrink-0 items-center justify-center rounded-lg bg-white p-2 text-[var(--ink)] shadow-md transition hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-[var(--ink)]"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
