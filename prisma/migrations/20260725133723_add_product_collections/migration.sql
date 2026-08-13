-- Pre-existing drift: `collections` was already declared on Product in
-- schema.prisma (curated groupings like "Birthday Gifting", "Marriage")
-- but had never actually been migrated to the database. Catching up here.
ALTER TABLE "Product" ADD COLUMN "collections" TEXT[] NOT NULL DEFAULT '{}';
