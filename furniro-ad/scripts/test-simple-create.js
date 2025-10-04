// Test customer creation without auth
const fetch = globalThis.fetch;

async function testSimpleCreate() {
  try {
    console.log('🧪 SIMPLE CUSTOMER CREATION TEST');
    console.log('==================================');
    
    const randomId = Math.floor(Math.random() * 10000);
    const testCustomer = {
      email: `simple.test.${randomId}@email.com`,
      password: 'password123',
      firstName: 'Simple',
      lastName: 'Test',
      phone: '+1 (555) 000-0001'
    };
    
    console.log('📧 Testing with email:', testCustomer.email);
    
    const response = await fetch('http://localhost:3002/api/customers/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCustomer)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', [...response.headers.entries()]);
    
    const responseText = await response.text();
    console.log('📡 Response body (raw):', responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log('📡 Response body (parsed):', JSON.stringify(data, null, 2));
      
      if (response.ok && data.success) {
        console.log('✅ Simple customer creation successful!');
        console.log(`👤 Created: ${data.data.fullName} (${data.data.email})`);
      } else {
        console.error('❌ Simple customer creation failed:', data.error);
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

testSimpleCreate();
