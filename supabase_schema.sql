-- Supabase SQL Schema for Feng Shui Consultation System
-- Run this in your Supabase SQL Editor

-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User identification (composite key)
    email TEXT NOT NULL,
    birth_date TEXT NOT NULL,
    gender TEXT NOT NULL CHECK (gender IN ('男', '女')),
    house_type TEXT NOT NULL,
    floor_plans_hash TEXT NOT NULL, -- Hash of floor plan file IDs
    
    -- Agent 1 Results (Layout Grid)
    layout_grid_result JSONB NOT NULL,
    layout_conversation_id TEXT NOT NULL,
    
    -- Agent 2 Results (Energy Summary)
    energy_summary_result JSONB NOT NULL,
    energy_conversation_id TEXT NOT NULL,
    
    -- Full Report (after payment)
    full_report_result JSONB,
    report_conversation_id TEXT,
    payment_completed BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one record per user+config combination
    UNIQUE(email, birth_date, gender, house_type, floor_plans_hash)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_consultations_email ON consultations(email);
CREATE INDEX IF NOT EXISTS idx_consultations_lookup ON consultations(email, birth_date, gender, house_type, floor_plans_hash);
CREATE INDEX IF NOT EXISTS idx_consultations_updated ON consultations(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own consultations (by email)
CREATE POLICY "Users can read own consultations"
ON consultations
FOR SELECT
USING (true); -- For now, allow all reads (you can restrict by auth.uid() if using Supabase Auth)

-- Policy: Users can insert their own consultations
CREATE POLICY "Users can insert own consultations"
ON consultations
FOR INSERT
WITH CHECK (true);

-- Policy: Users can update their own consultations
CREATE POLICY "Users can update own consultations"
ON consultations
FOR UPDATE
USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before update
CREATE TRIGGER update_consultations_updated_at
BEFORE UPDATE ON consultations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add floor_plans_data column for complete floor plans metadata
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS floor_plans_data JSONB;

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

-- Comments for documentation
COMMENT ON TABLE consultations IS 'Stores feng shui consultation results and user progress';
COMMENT ON COLUMN consultations.floor_plans_hash IS 'Hash of floor plan file IDs to detect changes';
COMMENT ON COLUMN consultations.floor_plans_data IS 'Complete floor plans metadata including fileIds, previews, floorIndex, etc.';
COMMENT ON COLUMN consultations.layout_grid_result IS 'Agent 1 output: 9-grid layout analysis';
COMMENT ON COLUMN consultations.energy_summary_result IS 'Agent 2 output: 5-dimension energy scores';
COMMENT ON COLUMN consultations.full_report_result IS 'Complete report after payment';

-- Create payments table for Stripe payment records
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key to consultations
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    
    -- Stripe payment information
    payment_intent_id TEXT NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'usd',
    status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded', 'canceled')),
    
    -- Optional Stripe customer information
    stripe_customer_id TEXT,
    
    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_consultation_id ON payments(consultation_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent_id ON payments(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Add payment_id column to consultations table
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id) ON DELETE SET NULL;

-- Create index for payment_id in consultations
CREATE INDEX IF NOT EXISTS idx_consultations_payment_id ON consultations(payment_id);

-- Enable Row Level Security for payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read payments (for now, allow all reads)
CREATE POLICY "Users can read payments"
ON payments
FOR SELECT
USING (true);

-- Policy: System can insert payments
CREATE POLICY "System can insert payments"
ON payments
FOR INSERT
WITH CHECK (true);

-- Policy: System can update payments
CREATE POLICY "System can update payments"
ON payments
FOR UPDATE
USING (true);

-- Trigger to automatically update updated_at timestamp for payments
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments for payments table
COMMENT ON TABLE payments IS 'Stores Stripe payment records for consultations';
COMMENT ON COLUMN payments.payment_intent_id IS 'Stripe PaymentIntent ID (unique identifier)';
COMMENT ON COLUMN payments.consultation_id IS 'Foreign key to consultations table';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, succeeded, failed, refunded, canceled';
