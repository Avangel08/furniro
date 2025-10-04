const fs = require('fs');
const path = require('path');
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

// Get all product images from database
async function getAllProductImages() {
  const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
  
  try {
    const products = await Product.find({}, 'images detailedImages').lean();
    const dbImages = new Set();
    
    products.forEach(product => {
      if (product.images) {
        product.images.forEach(img => dbImages.add(img));
      }
      if (product.detailedImages) {
        product.detailedImages.forEach(img => dbImages.add(img));
      }
    });
    
    return dbImages;
  } catch (error) {
    console.error('❌ Error fetching product images:', error);
    return new Set();
  }
}

// Get all image files from filesystem
function getAllFileImages() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
  
  if (!fs.existsSync(uploadDir)) {
    console.log('📁 Upload directory does not exist');
    return new Set();
  }
  
  const files = fs.readdirSync(uploadDir);
  const fileImages = new Set();
  
  files.forEach(file => {
    if (file.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      fileImages.add(`/uploads/products/${file}`);
    }
  });
  
  return fileImages;
}

// Main function
async function checkOrphanedImages() {
  console.log('🔍 Checking for orphaned product images...\n');
  
  await connectDB();
  
  const dbImages = await getAllProductImages();
  const fileImages = getAllFileImages();
  
  console.log(`📊 Database images: ${dbImages.size}`);
  console.log(`📁 File system images: ${fileImages.size}\n`);
  
  // Find orphaned files (files that exist but not in database)
  const orphanedFiles = new Set();
  fileImages.forEach(file => {
    if (!dbImages.has(file)) {
      orphanedFiles.add(file);
    }
  });
  
  // Find missing files (in database but not in filesystem)
  const missingFiles = new Set();
  dbImages.forEach(dbImg => {
    if (!fileImages.has(dbImg)) {
      missingFiles.add(dbImg);
    }
  });
  
  console.log('🔍 ANALYSIS RESULTS:');
  console.log('==================');
  
  if (orphanedFiles.size > 0) {
    console.log(`\n🗑️  ORPHANED FILES (${orphanedFiles.size} files):`);
    console.log('These files exist in filesystem but not referenced in database:');
    orphanedFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  } else {
    console.log('\n✅ No orphaned files found');
  }
  
  if (missingFiles.size > 0) {
    console.log(`\n❌ MISSING FILES (${missingFiles.size} files):`);
    console.log('These files are referenced in database but missing from filesystem:');
    missingFiles.forEach(file => {
      console.log(`   - ${file}`);
    });
  } else {
    console.log('\n✅ No missing files found');
  }
  
  console.log('\n📋 SUMMARY:');
  console.log(`   - Total database images: ${dbImages.size}`);
  console.log(`   - Total file system images: ${fileImages.size}`);
  console.log(`   - Orphaned files: ${orphanedFiles.size}`);
  console.log(`   - Missing files: ${missingFiles.size}`);
  
  if (orphanedFiles.size > 0) {
    console.log('\n⚠️  RECOMMENDATION:');
    console.log('   Consider cleaning up orphaned files to save disk space.');
    console.log('   These files are safe to delete as they are not referenced by any products.');
  }
  
  await mongoose.disconnect();
  console.log('\n✅ Analysis complete');
}

// Run the check
checkOrphanedImages().catch(console.error);
