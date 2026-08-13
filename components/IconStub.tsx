// Shared "not built yet" icon treatment — used for header actions (search,
// wishlist, bag) and footer social links. Visual only, with a tooltip
// explaining why, so none of it reads as a broken button. Once a feature
// actually ships (cart, wishlist, social profiles), swap its call site over
// to a real <Link>/<button> instead of stretching this component to cover it.
export default function IconStub({
  label,
  path,
  className = "text-[var(--ink)]/70",
}: {
  label: string;
  path: string;
  // Override for dark backgrounds (e.g. the footer) where the default ink
  // color would be invisible — caller passes a light color instead.
  className?: string;
}) {
  return (
    <span
      title={`${label} — coming soon`}
      className={`inline-flex h-10 w-10 items-center justify-center transition hover:text-[var(--accent)] ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-6 w-6"
      >
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
