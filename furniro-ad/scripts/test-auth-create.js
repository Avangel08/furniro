// Test customer creation with detailed auth debugging
const fetch = globalThis.fetch;

const API_BASE = 'http://localhost:3002';

async function testAuthCreate() {
  try {
    console.log('🧪 AUTH CREATE TEST');
    console.log('===================');
    
    // Step 1: Login
    console.log('Step 1: Login...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@furniro.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginResponse.ok || !loginData.success) {
      console.error('❌ Login failed:', loginData.error);
      return;
    }
    
    const authToken = loginData.data.accessToken;
    console.log('✅ Login successful, token length:', authToken.length);
    
    // Step 2: Test create with auth
    console.log('\nStep 2: Create customer with auth...');
    
    const randomId = Math.floor(Math.random() * 10000);
    const testCustomer = {
      email: `auth.test.${randomId}@email.com`,
      password: 'password123',
      firstName: 'Auth',
      lastName: 'Test',
      phone: '+1 (555) 000-0002'
    };
    
    console.log('📧 Testing with email:', testCustomer.email);
    console.log('🔑 Using token:', authToken.substring(0, 20) + '...');
    
    const createResponse = await fetch(`${API_BASE}/api/customers/create-with-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testCustomer)
    });
    
    console.log('📡 Response status:', createResponse.status);
    console.log('📡 Response headers:', [...createResponse.headers.entries()]);
    
    const responseText = await createResponse.text();
    console.log('📡 Response body (raw):', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('📡 Response body (parsed):', JSON.stringify(data, null, 2));
      
      if (createResponse.ok && data.success) {
        console.log('✅ Auth customer creation successful!');
        console.log(`👤 Created: ${data.data.fullName} (${data.data.email})`);
      } else {
        console.error('❌ Auth customer creation failed:', data.error);
        if (data.details) {
          console.error('🔍 Error details:', data.details);
        }
      }
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAuthCreate();
