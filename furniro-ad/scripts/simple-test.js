// Simple test to trigger Customer API compilation
const fetch = globalThis.fetch;

async function simpleTest() {
  try {
    console.log('🔍 Testing Customer API compilation...');
    
    // Test without auth first to see if route exists
    const response = await fetch('http://localhost:3002/api/customers');
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);
    
    const text = await response.text();
    console.log('Response body:', text);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

simpleTest();
