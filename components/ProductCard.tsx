import Link from "next/link";
import PlaceholderImage from "@/components/PlaceholderImage";
import WishlistButton from "@/components/WishlistButton";
import AddToBagButton from "@/components/AddToBagButton";
import { formatPrice } from "@/lib/catalog";

// Reused on the homepage grid and the /products listing - kept as a plain
// object shape (not the full Prisma Product type) so callers can pass in
// either a raw Prisma row or hand-rolled data without fighting Decimal types.
export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  images: string[];
  category: string;
  stock: number;
};

// Caption (category/name/price) is overlaid on the image itself, white text
// on a permanent dark gradient scrim, rather than sitting below in a
// separate white block - that's what makes a photo-led card look premium.
// It works the same whether there's a real photo or the placeholder box
// behind it; the placeholder still honestly says "X Image", it just also
// carries the same caption treatment the real photos will use later.
export default function ProductCard({ product }: { product: ProductCardData }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden border border-[var(--border-strong)]">
        {product.images?.[0] ? (
          // Plain <img> on purpose — final image host (Cloudinary) isn't wired
          // up yet, so there's no remote domain to point next/image at.
          // Swap this for next/image once that lands, for the built-in
          // size/format optimization.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] ${
              outOfStock ? "grayscale-[0.5] opacity-60" : ""
            }`}
          />
        ) : (
          <PlaceholderImage category={product.category} />
        )}

        {/* Visible without hovering — unlike the Add to Bag chip below,
            unavailability shouldn't require a hover to discover. */}
        {outOfStock && (
          <span className="absolute left-2 top-2 z-10 bg-[var(--ink)] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-white">
            Out of Stock
          </span>
        )}

        {/* Fades in top-right on hover; stays visible once wishlisted so the
            filled heart is a persistent signal, not just a hover reveal. */}
        <WishlistButton
          item={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            image: product.images?.[0] ?? null,
            category: product.category,
          }}
        />

        {/* Permanent scrim — not hover-only — so the white caption below
            stays legible over any photo. Stronger on hover as part of the
            same transition the "Add to Bag" chip uses. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity duration-500 group-hover:from-black/85" />

        {/* "Add to Bag" rises from the bottom on hover, sitting above the
            caption rather than over it. Stops propagation so it adds to the
            cart instead of also following the card's outer <Link>. */}
        <div className="absolute inset-x-3 bottom-16 translate-y-3 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100">
          <AddToBagButton
            item={{
              id: product.id,
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.images?.[0] ?? null,
              category: product.category,
              maxQuantity: product.stock,
            }}
            className="block w-full rounded-lg bg-white py-2 text-center text-xs uppercase tracking-[0.15em] text-[var(--ink)] transition duration-500 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {/* Caption, overlaid on the scrim. */}
        <div className="absolute inset-x-3 bottom-3 text-white">
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/70">
            {product.category}
          </p>
          <h3 className="text-base font-medium">{product.name}</h3>
          <p className="font-mono text-sm text-white/90">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}
