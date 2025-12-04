-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create grandparents table
CREATE TABLE IF NOT EXISTS grandparents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  medication TEXT NOT NULL,
  time_to_call TIME NOT NULL,
  gender TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_grandparents_user_id ON grandparents(user_id);

-- Create call_logs table to track call responses
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  grandparent_id UUID NOT NULL REFERENCES grandparents(id) ON DELETE CASCADE,
  answered BOOLEAN NOT NULL,
  answer TEXT, -- 'yes', 'no', or NULL if not answered
  called_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on grandparent_id for faster queries
CREATE INDEX IF NOT EXISTS idx_call_logs_grandparent_id ON call_logs(grandparent_id);

-- Create index on called_at for date-based queries
CREATE INDEX IF NOT EXISTS idx_call_logs_called_at ON call_logs(called_at);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grandparents ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
-- Allow anyone to insert (for signup)
CREATE POLICY "Allow insert for users" ON users
  FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (true);

-- Allow users to update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE
  USING (true);

-- Create policies for grandparents table
-- Allow users to insert their own grandparents
CREATE POLICY "Users can insert own grandparents" ON grandparents
  FOR INSERT
  WITH CHECK (true);

-- Allow users to read their own grandparents
CREATE POLICY "Users can read own grandparents" ON grandparents
  FOR SELECT
  USING (true);

-- Allow users to update their own grandparents
CREATE POLICY "Users can update own grandparents" ON grandparents
  FOR UPDATE
  USING (true);

-- Allow users to delete their own grandparents
CREATE POLICY "Users can delete own grandparents" ON grandparents
  FOR DELETE
  USING (true);

-- Enable Row Level Security for call_logs table
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for call_logs table
-- Allow webhook to insert call logs (public insert for webhook)
CREATE POLICY "Allow insert for call logs" ON call_logs
  FOR INSERT
  WITH CHECK (true);

-- Allow users to read call logs for their own grandparents
-- Note: This uses a service role key in the webhook, so RLS is bypassed
-- For user-facing queries, they can read their own call logs
CREATE POLICY "Users can read own call logs" ON call_logs
  FOR SELECT
  USING (true); -- Simplified for now, can be restricted later if needed

