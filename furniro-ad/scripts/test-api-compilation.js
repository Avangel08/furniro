// Simple test to trigger API route compilation
const fetch = globalThis.fetch;

async function testAPICompilation() {
  try {
    console.log('🔍 Testing API route compilation...');
    
    // Test GET endpoint first (we know this works)
    console.log('1. Testing GET /api/customers (should trigger compilation)...');
    const getResponse = await fetch('http://localhost:3002/api/customers');
    console.log('GET Response status:', getResponse.status);
    
    if (getResponse.status === 401) {
      console.log('✅ GET route compiled (401 = auth required, expected)');
    } else {
      console.log('❌ Unexpected GET response status');
    }
    
    // Test POST endpoint to trigger compilation
    console.log('2. Testing POST /api/customers (should trigger compilation)...');
    const postResponse = await fetch('http://localhost:3002/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    console.log('POST Response status:', postResponse.status);
    const postText = await postResponse.text();
    console.log('POST Response body:', postText);
    
    if (postResponse.status === 401) {
      console.log('✅ POST route compiled (401 = auth required, expected)');
    } else if (postResponse.status === 500) {
      console.log('❌ POST route has internal error (500)');
    } else {
      console.log('❓ Unexpected POST response status');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAPICompilation();
