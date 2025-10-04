// Create admin user using MongoDB shell commands
console.log('🔍 Creating admin user...');

// Connect to MongoDB
db = db.getSiblingDB('furniro');

// Check if admin exists
const existingAdmin = db.users.findOne({ email: 'admin@furniro.com' });
if (existingAdmin) {
  print('✅ Admin user already exists:');
  print('   Email: ' + existingAdmin.email);
  print('   Name: ' + existingAdmin.name);
  print('   Role: ' + existingAdmin.role);
  print('   Active: ' + existingAdmin.isActive);
} else {
  // Create admin user
  print('🔧 Creating admin user...');
  
  // Note: In real implementation, password should be hashed with bcrypt
  // For now, we'll create with plain text (you should hash it properly)
  const adminUser = {
    email: 'admin@furniro.com',
    password: 'password123', // This should be hashed in production
    name: 'Admin User',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  db.users.insertOne(adminUser);
  print('✅ Admin user created successfully!');
  print('   Email: admin@furniro.com');
  print('   Password: password123');
  print('   Role: admin');
}

print('🎉 Done!');
