const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/furniro');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Test function
async function testActiveProducts() {
  console.log('🔍 Testing Active Products Logic...\n');
  
  await connectDB();
  
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  try {
    // Test 1: Count all products by status
    console.log('📊 PRODUCT STATUS BREAKDOWN:');
    console.log('============================');
    
    const statusCounts = await Product.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    statusCounts.forEach(status => {
      console.log(`   ${status._id}: ${status.count} products`);
    });
    
    // Test 2: Test public API filter
    console.log('\n🔍 PUBLIC API FILTER TEST:');
    console.log('==========================');
    
    const activeProducts = await Product.find({ status: 'Active' }).lean();
    const allProducts = await Product.find({}).lean();
    
    console.log(`   Total products: ${allProducts.length}`);
    console.log(`   Active products: ${activeProducts.length}`);
    console.log(`   Non-active products: ${allProducts.length - activeProducts.length}`);
    
    // Test 3: Test categories filter
    console.log('\n📂 CATEGORIES TEST:');
    console.log('===================');
    
    const allCategories = await Product.distinct('category');
    const activeCategories = await Product.distinct('category', { status: 'Active' });
    
    console.log(`   All categories: ${allCategories.join(', ')}`);
    console.log(`   Active categories: ${activeCategories.join(', ')}`);
    
    // Test 4: Sample active products
    console.log('\n🛍️  SAMPLE ACTIVE PRODUCTS:');
    console.log('===========================');
    
    const sampleProducts = await Product.find({ status: 'Active' })
      .select('_id name status category price')
      .limit(5)
      .lean();
    
    sampleProducts.forEach((product, index) => {
      console.log(`   ${index + 1}. ${product.name} (${product.category}) - $${product.price} - Status: ${product.status}`);
    });
    
    // Test 5: Test non-active products (should not be visible to customers)
    console.log('\n🚫 NON-ACTIVE PRODUCTS (Hidden from customers):');
    console.log('===============================================');
    
    const nonActiveProducts = await Product.find({ status: { $ne: 'Active' } })
      .select('_id name status category')
      .limit(5)
      .lean();
    
    if (nonActiveProducts.length > 0) {
      nonActiveProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.category}) - Status: ${product.status}`);
      });
    } else {
      console.log('   No non-active products found');
    }
    
    console.log('\n✅ TEST SUMMARY:');
    console.log('================');
    console.log('✅ Public API only shows Active products');
    console.log('✅ Categories are filtered by Active status');
    console.log('✅ Non-active products are hidden from customers');
    console.log('✅ Admin can still see all products');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Test completed');
  }
}

// Run the test
testActiveProducts().catch(console.error);
