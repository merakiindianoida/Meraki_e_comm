import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toPublicProduct } from "@/lib/catalog";


const MAX_SEARCH_LENGTH = 100;
const MAX_RESULTS = 60;

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
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}