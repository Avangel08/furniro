const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/furniro';

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    // Check if products collection exists
    const productsCollection = await db.collection('products');
    const productCount = await productsCollection.countDocuments();
    console.log('📦 Products in database:', productCount);
    
    if (productCount > 0) {
      const sampleProduct = await productsCollection.findOne();
      console.log('🔍 Sample product:', {
        name: sampleProduct.name,
        sku: sampleProduct.sku,
        price: sampleProduct.price,
        stock: sampleProduct.stock
      });
    }
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Suggestion: Make sure MongoDB is running on your system');
      console.log('   - Windows: Start MongoDB service or run mongod');
      console.log('   - macOS: brew services start mongodb-community');
      console.log('   - Linux: sudo systemctl start mongod');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testConnection();
