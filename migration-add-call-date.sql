-- Migration: Add call_date column and unique constraint to call_logs table
-- Run this if you already have a call_logs table

-- Add call_date column if it doesn't exist
ALTER TABLE call_logs 
ADD COLUMN IF NOT EXISTS call_date DATE;

-- Update existing records to use called_at date as call_date
UPDATE call_logs 
SET call_date = DATE(called_at) 
WHERE call_date IS NULL;

-- Make call_date NOT NULL after updating existing records
ALTER TABLE call_logs 
ALTER COLUMN call_date SET NOT NULL;

-- Add unique constraint on (grandparent_id, call_date)
-- This ensures one call log per grandparent per day
ALTER TABLE call_logs 
ADD CONSTRAINT call_logs_grandparent_date_unique 
UNIQUE (grandparent_id, call_date);

-- Create index on call_date if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_call_logs_call_date ON call_logs(call_date);

