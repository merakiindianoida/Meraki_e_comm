"use client";

// Plain controlled stepper - no internal state - so callers (product page,
// checkout summary) can each own the number for their own purposes
// (one drives a Buy Now link, the other drives a live total) without two
// sources of truth fighting each other.
export default function QuantitySelector({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (next: number) => void;
  max: number;
}) {
  return (
    <div className="inline-flex items-center border border-[var(--border-strong)]">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
        className="flex h-11 w-11 items-center justify-center text-lg text-[var(--ink)] transition duration-300 hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-30"
      >
        −
      </button>
      <span className="flex h-11 w-12 items-center justify-center font-mono text-sm text-[var(--ink)]">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="flex h-11 w-11 items-center justify-center text-lg text-[var(--ink)] transition duration-300 hover:bg-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
