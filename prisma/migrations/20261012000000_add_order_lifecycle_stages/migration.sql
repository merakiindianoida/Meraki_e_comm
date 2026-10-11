ALTER TYPE "OrderStatus" ADD VALUE 'PAYMENT_FAILED';
ALTER TYPE "OrderStatus" ADD VALUE 'PACKED';

ALTER TYPE "ReturnStatus" ADD VALUE 'RECEIVED';
ALTER TYPE "ReturnStatus" ADD VALUE 'REFUND_INITIATED';

CREATE TYPE "ReturnType" AS ENUM ('RETURN', 'EXCHANGE');
ALTER TABLE "ReturnRequest" ADD COLUMN "type" "ReturnType" NOT NULL DEFAULT 'RETURN';

CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
