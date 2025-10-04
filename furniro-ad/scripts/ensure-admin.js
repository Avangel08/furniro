// Ensure admin user exists without clearing existing data
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import User model with proper path
const User = require('../src/models/User.ts');

async function ensureAdmin() {
  try {
    console.log('🔍 Ensuring admin user exists...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/furniro');
    console.log('✅ Connected to MongoDB');
    
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@furniro.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Active: ${existingAdmin.isActive}`);
      return;
    }
    
    // Create admin user
    console.log('🔧 Creating admin user...');
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const admin = new User({
      email: 'admin@furniro.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      isActive: true
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('   Email: admin@furniro.com');
    console.log('   Password: password123');
    console.log('   Role: admin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

ensureAdmin();
