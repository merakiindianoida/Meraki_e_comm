-- AlterTable
ALTER TABLE "Order" ADD COLUMN "deliveredAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN "stockShortfall" BOOLEAN NOT NULL DEFAULT false;

-- Backfill: best available delivery date for orders already delivered before this column existed
UPDATE "Order" SET "deliveredAt" = "updatedAt" WHERE "status" = 'DELIVERED';
