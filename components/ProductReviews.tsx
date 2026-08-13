function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      className="h-4 w-4"
    >
      <path
        d="M12 3.5l2.47 5.51 5.98.6-4.5 4.06 1.28 5.93L12 16.75l-5.23 2.85 1.28-5.93-4.5-4.06 5.98-.6L12 3.5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-[var(--accent)]">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= Math.round(rating)} />
      ))}
    </div>
  );
}

// First name + last initial only - a reviewer's full name is real personal
// data, and this is the same "first name, last initial" convention every
// major storefront uses on public reviews.
function displayName(fullName: string | null): string {
  if (!fullName) return "Verified Buyer";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export type ProductReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  customer: { name: string | null };
};

// Purely presentational — the product page fetches the reviews and average
// server-side and hands them in, same division of labor as everywhere else
// on this site that queries Prisma in the page and passes plain props down.
export default function ProductReviews({
  reviews,
  averageRating,
}: {
  reviews: ProductReview[];
  averageRating: number | null;
}) {
  return (
    <section id="reviews" className="mt-16 border-t border-[var(--border)] pt-10">
      <div className="flex items-center gap-3">
        <h2 className="font-serif text-2xl text-[var(--ink)]">Reviews</h2>
        {averageRating !== null && (
          <div className="flex items-center gap-2">
            <StarRow rating={averageRating} />
            <span className="text-sm text-[var(--muted)]">
              {averageRating.toFixed(1)} ({reviews.length} review
              {reviews.length === 1 ? "" : "s"})
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted)]">
          No reviews yet — reviews appear here once customers who bought this
          piece have received it.
        </p>
      ) : (
        <ul className="mt-6 space-y-6">
          {reviews.map((review) => (
            <li key={review.id} className="border-b border-[var(--border)] pb-6 last:border-0">
              <div className="flex items-center justify-between gap-3">
                <StarRow rating={review.rating} />
                <span className="text-xs text-[var(--muted)]">
                  {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
                    review.createdAt
                  )}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                {displayName(review.customer.name)}
              </p>
              {review.comment && (
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
                  {review.comment}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
