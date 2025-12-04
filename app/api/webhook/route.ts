import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client for webhook
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Use service role key if available (bypasses RLS), otherwise use anon key
// Note: RLS policies allow public inserts for call_logs
const supabase = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    console.log('=== WEBHOOK CALLBACK RECEIVED ===')
    
    const body = await request.json()
    console.log('Webhook body received:', JSON.stringify(body, null, 2))

    // Validate required fields
    const { grandparent_id, answered, answer } = body

    if (!grandparent_id) {
      console.error('ERROR: Missing grandparent_id')
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required field: grandparent_id' 
        },
        { status: 200 }
      )
    }

    if (answered === undefined || answered === null) {
      console.error('ERROR: Missing answered field')
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required field: answered' 
        },
        { status: 200 }
      )
    }

    console.log('=== PROCESSING WEBHOOK CALLBACK ===')
    console.log('Grandparent ID:', grandparent_id)
    console.log('Answered:', answered)
    console.log('Answer:', answer)

    // Update the database with the call response
    // First, check if we need to create a call_logs table or update grandparents table
    // For now, we'll create a call_logs entry
    
    const updateData: any = {
      answered: answered,
      answer: answer || null,
      updated_at: new Date().toISOString(),
    }

    console.log('Updating database with:', JSON.stringify(updateData, null, 2))

    // Option 1: Update grandparents table directly (if we add fields)
    // Option 2: Create a call_logs table (better for history)
    // Let's use a call_logs table for better tracking

    // Get the call date (today's date in YYYY-MM-DD format)
    const callDate = new Date().toISOString().split('T')[0]

    const { data: logEntry, error: logError } = await supabase
      .from('call_logs')
      .upsert(
        {
          grandparent_id: grandparent_id,
          call_date: callDate,
          answered: answered,
          answer: answer || null,
          called_at: new Date().toISOString(),
        },
        {
          onConflict: 'grandparent_id,call_date',
        }
      )
      .select()
      .single()

    if (logError) {
      console.error('ERROR creating call log:', logError)
      console.error('Error code:', logError.code)
      console.error('Error message:', logError.message)
      
      // If table doesn't exist, return error with instructions
      if (logError.code === '42P01') {
        console.error('ERROR: Database table not found')
        return NextResponse.json(
          {
            success: false,
            error: 'Database table not found',
            message: 'Please create the call_logs table in Supabase',
            details: logError.message,
          },
          { status: 200 }
        )
      }
      
      console.error('ERROR: Failed to save call log')
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to save call log',
          details: logError.message,
        },
        { status: 200 }
      )
    }

    console.log('=== CALL LOG CREATED SUCCESSFULLY ===')
    console.log('Log entry:', JSON.stringify(logEntry, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Call response recorded successfully',
      data: logEntry,
    })
  } catch (error: any) {
    console.error('=== WEBHOOK CALLBACK ERROR ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('Full error object:', error)

    console.error('ERROR: Internal server error')
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error?.message || 'Unknown error occurred',
      },
      { status: 200 }
    )
  }
}

// Also handle GET requests for webhook verification/testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Webhook endpoint is active',
    method: 'POST',
    required_fields: ['grandparent_id', 'answered', 'answer'],
  })
}

