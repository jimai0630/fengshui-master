-- Migration: Add report status tracking columns to consultations table
-- Run this in your Supabase SQL Editor if you get "column consultations.report_status does not exist" error

-- Add report generation status tracking columns for async PDF generation
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS report_status TEXT DEFAULT 'pending' 
    CHECK (report_status IN ('pending', 'processing', 'completed', 'failed'));

ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS report_error TEXT;

ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS report_started_at TIMESTAMPTZ;

ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS report_completed_at TIMESTAMPTZ;

-- Create index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_consultations_report_status 
ON consultations(report_status, email);

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'consultations' 
AND column_name IN ('report_status', 'report_error', 'report_started_at', 'report_completed_at')
ORDER BY column_name;

