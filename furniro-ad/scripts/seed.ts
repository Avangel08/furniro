import mongoose from 'mongoose';
import Product from '../src/models/Product';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/furniro';

const sampleProducts = [
  {
    name: "Modern Beige Sofa",
    sku: "SOF-MOD-001",
    category: "Living",
    brand: "IKEA",
    description: "A comfortable and stylish modern sofa perfect for any living room. Features premium fabric upholstery and solid wood frame construction.",
    price: 1299.99,
    stock: 15,
    status: "Active",
    weight: 45.5,
    dimensions: "200 x 80 x 75 cm",
    material: "Solid Wood, Premium Fabric",
    color: "Beige",
    tags: ["modern", "comfortable", "living room", "fabric"],
    images: ["/images/sofa-1.jpg", "/images/sofa-2.jpg"]
  },
  {
    name: "Oak Dining Table",
    sku: "TAB-OAK-002",
    category: "Dining",
    brand: "West Elm",
    description: "Beautiful solid oak dining table that seats 6 people comfortably. Handcrafted with attention to detail and natural wood grain.",
    price: 899.99,
    stock: 8,
    status: "Active",
    weight: 65.0,
    dimensions: "180 x 90 x 75 cm",
    material: "Solid Oak Wood",
    color: "Natural Oak",
    tags: ["dining", "oak", "handcrafted", "6-seater"],
    images: ["/images/table-1.jpg", "/images/table-2.jpg"]
  },
  {
    name: "Queen Size Bed Frame",
    sku: "BED-QUE-003",
    category: "Bedroom",
    brand: "Pottery Barn",
    description: "Elegant queen size bed frame with upholstered headboard. Features premium fabric and sturdy construction for lasting comfort.",
    price: 1599.99,
    stock: 5,
    status: "Active",
    weight: 55.0,
    dimensions: "200 x 160 x 100 cm",
    material: "Solid Wood, Premium Fabric",
    color: "Charcoal Gray",
    tags: ["bedroom", "queen size", "upholstered", "headboard"],
    images: ["/images/bed-1.jpg", "/images/bed-2.jpg"]
  },
  {
    name: "Accent Chair",
    sku: "CHA-ACC-004",
    category: "Living",
    brand: "CB2",
    description: "Stylish accent chair with modern design. Perfect for adding a pop of color and comfort to any room.",
    price: 599.99,
    stock: 12,
    status: "Active",
    weight: 25.0,
    dimensions: "70 x 70 x 85 cm",
    material: "Metal Frame, Velvet Upholstery",
    color: "Emerald Green",
    tags: ["accent", "modern", "velvet", "colorful"],
    images: ["/images/chair-1.jpg"]
  },
  {
    name: "Kitchen Island",
    sku: "KIT-ISL-005",
    category: "Dining",
    brand: "Restoration Hardware",
    description: "Large kitchen island with storage drawers and seating for 4. Made from reclaimed wood with industrial metal accents.",
    price: 2499.99,
    stock: 3,
    status: "Active",
    weight: 120.0,
    dimensions: "240 x 90 x 90 cm",
    material: "Reclaimed Wood, Metal",
    color: "Weathered Gray",
    tags: ["kitchen", "island", "storage", "industrial"],
    images: ["/images/island-1.jpg", "/images/island-2.jpg"]
  },
  {
    name: "Nightstand Set",
    sku: "NIG-SET-006",
    category: "Bedroom",
    brand: "Crate & Barrel",
    description: "Set of two matching nightstands with drawers and open shelving. Perfect for bedroom storage and organization.",
    price: 799.99,
    stock: 7,
    status: "Active",
    weight: 35.0,
    dimensions: "50 x 40 x 60 cm each",
    material: "Solid Wood, Metal Hardware",
    color: "White",
    tags: ["bedroom", "nightstand", "storage", "set"],
    images: ["/images/nightstand-1.jpg"]
  },
  {
    name: "Sectional Sofa",
    sku: "SOF-SEC-007",
    category: "Living",
    brand: "Article",
    description: "Large L-shaped sectional sofa with deep seating and premium cushions. Perfect for family gatherings and movie nights.",
    price: 2199.99,
    stock: 4,
    status: "Active",
    weight: 85.0,
    dimensions: "300 x 200 x 85 cm",
    material: "Solid Wood Frame, Premium Fabric",
    color: "Navy Blue",
    tags: ["sectional", "large", "family", "comfortable"],
    images: ["/images/sectional-1.jpg", "/images/sectional-2.jpg"]
  },
  {
    name: "Dining Chair Set",
    sku: "CHA-DIN-008",
    category: "Dining",
    brand: "Design Within Reach",
    description: "Set of 4 modern dining chairs with ergonomic design and comfortable seating. Easy to clean and maintain.",
    price: 699.99,
    stock: 10,
    status: "Active",
    weight: 8.0,
    dimensions: "45 x 45 x 85 cm each",
    material: "Metal Frame, Fabric Seat",
    color: "Black",
    tags: ["dining", "chairs", "set", "modern"],
    images: ["/images/dining-chairs-1.jpg"]
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Clear existing products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Existing products cleared.');

    // Insert sample products
    console.log('Inserting sample products...');
    const products = await Product.insertMany(sampleProducts);
    console.log(`Successfully inserted ${products.length} products.`);

    // Display inserted products
    console.log('\nInserted products:');
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (${product.sku}) - $${product.price} - Stock: ${product.stock}`);
    });

    console.log('\nDatabase seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

// Run the seed function
seedDatabase();
