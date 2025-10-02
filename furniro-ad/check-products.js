// Script kiểm tra sản phẩm trong MongoDB
// Chạy: mongosh furniro check-products.js

console.log("🔍 KIỂM TRA DỮ LIỆU SẢN PHẨM");
console.log("================================");

// 1. Tổng số sản phẩm
const totalProducts = db.products.countDocuments();
console.log(`📊 Tổng số sản phẩm: ${totalProducts}`);

// 2. Thống kê theo category
console.log("\n📂 Thống kê theo Category:");
db.products.aggregate([
  {$group: {_id: "$category", count: {$sum: 1}}},
  {$sort: {count: -1}}
]).forEach(doc => {
  console.log(`   ${doc._id}: ${doc.count} sản phẩm`);
});

// 3. Thống kê images
console.log("\n🖼️  Thống kê Images:");
const productsWithImages = db.products.countDocuments({"images": {$exists: true, $ne: []}});
const productsWithoutImages = totalProducts - productsWithImages;
console.log(`   Có ảnh: ${productsWithImages} sản phẩm`);
console.log(`   Không có ảnh: ${productsWithoutImages} sản phẩm`);

// 4. Sản phẩm có nhiều ảnh nhất
console.log("\n🏆 Sản phẩm có nhiều ảnh nhất:");
db.products.aggregate([
  {$project: {name: 1, imageCount: {$size: "$images"}, images: 1}},
  {$sort: {imageCount: -1}},
  {$limit: 3}
]).forEach(doc => {
  console.log(`   ${doc.name}: ${doc.imageCount} ảnh`);
  if (doc.images && doc.images.length > 0) {
    doc.images.forEach((img, index) => {
      console.log(`     ${index + 1}. ${img}`);
    });
  }
});

// 5. Sản phẩm mới nhất
console.log("\n🆕 Sản phẩm mới nhất:");
db.products.find({}, {name: 1, createdAt: 1, images: 1})
  .sort({createdAt: -1})
  .limit(3)
  .forEach(doc => {
    const date = new Date(doc.createdAt).toLocaleString();
    console.log(`   ${doc.name} - ${date} - ${doc.images ? doc.images.length : 0} ảnh`);
  });

// 6. Kiểm tra data integrity
console.log("\n🔧 Kiểm tra Data Integrity:");
const missingName = db.products.countDocuments({name: {$exists: false}});
const missingPrice = db.products.countDocuments({price: {$exists: false}});
const missingSKU = db.products.countDocuments({sku: {$exists: false}});

console.log(`   Thiếu name: ${missingName}`);
console.log(`   Thiếu price: ${missingPrice}`);
console.log(`   Thiếu SKU: ${missingSKU}`);

console.log("\n✅ Hoàn thành kiểm tra!");
