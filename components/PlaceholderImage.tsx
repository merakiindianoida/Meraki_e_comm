// Temporary stand-in until product photography is uploaded.
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
