console.log('🔍 Testing Customer Website API Calls...\n');

console.log('📋 Customer Website Configuration:');
console.log('==================================');
console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002');
console.log('Customer Website URL: http://localhost:3000');
console.log('Admin API URL: http://localhost:3002');
console.log('');

console.log('🔍 Test Steps:');
console.log('==============');
console.log('1. Make sure admin server is running:');
console.log('   cd furniro-ad && npm run dev');
console.log('');
console.log('2. Make sure customer website is running:');
console.log('   cd furniro-cust && npm run dev');
console.log('');
console.log('3. Open customer website:');
console.log('   http://localhost:3000/shop');
console.log('');
console.log('4. Open browser dev tools (F12)');
console.log('');
console.log('5. Go to Network tab');
console.log('');
console.log('6. Refresh the page');
console.log('');
console.log('7. Look for API calls to:');
console.log('   http://localhost:3002/api/public/products');
console.log('');
console.log('8. Check the response:');
console.log('   - Click on the API call');
console.log('   - Go to Response tab');
console.log('   - Check if all products have status: "Active"');
console.log('');

console.log('❌ If you see products with status "Draft" or "Inactive":');
console.log('   - API filter is not working');
console.log('   - Need to check database data');
console.log('   - Need to verify API implementation');
console.log('');

console.log('✅ If all products have status "Active":');
console.log('   - API is working correctly');
console.log('   - Issue might be in customer website display');
console.log('   - Check if products are being filtered correctly');
console.log('');

console.log('🔧 Debugging Tips:');
console.log('==================');
console.log('1. Check browser console for errors');
console.log('2. Check network tab for failed requests');
console.log('3. Check if API_BASE_URL is correct');
console.log('4. Check if admin server is running on port 3002');
console.log('5. Check if customer website is running on port 3000');
console.log('');

console.log('💡 Quick Test:');
console.log('==============');
console.log('Open this URL in browser:');
console.log('http://localhost:3002/api/public/products?limit=5');
console.log('');
console.log('You should see only products with status: "Active"');
console.log('If you see products with other status, the API filter is broken');
