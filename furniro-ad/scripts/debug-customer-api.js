// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

const API_BASE = 'http://localhost:3002';

async function debugCustomerAPI() {
  console.log('🔍 DEBUGGING CUSTOMER API');
  console.log('=========================');
  
  try {
    // Step 1: Login
    console.log('Step 1: Login...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@furniro.com',
        password: 'password123'
      })
    });

    console.log('Login Response Status:', loginResponse.status);
    console.log('Login Response Headers:', [...loginResponse.headers.entries()]);
    
    const loginData = await loginResponse.json();
    console.log('Login Response Body:', JSON.stringify(loginData, null, 2));
    
    if (!loginResponse.ok || !loginData.success) {
      console.error('❌ Login failed, cannot proceed');
      return;
    }
    
    const authToken = loginData.data.accessToken;
    console.log('✅ Got auth token:', authToken.substring(0, 20) + '...');
    
    // Step 2: Test GET /api/customers
    console.log('\nStep 2: GET /api/customers...');
    const customersResponse = await fetch(`${API_BASE}/api/customers?limit=5`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Customers Response Status:', customersResponse.status);
    console.log('Customers Response Headers:', [...customersResponse.headers.entries()]);
    
    const customersText = await customersResponse.text();
    console.log('Customers Response Body (raw):', customersText);
    
    try {
      const customersData = JSON.parse(customersText);
      console.log('Customers Response Body (parsed):', JSON.stringify(customersData, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse customers response as JSON:', parseError.message);
    }
    
    // Step 3: Test auth middleware directly
    console.log('\nStep 3: Test auth middleware with /api/auth/me...');
    const meResponse = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Me Response Status:', meResponse.status);
    const meData = await meResponse.json();
    console.log('Me Response Body:', JSON.stringify(meData, null, 2));
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

debugCustomerAPI();
