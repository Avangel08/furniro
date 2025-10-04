// Create admin user
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');

async function createAdmin() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/furniro');
    console.log('✅ Connected to MongoDB');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@furniro.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists:');
      console.log('   Email: admin@furniro.com');
      console.log('   Role: admin');
      console.log('   Active:', existingAdmin.isActive);
      return;
    }
    
    // Create admin user
    console.log('🔧 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
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
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('   Active: true');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createAdmin();
