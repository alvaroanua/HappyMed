-- Migration: Make name and phone_number nullable in users table
-- Run this if you already have a users table with NOT NULL constraints

-- Make name nullable
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;

-- Make phone_number nullable
ALTER TABLE users ALTER COLUMN phone_number DROP NOT NULL;

