import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toPublicProduct } from "@/lib/catalog";

// Public catalog endpoint - used by anything outside a Server Component
// (mobile clients, future client-side cart/search widgets, etc). The
// site's own pages hit Prisma directly instead of calling this, since
// they're already running on the server; this route exists for everyone else.

// Query params are attacker-controlled, so nothing here gets passed to
// Prisma without being checked first. A malformed value should just be
// dropped from the filter, not crash the request.
const MAX_SEARCH_LENGTH = 100;
const MAX_RESULTS = 60;

// Reject non-finite / negative numbers rather than letting NaN reach Prisma,
// which would throw and turn into an unhelpful 500.
function parsePrice(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category = params.get("category");
  const audience = params.get("audience");
  const search = params.get("search")?.trim().slice(0, MAX_SEARCH_LENGTH);
  const minPrice = parsePrice(params.get("minPrice"));
  const maxPrice = parsePrice(params.get("maxPrice"));

  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
        ...(audience && { audience }),
        ...(search && {
          name: { contains: search, mode: "insensitive" },
        }),
        ...((minPrice !== undefined || maxPrice !== undefined) && {
          price: {
            ...(minPrice !== undefined && { gte: minPrice }),
            ...(maxPrice !== undefined && { lte: maxPrice }),
          },
        }),
      },
      orderBy: { createdAt: "desc" },
      take: MAX_RESULTS, // hard cap so the catalog can't be scraped in one shot as it grows
    });

    return NextResponse.json({ products: products.map(toPublicProduct) });
  } catch (error) {
    // Log the real error server-side only - the client just gets a generic
    // message, never stack traces or query details.
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}