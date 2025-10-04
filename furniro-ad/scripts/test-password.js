const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/furniro';

// Define User schema for testing
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  isActive: Boolean
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

async function testPassword() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!');

    const User = mongoose.model('User', UserSchema);
    
    // Find admin user
    const adminUser = await User.findOne({ email: 'admin@furniro.com' });
    
    if (!adminUser) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('\n🔍 ADMIN USER DEBUG:');
    console.log('====================');
    console.log('Email:', adminUser.email);
    console.log('Name:', adminUser.name);
    console.log('Role:', adminUser.role);
    console.log('Active:', adminUser.isActive);
    console.log('Password hash length:', adminUser.password?.length || 'No password');
    console.log('Password starts with $2:', adminUser.password?.startsWith('$2') || false);
    
    // Test password comparison
    const testPasswords = ['password123', 'password', 'admin123'];
    
    console.log('\n🧪 PASSWORD TESTS:');
    console.log('==================');
    
    for (const testPassword of testPasswords) {
      try {
        const isMatch = await adminUser.comparePassword(testPassword);
        console.log(`"${testPassword}" → ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
      } catch (error) {
        console.log(`"${testPassword}" → ❌ ERROR:`, error.message);
      }
    }
    
    // Test bcrypt directly
    console.log('\n🔧 DIRECT BCRYPT TEST:');
    console.log('======================');
    
    try {
      const directMatch = await bcrypt.compare('password123', adminUser.password);
      console.log('Direct bcrypt.compare("password123"):', directMatch ? '✅ MATCH' : '❌ NO MATCH');
    } catch (error) {
      console.log('Direct bcrypt error:', error.message);
    }
    
    // Test password hashing
    console.log('\n🔐 HASH TEST:');
    console.log('=============');
    
    const testHash = await bcrypt.hash('password123', 12);
    console.log('New hash for "password123":', testHash);
    
    const newHashMatch = await bcrypt.compare('password123', testHash);
    console.log('New hash comparison:', newHashMatch ? '✅ MATCH' : '❌ NO MATCH');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testPassword();
