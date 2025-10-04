// Quick API test
const testUrl = 'http://localhost:3002/api/public/products?limit=3';

console.log('🔍 Quick API Test');
console.log('=================');
console.log(`Testing: ${testUrl}`);
console.log('');
console.log('📋 Instructions:');
console.log('1. Open browser');
console.log('2. Go to: http://localhost:3002/api/public/products?limit=3');
console.log('3. Check if all products have "status": "Active"');
console.log('');
console.log('✅ Expected: All products should have status "Active"');
console.log('❌ If you see "Draft" or "Inactive": API filter is broken');
console.log('');
console.log('🔧 If API is broken, check:');
console.log('- File: furniro-ad/src/app/api/public/products/route.ts');
console.log('- Line 18-20 should have: status: "Active"');
console.log('- Restart admin server: npm run dev');
console.log('');
console.log('📱 Then test customer website:');
console.log('1. Go to: http://localhost:3000/shop');
console.log('2. Should only see Active products');
console.log('3. Draft/Inactive products should not appear');
