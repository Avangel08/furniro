const fs = require('fs');
const path = require('path');

// Check upload directory
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'products');

console.log('🔍 Checking product images...');
console.log('Upload directory:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  console.log('❌ Upload directory does not exist');
  process.exit(0);
}

const files = fs.readdirSync(uploadDir);
const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|gif|webp)$/i));

console.log(`📁 Total files in upload directory: ${files.length}`);
console.log(`🖼️  Image files: ${imageFiles.length}`);

if (imageFiles.length > 0) {
  console.log('\n📋 Image files found:');
  imageFiles.slice(0, 10).forEach(file => {
    const filePath = path.join(uploadDir, file);
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    console.log(`   - ${file} (${sizeKB} KB)`);
  });
  
  if (imageFiles.length > 10) {
    console.log(`   ... and ${imageFiles.length - 10} more files`);
  }
}

console.log('\n✅ Image check complete');
