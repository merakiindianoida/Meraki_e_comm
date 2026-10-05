import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { STOREFRONT_CATEGORIES } from "@/lib/storefrontCatalog";
import { AUDIENCES } from "@/lib/catalog";
import { POLICY_PAGES, BUSINESS } from "@/lib/siteInfo";

const SITE_URL = `https://${BUSINESS.website}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  entries.push({
    url: SITE_URL,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1,
  });

  entries.push({
    url: `${SITE_URL}/products`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.95,
  });

  entries.push({
    url: `${SITE_URL}/contact`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.5,
  });

  for (const page of POLICY_PAGES) {
    entries.push({
      url: `${SITE_URL}${page.href}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    });
  }

  for (const category of STOREFRONT_CATEGORIES) {
    entries.push({
      url: `${SITE_URL}/products?category=${encodeURIComponent(category)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    });
  }

  for (const audience of AUDIENCES) {
    entries.push({
      url: `${SITE_URL}/products?audience=${encodeURIComponent(audience)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    });
  }

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  for (const product of products) {
    entries.push({
      url: `${SITE_URL}/products/${encodeURIComponent(product.slug)}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.85,
    });
  }

  return entries;
}
