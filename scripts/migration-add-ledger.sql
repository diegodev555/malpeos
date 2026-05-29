-- ============================================================
-- Migration: Add Accounts/Ledger system
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. PARTIES TABLE (vendors, crew, suppliers)
CREATE TABLE IF NOT EXISTS parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'vendor' CHECK (type IN ('vendor', 'crew', 'supplier', 'other')),
  contact TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. LEDGER ENTRIES TABLE (financial transactions per party, linked to boat/trip)
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ledger_entries_party_id ON ledger_entries(party_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_boat_id ON ledger_entries(boat_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_trip_id ON ledger_entries(trip_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_entry_date ON ledger_entries(entry_date);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR PARTIES
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

-- 5. RLS POLICIES FOR LEDGER ENTRIES
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

-- 6. TRIGGER for parties.updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_parties_updated_at ON parties;
CREATE TRIGGER trg_parties_updated_at
  BEFORE UPDATE ON parties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 7. SEED DATA: Sample parties (safe to run multiple times)
INSERT INTO parties (name, type, contact, notes) VALUES
  ('Harbor Marine Services', 'vendor', '+91-9876543210', 'Dry dock and maintenance'),
  ('Fish Market Co-op', 'supplier', '+91-9876543211', 'Ice and supplies'),
  ('Deckhand Ramesh', 'crew', NULL, 'Regular crew member')
ON CONFLICT DO NOTHING;