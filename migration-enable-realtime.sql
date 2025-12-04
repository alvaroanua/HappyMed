-- Migration: Enable Realtime for call_logs table
-- This allows real-time updates to be pushed to the frontend
-- Run this in Supabase SQL Editor

-- Enable Realtime for call_logs table
ALTER PUBLICATION supabase_realtime ADD TABLE call_logs;

-- Verify Realtime is enabled (this will show the table if enabled)
-- You can check in Supabase Dashboard → Database → Replication

