-- Guest checkout: customerId is no longer required, and orders carry
-- contact details directly when there's no Customer row (no auth yet).
ALTER TABLE "Order" ALTER COLUMN "customerId" DROP NOT NULL;
ALTER TABLE "Order" ADD COLUMN "guestName" TEXT;
ALTER TABLE "Order" ADD COLUMN "guestEmail" TEXT;
ALTER TABLE "Order" ADD COLUMN "guestPhone" TEXT;

-- Rename leftover Razorpay columns to PhonePe now that the payment
-- provider is confirmed — renaming (not drop+add) preserves the columns'
-- unique constraints and avoids a second migration later.
ALTER TABLE "Order" RENAME COLUMN "razorpayOrderId" TO "phonepeMerchantTransactionId";
ALTER TABLE "Order" RENAME COLUMN "razorpayPaymentId" TO "phonepeTransactionId";

ALTER INDEX "Order_razorpayOrderId_key" RENAME TO "Order_phonepeMerchantTransactionId_key";
ALTER INDEX "Order_razorpayPaymentId_key" RENAME TO "Order_phonepeTransactionId_key";
