-- ============================================================
-- MalpeOS - Fleet Management & Financial Tracking for Fishing
-- Supabase PostgreSQL Schema
-- ============================================================

-- 1. BOATS TABLE
CREATE TABLE IF NOT EXISTS boats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration TEXT NOT NULL UNIQUE,
  engine_details TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. TRIPS TABLE
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  boat_id UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. CATCH LOGS TABLE
CREATE TABLE IF NOT EXISTS catch_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  species TEXT NOT NULL,
  weight_kg NUMERIC(10,2) NOT NULL CHECK (weight_kg > 0),
  price_per_kg NUMERIC(10,2) NOT NULL CHECK (price_per_kg >= 0),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('Fuel', 'Maintenance', 'Port Fees', 'Wages', 'Ice', 'Other')),
  base_amount NUMERIC(12,2) NOT NULL CHECK (base_amount >= 0),
  gst_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (gst_amount >= 0),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. TRIP BILLS / ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS trip_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. PARTIES / ACCOUNTS TABLE (vendors, crew, suppliers)
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'vendor' CHECK (type IN ('vendor', 'crew', 'supplier', 'other')),
  contact TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. LEDGER ENTRIES TABLE (tracking financial transactions per party, optionally per boat/trip)
CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
  boat_id UUID REFERENCES boats(id) ON DELETE SET NULL,
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('debit', 'credit')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_trips_boat_id ON trips(boat_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_dates ON trips(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_catch_logs_trip_id ON catch_logs(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_trip_bills_trip_id ON trip_bills(trip_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_party_id ON ledger_entries(party_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_boat_id ON ledger_entries(boat_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_trip_id ON ledger_entries(trip_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_entry_date ON ledger_entries(entry_date);

-- ============================================================
-- STORAGE: trip-bills bucket + anon upload policies
-- Run in Supabase SQL Editor (not via migration) if bucket doesn't exist
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('trip-bills', 'trip-bills', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- DROP POLICY IF EXISTS "anon_upload_trip_bills" ON storage.objects;
-- CREATE POLICY "anon_upload_trip_bills"
--   ON storage.objects FOR INSERT TO anon
--   WITH CHECK (bucket_id = 'trip-bills');
--
-- DROP POLICY IF EXISTS "anon_read_trip_bills" ON storage.objects;
-- CREATE POLICY "anon_read_trip_bills"
--   ON storage.objects FOR SELECT TO anon
--   USING (bucket_id = 'trip-bills');
--
-- DROP POLICY IF EXISTS "anon_delete_trip_bills" ON storage.objects;
-- CREATE POLICY "anon_delete_trip_bills"
--   ON storage.objects FOR DELETE TO anon
--   USING (bucket_id = 'trip-bills');

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- This app currently uses the public anon key without user login,
-- so anon users need CRUD access to the fleet tables.
-- ============================================================
ALTER TABLE boats ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE catch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- Boats policies
DROP POLICY IF EXISTS "Allow anon read boats" ON boats;
DROP POLICY IF EXISTS "Allow anon insert boats" ON boats;
DROP POLICY IF EXISTS "Allow anon update boats" ON boats;
DROP POLICY IF EXISTS "Allow anon delete boats" ON boats;

CREATE POLICY "Allow anon read boats"
  ON boats FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert boats"
  ON boats FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update boats"
  ON boats FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete boats"
  ON boats FOR DELETE TO anon USING (true);

-- Trips policies
DROP POLICY IF EXISTS "Allow anon read trips" ON trips;
DROP POLICY IF EXISTS "Allow anon insert trips" ON trips;
DROP POLICY IF EXISTS "Allow anon update trips" ON trips;
DROP POLICY IF EXISTS "Allow anon delete trips" ON trips;

CREATE POLICY "Allow anon read trips"
  ON trips FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert trips"
  ON trips FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update trips"
  ON trips FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete trips"
  ON trips FOR DELETE TO anon USING (true);

-- Catch logs policies
DROP POLICY IF EXISTS "Allow anon read catch logs" ON catch_logs;
DROP POLICY IF EXISTS "Allow anon insert catch logs" ON catch_logs;
DROP POLICY IF EXISTS "Allow anon update catch logs" ON catch_logs;
DROP POLICY IF EXISTS "Allow anon delete catch logs" ON catch_logs;

CREATE POLICY "Allow anon read catch logs"
  ON catch_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert catch logs"
  ON catch_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update catch logs"
  ON catch_logs FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete catch logs"
  ON catch_logs FOR DELETE TO anon USING (true);

-- Expenses policies
DROP POLICY IF EXISTS "Allow anon read expenses" ON expenses;
DROP POLICY IF EXISTS "Allow anon insert expenses" ON expenses;
DROP POLICY IF EXISTS "Allow anon update expenses" ON expenses;
DROP POLICY IF EXISTS "Allow anon delete expenses" ON expenses;

CREATE POLICY "Allow anon read expenses"
  ON expenses FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert expenses"
  ON expenses FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update expenses"
  ON expenses FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete expenses"
  ON expenses FOR DELETE TO anon USING (true);

-- Trip bills policies
DROP POLICY IF EXISTS "Allow anon read trip_bills" ON trip_bills;
DROP POLICY IF EXISTS "Allow anon insert trip_bills" ON trip_bills;
DROP POLICY IF EXISTS "Allow anon update trip_bills" ON trip_bills;
DROP POLICY IF EXISTS "Allow anon delete trip_bills" ON trip_bills;

CREATE POLICY "Allow anon read trip_bills"
  ON trip_bills FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert trip_bills"
  ON trip_bills FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update trip_bills"
  ON trip_bills FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete trip_bills"
  ON trip_bills FOR DELETE TO anon USING (true);

-- Parties policies
DROP POLICY IF EXISTS "Allow anon read parties" ON parties;
DROP POLICY IF EXISTS "Allow anon insert parties" ON parties;
DROP POLICY IF EXISTS "Allow anon update parties" ON parties;
DROP POLICY IF EXISTS "Allow anon delete parties" ON parties;

CREATE POLICY "Allow anon read parties"
  ON parties FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert parties"
  ON parties FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update parties"
  ON parties FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete parties"
  ON parties FOR DELETE TO anon USING (true);

-- Ledger entries policies (includes boat_id field)
DROP POLICY IF EXISTS "Allow anon read ledger_entries" ON ledger_entries;
DROP POLICY IF EXISTS "Allow anon insert ledger_entries" ON ledger_entries;
DROP POLICY IF EXISTS "Allow anon update ledger_entries" ON ledger_entries;
DROP POLICY IF EXISTS "Allow anon delete ledger_entries" ON ledger_entries;

CREATE POLICY "Allow anon read ledger_entries"
  ON ledger_entries FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert ledger_entries"
  ON ledger_entries FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update ledger_entries"
  ON ledger_entries FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon delete ledger_entries"
  ON ledger_entries FOR DELETE TO anon USING (true);

-- ============================================================
-- VIEW: Trip Summary (denormalized for quick dashboard queries)
-- ============================================================
CREATE OR REPLACE VIEW trip_summary AS
SELECT
  t.id AS trip_id,
  t.boat_id,
  b.name AS boat_name,
  t.start_date,
  t.end_date,
  t.status,
  COALESCE(cl.total_gross_revenue, 0) AS gross_revenue,
  COALESCE(e.total_base_amount, 0) AS total_base_expense,
  COALESCE(e.total_gst, 0) AS total_gst_paid,
  COALESCE(e.total_base_amount, 0) + COALESCE(e.total_gst, 0) AS total_expense,
  COALESCE(cl.total_gross_revenue, 0) - (COALESCE(e.total_base_amount, 0) + COALESCE(e.total_gst, 0)) AS net_profit
FROM trips t
JOIN boats b ON b.id = t.boat_id
LEFT JOIN (
  SELECT
    trip_id,
    SUM(weight_kg * price_per_kg) AS total_gross_revenue
  FROM catch_logs
  GROUP BY trip_id
) cl ON cl.trip_id = t.id
LEFT JOIN (
  SELECT
    trip_id,
    SUM(base_amount) AS total_base_amount,
    SUM(gst_amount) AS total_gst
  FROM expenses
  GROUP BY trip_id
) e ON e.trip_id = t.id;

-- ============================================================
-- TRIGGER: auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_boats_updated_at
  BEFORE UPDATE ON boats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_parties_updated_at
  BEFORE UPDATE ON parties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- VIEW: Boat Summary (aggregated financials per boat)
-- ============================================================
CREATE OR REPLACE VIEW boat_summary AS
SELECT
  b.id AS boat_id,
  b.name AS boat_name,
  b.registration,
  b.engine_details,
  b.image_url,
  COUNT(DISTINCT t.id) AS total_trips,
  COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'active') AS active_trips,
  COALESCE(SUM(cl.total_gross_revenue), 0) AS total_revenue,
  COALESCE(SUM(e.total_expense), 0) AS total_expense,
  COALESCE(SUM(cl.total_gross_revenue), 0) - COALESCE(SUM(e.total_expense), 0) AS total_net_profit
FROM boats b
LEFT JOIN trips t ON t.boat_id = b.id
LEFT JOIN (
  SELECT trip_id, SUM(weight_kg * price_per_kg) AS total_gross_revenue
  FROM catch_logs GROUP BY trip_id
) cl ON cl.trip_id = t.id
LEFT JOIN (
  SELECT trip_id, SUM(base_amount) + SUM(gst_amount) AS total_expense
  FROM expenses GROUP BY trip_id
) e ON e.trip_id = t.id
GROUP BY b.id, b.name, b.registration, b.engine_details, b.image_url;

-- ============================================================
-- BOAT IMAGE STORAGE: boat-images bucket
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('boat-images', 'boat-images', true)
-- ON CONFLICT (id) DO NOTHING;
--
-- DROP POLICY IF EXISTS "anon_upload_boat_images" ON storage.objects;
-- CREATE POLICY "anon_upload_boat_images"
--   ON storage.objects FOR INSERT TO anon
--   WITH CHECK (bucket_id = 'boat-images');
--
-- DROP POLICY IF EXISTS "anon_read_boat_images" ON storage.objects;
-- CREATE POLICY "anon_read_boat_images"
--   ON storage.objects FOR SELECT TO anon
--   USING (bucket_id = 'boat-images');
--
-- DROP POLICY IF EXISTS "anon_delete_boat_images" ON storage.objects;
-- CREATE POLICY "anon_delete_boat_images"
--   ON storage.objects FOR DELETE TO anon
--   USING (bucket_id = 'boat-images');

-- ============================================================
-- SEED DATA: Sample boats and parties
-- ============================================================
INSERT INTO boats (name, registration, engine_details, image_url) VALUES
  ('Sea Queen', 'IND-MP-2024-001', 'Leyland Iron Boat - 120HP', NULL),
  ('Wave Dancer', 'IND-MP-2024-002', 'Ashok Leyland - 95HP', NULL),
  ('Fish King', 'IND-MP-2024-003', 'Cummins Marine - 150HP', NULL)
ON CONFLICT (registration) DO NOTHING;

INSERT INTO parties (name, type, contact, notes) VALUES
  ('Harbor Marine Services', 'vendor', '+91-9876543210', 'Dry dock and maintenance'),
  ('Fish Market Co-op', 'supplier', '+91-9876543211', 'Ice and supplies'),
  ('Deckhand Ramesh', 'crew', NULL, 'Regular crew member')
ON CONFLICT DO NOTHING;