DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'isUndelivered') THEN
        ALTER TABLE materials ADD COLUMN "isUndelivered" BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'isPaid') THEN
        ALTER TABLE materials ADD COLUMN "isPaid" BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'orderedQuantity') THEN
        ALTER TABLE materials ADD COLUMN "orderedQuantity" NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'vendorName') THEN
        ALTER TABLE materials ADD COLUMN "vendorName" TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materials' AND column_name = 'paidDate') THEN
        ALTER TABLE materials ADD COLUMN "paidDate" TEXT;
    END IF;
END $$;
