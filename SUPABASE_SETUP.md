# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - Project name: `medtracker` (or your preferred name)
   - Database password: (save this securely)
   - Region: Choose closest to you
5. Wait for the project to be created (takes a few minutes)

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (this is your `NEXT_PUBLIC_SUPABASE_URL`)
   - **anon/public key** (this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## 3. Set Up Environment Variables

1. Create a `.env.local` file in the root of your project (if it doesn't exist)
2. Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from step 2.

## 4. Create Database Tables

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `supabase-schema.sql` file
4. Click **Run** to execute the SQL
5. Verify the tables were created by going to **Table Editor** - you should see:
   - `users` table
   - `grandparents` table

## 5. Verify Row Level Security (RLS)

The schema includes RLS policies that allow:
- Anyone to create a user account
- Users to read/insert/update/delete their own grandparents data

These policies are already included in the SQL schema file.

## 6. Install Dependencies

Run the following command to install Supabase client:

```bash
npm install
```

## 7. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the dashboard page
3. Try logging in with email and phone number
4. Complete the onboarding form
5. Verify data appears in your Supabase tables

## Troubleshooting

- **"Missing Supabase environment variables"**: Make sure your `.env.local` file exists and has the correct variable names
- **"Error loading grandparent data"**: Check that the tables were created correctly in Supabase
- **RLS Policy Errors**: Make sure you ran the SQL schema file which includes the RLS policies

