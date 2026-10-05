import type { Metadata, Viewport } from "next";
import { Jost, DM_Mono, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BUSINESS } from "@/lib/siteInfo";
import "./globals.css";

const SITE_URL = `https://${BUSINESS.website}`;

// Jost (body/UI) + DM Mono (prices, SKUs, tracked labels) + Playfair
// Display (headings) - replaces the earlier Geist pairing to match the
// client's typography spec.
const jostSans = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const displaySerif = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E1822",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Meraki Fine Silver | Handcrafted 925 Silver Jewellery",
    template: "%s | Meraki Fine Silver",
  },
  description:
    "Handcrafted BIS hallmarked 925 silver jewellery for kids, women, and men. From nazariyas and studs to rings, necklaces, and pendants — made with soul in Noida. Delhi NCR delivery in 3–10 business days.",
  keywords: [
    "925 silver jewellery",
    "meraki fine silver",
    "handcrafted silver india",
    "BIS hallmarked silver",
    "silver nazariya",
    "silver earrings",
    "silver rings",
    "silver necklaces",
    "noida silver jeweller",
    "delhi ncr silver delivery",
  ],
  authors: [{ name: BUSINESS.name }],
  creator: BUSINESS.name,
  publisher: BUSINESS.name,
  alternates: {
    canonical: "/",
    languages: {
      "en-IN": "/",
    },
  },
  category: "Jewellery",
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Meraki Fine Silver | Handcrafted 925 Silver Jewellery",
    description:
      "Handcrafted BIS hallmarked 925 silver jewellery for every member of the family. Made with soul in Noida. Delhi NCR delivery in 3–10 business days.",
    siteName: "Meraki Fine Silver",
    locale: "en_IN",
    countryName: "India",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Meraki Fine Silver — 925 Silver Jewellery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Meraki Fine Silver | Handcrafted 925 Silver Jewellery",
    description:
      "Handcrafted BIS hallmarked 925 silver jewellery. Made with soul in Noida. Delhi NCR delivery in 3–10 days.",
    creator: "@meraki_fine_silver",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${jostSans.variable} ${dmMono.variable} ${displaySerif.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <Header />
          {/* Each page owns its own <main> — keeps exactly one main landmark
              per page instead of nesting one here around another in every
              page.tsx. */}
          <div className="flex-1">{children}</div>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
