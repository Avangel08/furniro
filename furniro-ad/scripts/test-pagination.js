// Test pagination API
const fetch = require('node-fetch');

async function testPagination() {
  try {
    console.log('🔍 Testing Customer Pagination API...');
    
    // Test with different page sizes
    const testCases = [
      { page: 1, limit: 5 },
      { page: 1, limit: 10 },
      { page: 1, limit: 20 },
      { page: 2, limit: 5 }
    ];
    
    for (const testCase of testCases) {
      console.log(`\n📊 Testing: page=${testCase.page}, limit=${testCase.limit}`);
      
      const url = `http://localhost:3002/api/customers?page=${testCase.page}&limit=${testCase.limit}`;
      console.log('URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE', // Replace with actual token
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response:', {
          success: data.success,
          customersCount: data.data?.length || 0,
          pagination: data.pagination
        });
      } else {
        const errorData = await response.json();
        console.log('❌ Error:', errorData);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPagination();
