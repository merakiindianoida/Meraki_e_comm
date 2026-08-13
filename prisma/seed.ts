// Dev/demo catalog data — run via `npm run db:seed` (or automatically after
// `prisma migrate dev`, since it's wired up in prisma.config.ts). Uses
// upsert-by-slug so it's safe to re-run without creating duplicates.
// Not meant for production seeding; the client will manage the real catalog
// through the admin panel once that's built.
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Standalone script, so it needs its own client instance rather than the
// shared one in lib/prisma.ts (that one assumes a long-lived Next.js
// process and hangs onto a global for hot-reload — irrelevant here).
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const products = [
  {
    name: "Little Guardian Nazariya Bracelet",
    slug: "little-guardian-nazariya-bracelet",
    category: "Nazariya",
    audience: "Kids",
    price: 850,
    weightGrams: 4.2,
    description:
      "A delicate nazariya bracelet sized for little wrists, meant to ward off the evil eye.",
    sku: "MRK-NAZ-001",
    stock: 12,
  },
  {
    name: "Classic Nazariya Bracelet",
    slug: "classic-nazariya-bracelet",
    category: "Nazariya",
    audience: "Elders",
    price: 950,
    weightGrams: 5.5,
    description: "A timeless nazariya design, handcrafted for everyday wear.",
    sku: "MRK-NAZ-002",
    stock: 10,
  },
  {
    name: "Woven Vine Bracelet",
    slug: "woven-vine-bracelet",
    category: "Bracelet",
    audience: "Women",
    price: 1850,
    weightGrams: 8.4,
    description: "A fine woven vine pattern bracelet in 925 silver.",
    sku: "MRK-BRC-001",
    stock: 8,
  },
  {
    name: "Curb Chain Bracelet",
    slug: "curb-chain-bracelet",
    category: "Bracelet",
    audience: "Men",
    price: 2200,
    weightGrams: 12.1,
    description: "A bold curb-link bracelet built for daily wear.",
    sku: "MRK-BRC-002",
    stock: 6,
  },
  {
    name: "Engraved Leaf Bangle",
    slug: "engraved-leaf-bangle",
    category: "Bangle",
    audience: "Women",
    price: 2650,
    weightGrams: 14.3,
    description: "Hand-engraved leaf motifs wrap around this classic bangle.",
    sku: "MRK-BNG-001",
    stock: 5,
  },
  {
    name: "Baby's First Bangle",
    slug: "babys-first-bangle",
    category: "Bangle",
    audience: "Kids",
    price: 1200,
    weightGrams: 6.0,
    description: "A soft, rounded bangle sized for infants and toddlers.",
    sku: "MRK-BNG-002",
    stock: 14,
  },
  {
    name: "Minimal Dot Studs",
    slug: "minimal-dot-studs",
    category: "Stud",
    audience: "Women",
    price: 950,
    weightGrams: 2.1,
    description: "Simple dot studs for everyday wear.",
    sku: "MRK-STD-001",
    stock: 20,
  },
  {
    name: "Classic Ball Studs",
    slug: "classic-ball-studs",
    category: "Stud",
    audience: "Unisex",
    price: 750,
    weightGrams: 1.8,
    description: "Understated ball studs that suit everyone.",
    sku: "MRK-STD-002",
    stock: 25,
  },
  {
    name: "Delicate Flower Nose Pin",
    slug: "delicate-flower-nose-pin",
    category: "Nose Pin",
    audience: "Women",
    price: 650,
    weightGrams: 0.6,
    description: "A tiny flower-shaped nose pin, hand-finished.",
    sku: "MRK-NSP-001",
    stock: 18,
  },
  {
    name: "Crescent Moon Pendant",
    slug: "crescent-moon-pendant",
    category: "Pendant",
    audience: "Women",
    price: 1450,
    weightGrams: 3.2,
    description: "A crescent moon pendant on a fine silver chain.",
    sku: "MRK-PND-001",
    stock: 9,
  },
  {
    name: "Om Pendant",
    slug: "om-pendant",
    category: "Pendant",
    audience: "Unisex",
    price: 1350,
    weightGrams: 3.8,
    description: "A classic Om pendant, handcrafted in 925 silver.",
    sku: "MRK-PND-002",
    stock: 11,
  },
  {
    name: "Rope Chain 20-inch",
    slug: "rope-chain-20-inch",
    category: "Chain",
    audience: "Men",
    price: 3200,
    weightGrams: 18.5,
    description: "A substantial 20-inch rope chain for daily wear.",
    sku: "MRK-CHN-001",
    stock: 4,
  },
  {
    name: "Fine Box Chain",
    slug: "fine-box-chain",
    category: "Chain",
    audience: "Women",
    price: 1650,
    weightGrams: 6.7,
    description: "A delicate box chain, perfect on its own or layered.",
    sku: "MRK-CHN-002",
    stock: 13,
  },
  {
    name: "Beaded Ghungroo Anklet",
    slug: "beaded-ghungroo-anklet",
    category: "Anklet",
    audience: "Women",
    price: 1750,
    weightGrams: 9.2,
    description: "An anklet with tiny ghungroo bells for a soft jingle.",
    sku: "MRK-ANK-001",
    stock: 7,
  },
  {
    name: "Tiny Bells Anklet",
    slug: "tiny-bells-anklet",
    category: "Anklet",
    audience: "Kids",
    price: 1100,
    weightGrams: 5.0,
    description: "A lightweight anklet with tiny bells, sized for little feet.",
    sku: "MRK-ANK-002",
    stock: 10,
  },
  {
    name: "Simple Chain Anklet",
    slug: "simple-chain-anklet",
    category: "Anklet",
    audience: "Elders",
    price: 1250,
    weightGrams: 7.0,
    description: "A plain chain anklet, comfortable for everyday wear.",
    sku: "MRK-ANK-003",
    stock: 9,
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: { ...product, images: [] },
    });
  }
  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
