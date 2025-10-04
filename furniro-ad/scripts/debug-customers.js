// Debug script to test customer API
const fetch = require('node-fetch');

async function testCustomerAPI() {
  try {
    console.log('🔍 Testing Customer API...');
    
    // Test without authentication first
    console.log('\n1. Testing without authentication:');
    const response1 = await fetch('http://localhost:3002/api/customers');
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', data1);
    
    // Test with mock admin token (you'll need to get a real one)
    console.log('\n2. Testing with authentication:');
    const adminToken = 'YOUR_ADMIN_TOKEN_HERE'; // Replace with actual token
    
    if (adminToken !== 'YOUR_ADMIN_TOKEN_HERE') {
      const response2 = await fetch('http://localhost:3002/api/customers', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      });
      const data2 = await response2.json();
      console.log('Status:', response2.status);
      console.log('Response:', data2);
    } else {
      console.log('Please replace YOUR_ADMIN_TOKEN_HERE with actual admin token');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCustomerAPI();
