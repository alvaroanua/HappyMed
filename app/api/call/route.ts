import { NextRequest, NextResponse } from 'next/server'

const WEBHOOK_URL = 'https://workflows.platform.happyrobot.ai/hooks/cbj6ozcqeqrz'

export async function POST(request: NextRequest) {
  try {
    console.log('=== API CALL ROUTE STARTED ===')
    
    const body = await request.json()
    console.log('Request body received:', JSON.stringify(body, null, 2))

    // Validate required fields
    const requiredFields = [
      'name_yaya',
      'pill',
      'time',
      'gender',
      'phone_yaya',
      'name_son',
      'phone_son',
      'id',
    ]

    const missingFields = requiredFields.filter((field) => !body[field])
    if (missingFields.length > 0) {
      console.error('ERROR: Missing required fields:', missingFields)
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    console.log('=== CALLING HAPPY ROBOT WEBHOOK ===')
    console.log('Webhook URL:', WEBHOOK_URL)
    console.log('Payload:', JSON.stringify(body, null, 2))

    // Call the Happy Robot webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    console.log('=== WEBHOOK RESPONSE ===')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)
    console.log('Headers:', Object.fromEntries(response.headers.entries()))

    const responseText = await response.text()
    console.log('Response Body (raw):', responseText)

    if (!response.ok) {
      console.error('ERROR: Webhook returned error status')
      console.error('Status:', response.status)
      console.error('Response:', responseText)
      
      return NextResponse.json(
        {
          error: `Webhook call failed with status ${response.status}`,
          details: responseText,
        },
        { status: response.status }
      )
    }

    // Try to parse as JSON, but handle non-JSON responses
    let result
    try {
      result = JSON.parse(responseText)
      console.log('Response JSON:', JSON.stringify(result, null, 2))
    } catch (parseError) {
      console.log('Response is not JSON, treating as text')
      result = { message: responseText }
    }

    console.log('=== CALL SUCCESSFUL ===')
    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    console.error('=== API ROUTE ERROR ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('Full error object:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error?.message || 'Unknown error occurred',
      },
      { status: 500 }
    )
  }
}

