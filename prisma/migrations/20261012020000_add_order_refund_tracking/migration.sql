ALTER TYPE "OrderStatus" ADD VALUE 'REFUNDED';

CREATE TYPE "OrderRefundStatus" AS ENUM ('NOT_REQUIRED', 'PENDING', 'REFUNDED');

ALTER TABLE "Order"
ADD COLUMN "refundStatus" "OrderRefundStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
ADD COLUMN "whatsappOptIn" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Order"
SET "refundStatus" = 'PENDING'
WHERE "status" = 'CANCELLED'
  AND "phonepeTransactionId" IS NOT NULL;
