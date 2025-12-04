-- Migration: Create call_logs table only
-- Run this if you already have users and grandparents tables

-- Create call_logs table to track call responses
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grandparent_id UUID NOT NULL REFERENCES grandparents(id) ON DELETE CASCADE,
  answered BOOLEAN NOT NULL, -- true if they answered the phone, false if not
  answer TEXT, -- 'yes' if they took medication, 'no' if they didn't, NULL if not answered
  call_date DATE NOT NULL, -- Date of the call (for tracking daily status)
  called_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(grandparent_id, call_date) -- One call log per grandparent per day
);

-- Create index on grandparent_id for faster queries
CREATE INDEX IF NOT EXISTS idx_call_logs_grandparent_id ON call_logs(grandparent_id);

-- Create index on called_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_call_logs_called_at ON call_logs(called_at);

-- Create index on call_date for date-based queries
CREATE INDEX IF NOT EXISTS idx_call_logs_call_date ON call_logs(call_date);

-- Enable Row Level Security for call_logs table
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for call_logs table
-- Open policies to allow all operations for everyone (needed for webhook)

-- Allow anyone to insert call logs
CREATE POLICY "Allow insert for call logs" ON call_logs
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to read call logs
CREATE POLICY "Allow select for call logs" ON call_logs
  FOR SELECT
  USING (true);

-- Allow anyone to update call logs
CREATE POLICY "Allow update for call logs" ON call_logs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anyone to delete call logs
CREATE POLICY "Allow delete for call logs" ON call_logs
  FOR DELETE
  USING (true);

