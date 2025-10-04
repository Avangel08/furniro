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

async function checkProductStatus() {
  console.log('🔍 Checking Product Status in Database...\n');
  
  await connectDB();
  
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  try {
    // Get all products with their status
    const products = await Product.find({}, '_id name status category price').lean();
    
    console.log('📊 PRODUCT STATUS BREAKDOWN:');
    console.log('============================');
    
    const statusCounts = {};
    products.forEach(product => {
      statusCounts[product.status] = (statusCounts[product.status] || 0) + 1;
    });
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} products`);
    });
    
    console.log('\n🛍️  ALL PRODUCTS:');
    console.log('=================');
    
    products.forEach((product, index) => {
      const statusIcon = product.status === 'Active' ? '✅' : '❌';
      console.log(`${index + 1}. ${statusIcon} ${product.name} (${product.status}) - $${product.price} - ${product.category}`);
    });
    
    console.log('\n❌ NON-ACTIVE PRODUCTS (Should not appear on customer website):');
    console.log('=============================================================');
    
    const nonActiveProducts = products.filter(p => p.status !== 'Active');
    if (nonActiveProducts.length > 0) {
      nonActiveProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.status}) - $${product.price} - ${product.category}`);
      });
    } else {
      console.log('   No non-active products found');
    }
    
    console.log('\n✅ ACTIVE PRODUCTS (Should appear on customer website):');
    console.log('=====================================================');
    
    const activeProducts = products.filter(p => p.status === 'Active');
    if (activeProducts.length > 0) {
      activeProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name} (${product.status}) - $${product.price} - ${product.category}`);
      });
    } else {
      console.log('   No active products found');
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('===========');
    console.log(`Total products: ${products.length}`);
    console.log(`Active products: ${activeProducts.length}`);
    console.log(`Non-active products: ${nonActiveProducts.length}`);
    
    if (nonActiveProducts.length > 0) {
      console.log('\n⚠️  WARNING:');
      console.log('   Customer website should only show Active products');
      console.log('   If you see non-active products on customer site, there is a bug');
    } else {
      console.log('\n✅ All products are Active - customer website should show all products');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Check completed');
  }
}

// Run the check
checkProductStatus().catch(console.error);
