// Test complete customer management flow
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Customer = require('../src/models/Customer');

async function testCustomerFlow() {
  try {
    console.log('🔍 Testing Customer Management Flow...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/furniro');
    console.log('✅ Connected to MongoDB');
    
    // 1. Check/Create Admin User
    console.log('\n1. Checking Admin User...');
    let admin = await User.findOne({ email: 'admin@furniro.com' });
    if (!admin) {
      console.log('🔧 Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      admin = new User({
        email: 'admin@furniro.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        isActive: true
      });
      await admin.save();
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user exists');
    }
    
    // 2. Check Customers
    console.log('\n2. Checking Customers...');
    const customerCount = await Customer.countDocuments();
    console.log(`✅ Found ${customerCount} customers in database`);
    
    if (customerCount > 0) {
      const sampleCustomers = await Customer.find({}, {password: 0}).limit(3);
      console.log('📋 Sample customers:');
      sampleCustomers.forEach((customer, index) => {
        console.log(`   ${index + 1}. ${customer.email} (${customer.firstName} ${customer.lastName})`);
      });
    }
    
    // 3. Test API Endpoint (simulate)
    console.log('\n3. Testing API Logic...');
    const customers = await Customer.find({}).select('-password').lean();
    const customersWithComputed = customers.map(customer => ({
      ...customer,
      fullName: `${customer.firstName} ${customer.lastName}`,
      defaultShippingAddress: customer.addresses?.find(addr => addr.isDefault && addr.type === 'shipping'),
      defaultBillingAddress: customer.addresses?.find(addr => addr.isDefault && addr.type === 'billing')
    }));
    
    console.log(`✅ API would return ${customersWithComputed.length} customers`);
    
    // 4. Summary
    console.log('\n📊 Summary:');
    console.log(`   Admin Users: 1 (admin@furniro.com)`);
    console.log(`   Customers: ${customerCount}`);
    console.log(`   API Ready: ${customerCount > 0 ? 'Yes' : 'No'}`);
    
    if (customerCount === 0) {
      console.log('\n⚠️  No customers found. Make sure to:');
      console.log('   1. Run the seed script to create sample customers');
      console.log('   2. Or register some customers through the frontend');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

testCustomerFlow();
