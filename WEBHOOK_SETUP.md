# Webhook Setup Guide

## Overview

This app has two webhook endpoints:

1. **Outgoing Webhook** (`/api/call`) - Calls Happy Robot to initiate a call
2. **Incoming Webhook** (`/api/webhook`) - Receives call responses from Happy Robot

## Webhook Flow

1. User clicks "Call Now" → Frontend calls `/api/call`
2. `/api/call` sends POST to Happy Robot webhook
3. Happy Robot makes the call
4. Happy Robot sends response to `/api/webhook`
5. `/api/webhook` saves the response to database

## Setup Instructions

### 1. Database Setup

Run the updated `supabase-schema.sql` to create the `call_logs` table:

```sql
-- The call_logs table will be created automatically
-- Make sure to run the full schema file
```

### 2. Environment Variables

Add to your `.env.local` (for local development) and Vercel environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Optional, for webhook to bypass RLS
```

**Note**: The `SUPABASE_SERVICE_ROLE_KEY` is optional. If not set, the webhook will use the anon key. For production, it's recommended to use the service role key.

### 3. Configure Happy Robot Webhook

In your Happy Robot workflow configuration, set the callback webhook URL to:

```
https://your-domain.com/api/webhook
```

Or for local testing:
```
http://localhost:3000/api/webhook
```

### 4. Webhook Payload Format

#### Outgoing (to Happy Robot)
```
POST https://workflows.platform.happyrobot.ai/hooks/cbj6ozcqeqrz
{
  "name_yaya": "Grandparent Name",
  "pill": "Medication Name",
  "time": "14:30:00",
  "gender": "male",
  "phone_yaya": "+1234567890",
  "name_son": "User Name",
  "phone_son": "+0987654321",
  "id": "grandparent-uuid"
}
```

#### Incoming (from Happy Robot)
```
POST /api/webhook
{
  "grandparent_id": "grandparent-uuid",
  "answered": true,
  "answer": "yes"  // or "no", or null if not answered
}
```

### 5. Testing

#### Test the outgoing webhook:
```bash
curl -X POST http://localhost:3000/api/call \
  -H "Content-Type: application/json" \
  -d '{
    "name_yaya": "Test",
    "pill": "Test Medication",
    "time": "14:30:00",
    "gender": "male",
    "phone_yaya": "+1234567890",
    "name_son": "Test User",
    "phone_son": "+0987654321",
    "id": "test-id"
  }'
```

#### Test the incoming webhook:
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "grandparent_id": "test-id",
    "answered": true,
    "answer": "yes"
  }'
```

## Database Schema

The `call_logs` table stores:
- `id`: UUID primary key
- `grandparent_id`: Reference to grandparents table
- `answered`: Boolean (did they answer?)
- `answer`: Text ('yes', 'no', or NULL)
- `called_at`: Timestamp of when the call was made
- `created_at`: Timestamp of when the log was created

## Security Notes

- The webhook endpoint is public (no authentication required)
- Consider adding webhook signature verification for production
- The service role key bypasses RLS - keep it secure
- Never expose the service role key in client-side code

