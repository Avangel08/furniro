// Test admin login and customer API
const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    console.log('🔍 Testing admin login...');
    
    // 1. Try to login as admin
    const loginResponse = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@furniro.com',
        password: 'password123'
      })
    });
    
    console.log('📡 Login response status:', loginResponse.status);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful!');
      console.log('📊 Login data:', loginData);
      
      if (loginData.accessToken) {
        // 2. Test customer API with admin token
        console.log('\n🔍 Testing customer API...');
        const customerResponse = await fetch('http://localhost:3002/api/customers', {
          headers: {
            'Authorization': `Bearer ${loginData.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Customer API response status:', customerResponse.status);
        
        if (customerResponse.ok) {
          const customerData = await customerResponse.json();
          console.log('✅ Customer API successful!');
          console.log('📊 Customer data:', customerData);
          console.log(`📋 Found ${customerData.data?.length || 0} customers`);
        } else {
          const errorData = await customerResponse.json();
          console.log('❌ Customer API failed:', errorData);
        }
      }
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData);
      
      if (errorData.error?.includes('not found')) {
        console.log('\n💡 Admin user not found. You need to create one first.');
        console.log('Try running: npx tsx scripts/seed-users.ts');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:3002');
  }
}

testAdminLogin();
