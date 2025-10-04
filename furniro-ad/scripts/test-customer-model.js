const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/furniro';

async function testCustomerModel() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!');

    // Import Customer model
    console.log('📦 Importing Customer model...');
    const Customer = require('../src/models/Customer.ts').default;
    console.log('✅ Customer model imported:', !!Customer);

    // Test creating a customer
    console.log('👤 Testing customer creation...');
    const testCustomer = new Customer({
      email: 'model.test@email.com',
      password: 'password123',
      firstName: 'Model',
      lastName: 'Test',
      phone: '+1 (555) 000-0000'
    });

    console.log('💾 Saving customer...');
    await testCustomer.save();
    console.log('✅ Customer saved successfully!');
    console.log('📋 Customer data:', {
      id: testCustomer._id,
      email: testCustomer.email,
      fullName: testCustomer.getFullName(),
      passwordLength: testCustomer.password.length
    });

    // Clean up
    console.log('🗑️ Cleaning up...');
    await Customer.findByIdAndDelete(testCustomer._id);
    console.log('✅ Cleanup complete!');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Stack:', error.stack);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
  }
}

testCustomerModel();
