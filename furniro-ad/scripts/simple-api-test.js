console.log('🔍 Simple API Test...\n');

// Test if we can reach the API
const testUrl = 'http://localhost:3002/api/public/products?limit=3';

console.log('📋 Testing API Endpoint:');
console.log('========================');
console.log(`URL: ${testUrl}`);
console.log('Expected: Only Active products');
console.log('');

// Instructions for manual testing
console.log('💡 Manual Test Instructions:');
console.log('============================');
console.log('1. Make sure admin server is running: cd furniro-ad && npm run dev');
console.log('2. Open browser and go to: http://localhost:3002/api/public/products?limit=3');
console.log('3. Check if response contains only Active products');
console.log('4. Check if any products have status other than "Active"');
console.log('');

console.log('🔍 Expected Response Format:');
console.log('============================');
console.log('{');
console.log('  "success": true,');
console.log('  "data": [');
console.log('    {');
console.log('      "_id": "...",');
console.log('      "name": "...",');
console.log('      "status": "Active",  ← Should always be "Active"');
console.log('      "category": "...",');
console.log('      "price": 123');
console.log('    }');
console.log('  ],');
console.log('  "pagination": { ... }');
console.log('}');
console.log('');

console.log('❌ If you see products with status "Draft" or "Inactive":');
console.log('   - API filter is not working');
console.log('   - Need to check database data');
console.log('   - Need to verify API implementation');
console.log('');

console.log('✅ If all products have status "Active":');
console.log('   - API is working correctly');
console.log('   - Issue might be in customer website');
console.log('   - Check network requests in browser dev tools');
