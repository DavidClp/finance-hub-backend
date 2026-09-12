-- AlterTable
ALTER TABLE "users" ADD COLUMN "credit_card_next_month" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN "payment_date" TIMESTAMP(3);

-- Backfill: non-credit pays on the purchase date
UPDATE "transactions" SET "payment_date" = "date" WHERE "payment_method" <> 'credit';

-- Backfill: credit invoice is always the following month
UPDATE "transactions" SET "payment_date" = "date" + INTERVAL '1 month' WHERE "payment_method" = 'credit';

-- Credit installments: restore the original purchase date (installment 1)
UPDATE "transactions"
SET "date" = "date" - ((COALESCE("installment_number", 1) - 1) || ' month')::interval
WHERE "payment_method" = 'credit' AND "is_installment" = true;

-- AlterTable
ALTER TABLE "transactions" ALTER COLUMN "payment_date" SET NOT NULL;

-- CreateIndex
CREATE INDEX "transactions_payment_date_idx" ON "transactions"("payment_date");
