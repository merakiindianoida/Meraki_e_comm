// Hand-drawn line icons for the 8 real categories — distinct per category,
// each built from a few path segments (outline + a small filled "gem/bead"
// accent) rather than one flat uniform-weight outline. This is a permanent
// nav treatment, not a "photo pending" placeholder: unlike PlaceholderImage
// (which stands in for a missing product photo and should eventually be
// replaced), a "Shop by Category" icon nav is a legitimate design choice
// on its own, so it lives in its own component rather than reusing that one.
type Segment = { d: string; filled?: boolean };

const ICONS: Record<string, Segment[]> = {
  Nazariya: [
    { d: "M3.5 12c2.9-4.3 5.9-6.4 8.5-6.4s5.6 2.1 8.5 6.4c-2.9 4.3-5.9 6.4-8.5 6.4s-5.6-2.1-8.5-6.4z" },
    { d: "M8.6 12a3.4 3.4 0 106.8 0 3.4 3.4 0 00-6.8 0z" },
    { d: "M13.4 12a1.4 1.4 0 11-2.8 0 1.4 1.4 0 012.8 0z", filled: true },
  ],
  Bracelet: [
    { d: "M4 12a8 5 0 1016 0 8 5 0 10-16 0z" },
    { d: "M7 12a5 3 0 1010 0 5 3 0 10-10 0z" },
  ],
  Bangle: [
    { d: "M12 4a8 8 0 100 16 8 8 0 000-16z" },
    { d: "M12 7.7a4.3 4.3 0 100 8.6 4.3 4.3 0 000-8.6z" },
  ],
  Stud: [
    { d: "M12 3.8l3.2 1.85v3.7L12 11.2 8.8 9.35v-3.7L12 3.8z", filled: true },
    { d: "M11.2 12v6.6a.8.8 0 001.6 0V12z", filled: true },
  ],
  "Nose Pin": [
    { d: "M15 4c-2.2 3.3-4 6.6-4 9.3 0 1.7.7 3 2 3.9" },
    { d: "M17.6 15.5a1.6 1.6 0 11-3.2 0 1.6 1.6 0 013.2 0z", filled: true },
  ],
  Pendant: [
    { d: "M10.6 3.2a1.4 1.4 0 102.8 0 1.4 1.4 0 00-2.8 0z" },
    { d: "M12 4.6v1.6" },
    { d: "M7.8 7h8.4l-1.3 7.4a2.9 2.9 0 01-5.8 0L7.8 7z", filled: true },
  ],
  Chain: [
    { d: "M5 12a4 3 0 108 0 4 3 0 00-8 0z" },
    { d: "M11 12a4 3 0 108 0 4 3 0 00-8 0z" },
  ],
  Anklet: [
    { d: "M4.5 11a7.5 7.5 0 0115 0" },
    { d: "M7.7 13.3l.5 2" },
    { d: "M12 13.8v2.2" },
    { d: "M16.3 13.3l-.5 2" },
    { d: "M7.6 16.3a1.4 1.4 0 102.8 0 1.4 1.4 0 00-2.8 0z", filled: true },
    { d: "M10.6 17a1.4 1.4 0 102.8 0 1.4 1.4 0 00-2.8 0z", filled: true },
    { d: "M13.6 16.3a1.4 1.4 0 102.8 0 1.4 1.4 0 00-2.8 0z", filled: true },
  ],
  Ring: [
    { d: "M5.5 14.5a6.5 6.5 0 1113 0" },
    { d: "M9.7 9l.6 3" },
    { d: "M14.3 9l-.6 3" },
    { d: "M8.8 6.2a3.2 2.3 0 106.4 0 3.2 2.3 0 00-6.4 0z", filled: true },
  ],
  "Toe Ring": [
    { d: "M7 15.8a5 5 0 1110 0" },
    { d: "M10.3 11.6l.4 2" },
    { d: "M13.7 11.6l-.4 2" },
    { d: "M10.6 9.6a1.4 1.4 0 102.8 0 1.4 1.4 0 00-2.8 0z", filled: true },
  ],
  Necklace: [
    { d: "M5 6c0 4.5 3 7.5 6.3 8.6" },
    { d: "M19 6c0 4.5-3 7.5-6.3 8.6" },
    { d: "M9.8 14.6h4.4l-1 4.4a1.2 1.2 0 01-2.4 0l-1-4.4z", filled: true },
  ],
  Earrings: [
    { d: "M10.6 5.4a1.6 1.6 0 103.2 0 1.6 1.6 0 00-3.2 0z" },
    { d: "M12 7v2.2" },
    { d: "M9.5 10.4h5l-1.2 5.6a1.3 1.3 0 01-2.6 0l-1.2-5.6z", filled: true },
  ],
};

export default function CategoryIcon({
  category,
  className = "",
}: {
  category: string;
  className?: string;
}) {
  const segments = ICONS[category];

  return (
    <div
      className={`flex aspect-square items-center justify-center rounded-full bg-gradient-to-br from-[var(--surface)] to-[var(--surface-strong)] shadow-[0_2px_10px_rgba(19,29,43,0.12)] transition-transform duration-500 group-hover:scale-105 ${className}`}
    >
      {segments ? (
        <svg
          viewBox="0 0 24 24"
          className="h-[55%] w-[55%] text-[var(--accent)] transition-colors group-hover:text-[var(--ink)]"
        >
          {segments.map((seg, i) => (
            <path
              key={i}
              d={seg.d}
              fill={seg.filled ? "currentColor" : "none"}
              stroke={seg.filled ? "none" : "currentColor"}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      ) : (
        <span className="text-xs uppercase tracking-[0.1em] text-[var(--accent)]">
          {category}
        </span>
      )}
    </div>
  );
}
