import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toPublicProduct } from "@/lib/catalog";

// Single-product lookup by slug. Same audience as the list route above —
// external/client-side consumers, not our own pages.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    // Inactive products 404 the same as missing ones — a discontinued/hidden
    // SKU shouldn't be distinguishable from one that never existed.
    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product: toPublicProduct(product) });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}