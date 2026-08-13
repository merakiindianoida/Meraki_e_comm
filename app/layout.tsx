import type { Metadata } from "next";
import { Jost, DM_Mono, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

// Jost (body/UI) + DM Mono (prices, SKUs, tracked labels) + Playfair
// Display (headings) — replaces the earlier Geist pairing to match the
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

export const metadata: Metadata = {
  title: "Meraki | Fine 925 Silver Jewellery",
  description:
    "Handcrafted 925 silver jewellery for every member of the family.",
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
