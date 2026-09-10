-- Run this first, then wait for Success.
-- SMW V2: scheduled matches and public calendar
DO $$ BEGIN ALTER TYPE public.match_status ADD VALUE IF NOT EXISTS 'scheduled' BEFORE 'open'; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

