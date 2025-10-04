// Simple test to trigger customer auth compilation
const fetch = globalThis.fetch;

async function testCustomerAuthCompilation() {
  try {
    console.log('🔍 Testing customer auth compilation...');
    
    // Test register endpoint without auth
    console.log('1. Testing POST /api/auth/customer/register...');
    const registerResponse = await fetch('http://localhost:3002/api/auth/customer/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123',
        firstName: 'Test',
        lastName: 'User'
      })
    });
    
    console.log('Register Response status:', registerResponse.status);
    const registerText = await registerResponse.text();
    console.log('Register Response body:', registerText);
    
    // Test login endpoint
    console.log('\n2. Testing POST /api/auth/customer/login...');
    const loginResponse = await fetch('http://localhost:3002/api/auth/customer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });
    
    console.log('Login Response status:', loginResponse.status);
    const loginText = await loginResponse.text();
    console.log('Login Response body:', loginText);
    
    // Test me endpoint without token
    console.log('\n3. Testing GET /api/auth/customer/me...');
    const meResponse = await fetch('http://localhost:3002/api/auth/customer/me');
    
    console.log('Me Response status:', meResponse.status);
    const meText = await meResponse.text();
    console.log('Me Response body:', meText);
    
    if (meResponse.status === 401) {
      console.log('✅ Customer auth routes compiled successfully (401 expected for no token)');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testCustomerAuthCompilation();
