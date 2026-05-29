-- ============================================================
-- Migration: Add SECURITY INVOKER to views
-- Run this in Supabase SQL Editor
--
-- PostgreSQL views default to running with the owner's permissions
-- (similar to SECURITY DEFINER for functions). This means RLS
-- policies of the view owner apply, not the querying user.
--
-- Adding security_invoker = true makes the view respect the
-- calling user's RLS policies instead.
-- Requires PostgreSQL 15+ (Supabase supports this).
-- ============================================================

-- Fix trip_summary view: use security_invoker
ALTER VIEW trip_summary SET (security_invoker = true);

-- Fix boat_summary view: use security_invoker (only if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'boat_summary' AND relkind = 'v') THEN
    ALTER VIEW boat_summary SET (security_invoker = true);
  END IF;
END $$;
