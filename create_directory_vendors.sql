-- ========================================================
-- Schema for Global Vendor & Service Provider Directory
-- ========================================================

CREATE TABLE IF NOT EXISTS public.directory_vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "contactPerson" TEXT,
    category TEXT,
    phone TEXT,
    whatsapp TEXT,
    "secondaryPhone" TEXT,
    email TEXT,
    city TEXT,
    address TEXT,
    services TEXT,
    notes TEXT,
    rating NUMERIC DEFAULT 0,
    "visitedDate" TEXT,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.directory_vendors ENABLE ROW LEVEL SECURITY;

-- Allow full read and write access for authenticated & anonymous users
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'directory_vendors' 
        AND policyname = 'Allow public read-write for directory_vendors'
    ) THEN
        CREATE POLICY "Allow public read-write for directory_vendors" 
        ON public.directory_vendors 
        FOR ALL 
        USING (true) 
        WITH CHECK (true);
    END IF;
END $$;
