import Link from "next/link";
import Image from "next/image";
import PlaceholderImage from "@/components/PlaceholderImage";
import WishlistButton from "@/components/WishlistButton";
import AddToBagButton from "@/components/AddToBagButton";
import { formatPrice } from "@/lib/catalog";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  images: string[];
  category: string;
  stock: number;
};

export default function ProductCard({ product }: { product: ProductCardData }) {
  const outOfStock = product.stock <= 0;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden border border-[var(--border-strong)]">
        {product.images?.[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] ${
              outOfStock ? "grayscale-[0.5] opacity-60" : ""
            }`}
          />
        ) : (
          <PlaceholderImage category={product.category} />
        )}

        
        {outOfStock && (
          <span className="absolute left-2 top-2 z-10 bg-[var(--ink)] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-white">
            Out of Stock
          </span>
        )}

        
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

        
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity duration-500 group-hover:from-black/85" />

        
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
