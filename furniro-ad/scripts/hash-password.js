// Simple script to hash password for MongoDB
const bcrypt = require('bcryptjs');

async function hashPassword() {
  try {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    console.log('🔐 Password Hash:');
    console.log('Original:', password);
    console.log('Hashed:', hashedPassword);
    
    console.log('\n📋 MongoDB Command:');
    console.log(`db.users.insertOne({
  email: 'admin@furniro.com',
  password: '${hashedPassword}',
  name: 'Admin User',
  role: 'admin',
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

hashPassword();
