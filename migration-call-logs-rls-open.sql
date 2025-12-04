-- Migration: Open RLS policies for call_logs table
-- This allows everyone to insert, select, update, and delete call logs
-- Run this if you're getting RLS policy violations

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow insert for call logs" ON call_logs;
DROP POLICY IF EXISTS "Users can read own call logs" ON call_logs;
DROP POLICY IF EXISTS "Allow update for call logs" ON call_logs;
DROP POLICY IF EXISTS "Allow delete for call logs" ON call_logs;

-- Create open policies that allow all operations for everyone
-- This is needed for the webhook to work properly

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

