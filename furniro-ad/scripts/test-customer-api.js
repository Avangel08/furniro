const fetch = require('node-fetch');

async function testCustomerAPI() {
  console.log('🔍 Testing Customer API...\n');
  
  const baseUrl = 'http://localhost:3002';
  
  try {
    // Test 1: Public products API
    console.log('📋 Test 1: Public Products API');
    console.log('==============================');
    
    const response = await fetch(`${baseUrl}/api/public/products?limit=5`);
    
    if (!response.ok) {
      console.log(`❌ API Error: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ API Response: ${data.data.length} products`);
      console.log(`📊 Total products: ${data.pagination.total}`);
      console.log(`📂 Categories: ${data.categories.join(', ')}`);
      
      // Check if all products are Active
      const allActive = data.data.every(product => product.status === 'Active');
      console.log(`🔍 All products Active: ${allActive ? '✅' : '❌'}`);
      
      if (!allActive) {
        console.log('❌ Found non-Active products:');
        data.data.forEach(product => {
          if (product.status !== 'Active') {
            console.log(`   - ${product.name} (${product.status})`);
          }
        });
      }
      
      // Show sample products
      console.log('\n🛍️  Sample Products:');
      data.data.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - ${product.status} - $${product.price}`);
      });
      
    } else {
      console.log(`❌ API Error: ${data.error}`);
    }
    
    // Test 2: Single product API
    console.log('\n📋 Test 2: Single Product API');
    console.log('=============================');
    
    if (data.success && data.data.length > 0) {
      const firstProduct = data.data[0];
      const productResponse = await fetch(`${baseUrl}/api/public/products/${firstProduct._id}`);
      
      if (productResponse.ok) {
        const productData = await productResponse.json();
        if (productData.success) {
          console.log(`✅ Single product API works: ${productData.data.name}`);
          console.log(`🔍 Product status: ${productData.data.status}`);
        } else {
          console.log(`❌ Single product API error: ${productData.error}`);
        }
      } else {
        console.log(`❌ Single product API failed: ${productResponse.status}`);
      }
    }
    
    // Test 3: Test with different parameters
    console.log('\n📋 Test 3: API with Parameters');
    console.log('==============================');
    
    const testParams = [
      '?category=Living',
      '?search=chair',
      '?sortBy=price-low',
      '?page=1&limit=3'
    ];
    
    for (const param of testParams) {
      try {
        const testResponse = await fetch(`${baseUrl}/api/public/products${param}`);
        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log(`✅ ${param}: ${testData.data.length} products`);
        } else {
          console.log(`❌ ${param}: ${testResponse.status}`);
        }
      } catch (error) {
        console.log(`❌ ${param}: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Possible issues:');
    console.log('   - Admin server not running on port 3002');
    console.log('   - Network connectivity issues');
    console.log('   - API endpoint not available');
  }
}

// Run the test
testCustomerAPI().catch(console.error);