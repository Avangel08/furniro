const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/furniro';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'staff'], default: 'staff' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

async function resetUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!');

    const User = mongoose.model('User', UserSchema);
    
    console.log('🗑️ Deleting all existing users...');
    await User.deleteMany({});
    console.log('✅ All users deleted!');
    
    console.log('👤 Creating new admin users...');
    const adminUsers = [
      {
        email: 'admin@furniro.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin'
      },
      {
        email: 'manager@furniro.com', 
        password: 'password123',
        name: 'Manager User',
        role: 'manager'
      },
      {
        email: 'staff@furniro.com',
        password: 'password123',
        name: 'Staff User',
        role: 'staff'
      }
    ];

    // Use create() to trigger pre-save middleware
    const createdUsers = await User.create(adminUsers);
    console.log(`✅ Created ${createdUsers.length} admin users`);
    
    // Test password hashing
    console.log('\n🔍 VERIFICATION:');
    const testUser = await User.findOne({ email: 'admin@furniro.com' });
    console.log('Email:', testUser.email);
    console.log('Password hash length:', testUser.password.length);
    console.log('Password starts with $2:', testUser.password.startsWith('$2'));
    
    const isPasswordCorrect = await testUser.comparePassword('password123');
    console.log('Password test result:', isPasswordCorrect ? '✅ CORRECT' : '❌ WRONG');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
  }
}

resetUsers();
