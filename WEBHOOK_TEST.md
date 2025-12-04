# Webhook Testing Guide

## Quick Test Methods

### Method 1: Using the HTML Test Page (Easiest)

1. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

2. Open `test-webhook.html` in your browser (double-click the file)

3. Enter a grandparent ID from your database (or use a test ID)

4. Select the scenario:
   - ✅ Answered + Yes (took medication)
   - ❌ Answered + No (didn't take medication)
   - 📞 Not Answered

5. Click "Send Webhook" and see the response

### Method 2: Using Node.js Test Script

1. Make sure you have Node.js installed

2. Start your Next.js dev server:
   ```bash
   npm run dev
 ```

3. Run the test script:
   ```bash
   node test-webhook.js
   ```

### Method 3: Using cURL

#### Test 1: Answered and took medication
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "grandparent_id": "YOUR_GRANDPARENT_ID_HERE",
    "answered": true,
    "answer": "yes"
  }'
```

#### Test 2: Answered but didn't take medication
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "grandparent_id": "YOUR_GRANDPARENT_ID_HERE",
    "answered": true,
    "answer": "no"
  }'
```

#### Test 3: Did not answer phone
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "grandparent_id": "YOUR_GRANDPARENT_ID_HERE",
    "answered": false,
    "answer": null
  }'
```

#### Test 4: Validation error (missing grandparent_id)
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "answered": true,
    "answer": "yes"
  }'
```

## Getting a Real Grandparent ID

To test with real data:

1. Go to your Supabase dashboard
2. Navigate to Table Editor → `grandparents`
3. Copy a `id` value from any grandparent record
4. Use that ID in your test

## Expected Responses

### Success Response (200)
```json
{
  "success": true,
  "message": "Call response recorded successfully",
  "data": {
    "id": "uuid",
    "grandparent_id": "uuid",
    "answered": true,
    "answer": "yes",
    "call_date": "2025-01-15",
    "called_at": "2025-01-15T10:30:00Z",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### Error Response (400/500)
```json
{
  "error": "Missing required field: grandparent_id"
}
```

## Testing Checklist

- [ ] Webhook accepts valid payload
- [ ] Webhook rejects missing grandparent_id
- [ ] Webhook rejects missing answered field
- [ ] Call log is created in database
- [ ] Status updates correctly in frontend
- [ ] Multiple calls for same day update existing record (upsert)

## Troubleshooting

**Error: "Cannot connect to localhost:3000"**
- Make sure your Next.js dev server is running
- Check that it's running on port 3000

**Error: "Database table not found"**
- Run the migration: `migration-call-logs-only.sql` in Supabase

**Error: "Foreign key violation"**
- Make sure the grandparent_id exists in your `grandparents` table

