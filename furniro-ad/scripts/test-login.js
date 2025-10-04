const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/furniro';

async function testLogin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!');

    // Check users collection
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const users = await User.find({}, { email: 1, name: 1, role: 1 }).limit(5);
    
    console.log('\n👤 USERS IN DATABASE:');
    console.log('======================');
    if (users.length === 0) {
      console.log('❌ No users found in database!');
    } else {
      users.forEach(user => {
        console.log(`  • ${user.name || 'No name'} (${user.email || 'No email'}) - Role: ${user.role || 'No role'}`);
      });
    }

    // Check customers collection  
    const Customer = mongoose.model('Customer', new mongoose.Schema({}, { strict: false }));
    const customers = await Customer.find({}, { email: 1, firstName: 1, lastName: 1 }).limit(3);
    
    console.log('\n👥 CUSTOMERS IN DATABASE:');
    console.log('==========================');
    if (customers.length === 0) {
      console.log('❌ No customers found in database!');
    } else {
      customers.forEach(customer => {
        console.log(`  • ${customer.firstName || 'No name'} ${customer.lastName || ''} (${customer.email || 'No email'})`);
      });
    }

    console.log('\n📊 COLLECTIONS IN DATABASE:');
    console.log('============================');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`  • ${col.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testLogin();
