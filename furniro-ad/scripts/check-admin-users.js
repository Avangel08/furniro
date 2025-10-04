// Check admin users in database
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function checkAdminUsers() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/furniro');
    console.log('✅ Connected to MongoDB');
    
    console.log('\n🔍 Checking admin users...');
    const adminUsers = await User.find({}, {password: 0});
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found!');
      console.log('💡 You need to create admin users first.');
      
      // Create a default admin user
      console.log('\n🔧 Creating default admin user...');
      const bcrypt = require('bcryptjs');
      const defaultAdmin = new User({
        email: 'admin@furniro.com',
        password: await bcrypt.hash('admin123', 12),
        name: 'Admin User',
        role: 'admin',
        isActive: true
      });
      
      await defaultAdmin.save();
      console.log('✅ Default admin user created:');
      console.log('   Email: admin@furniro.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
      
    } else {
      console.log(`✅ Found ${adminUsers.length} admin users:`);
      adminUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (${user.role}) - Active: ${user.isActive}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkAdminUsers();
