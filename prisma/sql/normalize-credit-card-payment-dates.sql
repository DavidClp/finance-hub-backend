-- Reexecutable backfill for payment_date and credit installment purchase dates.
-- Safe to run more than once: only fills rows still missing payment_date
-- and only rewinds installment dates that still follow the old pattern
-- (date = payment_date - 1 month).

UPDATE "transactions"
SET "payment_date" = "date"
WHERE "payment_date" IS NULL
  AND "payment_method" <> 'credit';

UPDATE "transactions"
SET "payment_date" = "date" + INTERVAL '1 month'
WHERE "payment_date" IS NULL
  AND "payment_method" = 'credit';

UPDATE "transactions"
SET "date" = "date" - ((COALESCE("installment_number", 1) - 1) || ' month')::interval
WHERE "payment_method" = 'credit'
  AND "is_installment" = true
  AND "payment_date" IS NOT NULL
  AND "date" = "payment_date" - INTERVAL '1 month';
