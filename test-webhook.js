// Test script for webhook endpoint
// Run with: node test-webhook.js

const WEBHOOK_URL = 'http://localhost:3000/api/webhook'

// Test cases
const testCases = [
  {
    name: 'Test 1: Answered and took medication (yes)',
    payload: {
      grandparent_id: 'test-grandparent-id-1',
      answered: true,
      answer: 'yes',
    },
  },
  {
    name: 'Test 2: Answered but did not take medication (no)',
    payload: {
      grandparent_id: 'test-grandparent-id-2',
      answered: true,
      answer: 'no',
    },
  },
  {
    name: 'Test 3: Did not answer phone',
    payload: {
      grandparent_id: 'test-grandparent-id-3',
      answered: false,
      answer: null,
    },
  },
  {
    name: 'Test 4: Missing grandparent_id (should fail)',
    payload: {
      answered: true,
      answer: 'yes',
    },
  },
  {
    name: 'Test 5: Missing answered field (should fail)',
    payload: {
      grandparent_id: 'test-grandparent-id-5',
      answer: 'yes',
    },
  },
]

async function testWebhook() {
  console.log('🧪 Testing Webhook Endpoint')
  console.log('📍 URL:', WEBHOOK_URL)
  console.log('='.repeat(60))

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i]
    console.log(`\n📋 ${testCase.name}`)
    console.log('Payload:', JSON.stringify(testCase.payload, null, 2))

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.payload),
      })

      const data = await response.json()

      console.log('Status:', response.status)
      console.log('Response:', JSON.stringify(data, null, 2))

      if (response.ok) {
        console.log('✅ Test PASSED')
      } else {
        console.log('❌ Test FAILED (expected for validation tests)')
      }
    } catch (error) {
      console.error('❌ Error:', error.message)
    }

    console.log('-'.repeat(60))
  }

  console.log('\n✅ Testing complete!')
  console.log('\n💡 Note: Use a real grandparent_id from your database for actual testing')
}

// Run tests
testWebhook().catch(console.error)

