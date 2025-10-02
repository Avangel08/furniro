// Migration script to convert existing MongoDB ObjectIds to 8-character custom IDs
// Run: node scripts/migrate-product-ids.js

const mongoose = require('mongoose');

// Helper function to generate unique 8-character product ID
function generateProductId() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let result = '';
  
  // Add 2 random letters
  for (let i = 0; i < 2; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Add 6 random numbers
  for (let i = 0; i < 6; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return result;
}

async function migrateProductIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/furniro');
    console.log('✅ Connected to MongoDB');

    // Get all products with ObjectId
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    console.log(`📊 Found ${products.length} products to migrate`);

    const usedIds = new Set();
    let migratedCount = 0;

    for (const product of products) {
      // Generate unique 8-character ID
      let newId;
      let attempts = 0;
      const maxAttempts = 20;

      do {
        newId = generateProductId();
        attempts++;
      } while (usedIds.has(newId) && attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        console.error(`❌ Failed to generate unique ID for product: ${product.name}`);
        continue;
      }

      usedIds.add(newId);

      // Create new document with custom ID
      const newProduct = {
        ...product,
        _id: newId,
        oldId: product._id // Keep reference to old ID
      };

      // Insert new document
      await mongoose.connection.db.collection('products').insertOne(newProduct);
      
      // Delete old document
      await mongoose.connection.db.collection('products').deleteOne({ _id: product._id });

      migratedCount++;
      console.log(`✅ Migrated: ${product.name} | ${product._id} → ${newId}`);
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`📊 Migrated ${migratedCount}/${products.length} products`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run migration
migrateProductIds();
