import type { MetadataRoute } from "next";
import { BUSINESS } from "@/lib/siteInfo";

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = `https://${BUSINESS.website}`;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/checkout/",
          "/orders/",
          "/account/",
          "/bag/",
          "/wishlist/",
          "/sign-in/",
          "/sign-up/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
