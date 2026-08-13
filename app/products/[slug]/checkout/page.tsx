import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getSavedAddresses } from "@/lib/customer";
import BuyNowCheckout from "@/components/BuyNowCheckout";

// "Buy Now" express checkout for a single product - bypasses the bag
// entirely. Reuses the same CheckoutClient (via BuyNowCheckout) as the
// bag-based /checkout, just with a single, locally-held line item instead
// of reading from the cart store.
export default async function ProductCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ qty?: string }>;
}) {
  const { slug } = await params;
  const { qty } = await searchParams;

  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=/products/${slug}/checkout`);
  }

  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product || !product.isActive || product.stock <= 0) {
    notFound();
  }

  // Clamp whatever arrives in the URL to a sane range — it's user-editable,
  // so it could be missing, non-numeric, zero, or larger than actual stock.
  const requestedQty = Number(qty);
  const initialQuantity = Number.isInteger(requestedQty)
    ? Math.min(Math.max(requestedQty, 1), product.stock)
    : 1;

  const addresses = await getSavedAddresses(userId);

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-[var(--muted)]">
        <Link href={`/products/${product.slug}`} className="hover:text-[var(--accent)]">
          {product.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--ink)]">Checkout</span>
      </nav>

      <h1 className="mt-4 font-serif text-3xl text-[var(--ink)]">Checkout</h1>

      <div className="mt-8">
        <BuyNowCheckout
          productId={product.id}
          name={product.name}
          image={product.images[0] ?? null}
          category={product.category}
          unitPrice={parseFloat(product.price.toString())}
          maxQuantity={product.stock}
          initialQuantity={initialQuantity}
          addresses={addresses}
        />
      </div>
    </main>
  );
}
