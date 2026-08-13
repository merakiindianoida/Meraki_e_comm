// Stand-in for a product photo until the real shoot is uploaded. Deliberately
// plain (dashed border, plain-text label) rather than a fake icon/illustration
// so it never gets mistaken for a finished asset — see product images note
// in project memory for why (client is still supplying photos in batches).
export default function PlaceholderImage({
  category,
  className = "",
}: {
  category?: string;
  className?: string;
}) {
  const label = category ? `${category} Image` : "Product Image";

  return (
    <div
      className={`flex h-full w-full items-center justify-center border-2 border-dashed border-[var(--border-strong)] bg-[var(--surface-strong)] ${className}`}
    >
      <span className="px-4 text-center text-sm uppercase tracking-[0.15em] text-[var(--accent)]">
        {label}
      </span>
    </div>
  );
}
