const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/furniro';

// Customer Schema
const AddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  type: { type: String, enum: ['shipping', 'billing'], default: 'shipping' }
});

const CustomerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: String,
  addresses: [AddressSchema],
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: Date,
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

// Hash password before saving
CustomerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

async function testCustomers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully!');

    const Customer = mongoose.model('Customer', CustomerSchema);
    
    console.log('🗑️ Clearing existing customers...');
    await Customer.deleteMany({});
    
    console.log('👥 Creating sample customers...');
    const sampleCustomers = [
      {
        email: 'sarah.johnson@email.com',
        password: 'password123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        phone: '+1 (555) 123-4567',
        isEmailVerified: true,
        totalOrders: 12,
        totalSpent: 3240,
        lastOrderDate: new Date('2024-09-15'),
        addresses: [{
          type: 'shipping',
          isDefault: true,
          street: '123 Oak Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        }, {
          type: 'billing',
          isDefault: true,
          street: '123 Oak Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          country: 'USA'
        }]
      },
      {
        email: 'michael.chen@email.com',
        password: 'password123',
        firstName: 'Michael',
        lastName: 'Chen',
        phone: '+1 (555) 987-6543',
        isEmailVerified: true,
        totalOrders: 8,
        totalSpent: 1850,
        lastOrderDate: new Date('2024-09-20'),
        addresses: [{
          type: 'shipping',
          isDefault: true,
          street: '456 Pine Avenue',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        }]
      },
      {
        email: 'emily.davis@email.com',
        password: 'password123',
        firstName: 'Emily',
        lastName: 'Davis',
        phone: '+1 (555) 456-7890',
        isEmailVerified: false,
        totalOrders: 3,
        totalSpent: 720,
        lastOrderDate: new Date('2024-08-30'),
        addresses: [{
          type: 'shipping',
          isDefault: true,
          street: '789 Elm Drive',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          country: 'USA'
        }]
      },
      {
        email: 'david.wilson@email.com',
        password: 'password123',
        firstName: 'David',
        lastName: 'Wilson',
        phone: '+1 (555) 321-0987',
        isEmailVerified: true,
        totalOrders: 0,
        totalSpent: 0,
        addresses: []
      }
    ];

    // Use create() to trigger pre-save middleware
    const createdCustomers = await Customer.create(sampleCustomers);
    console.log(`✅ Created ${createdCustomers.length} sample customers`);
    
    // Display created customers
    console.log('\n📊 CUSTOMERS CREATED:');
    console.log('====================');
    for (const customer of createdCustomers) {
      console.log(`📧 ${customer.email}`);
      console.log(`👤 ${customer.firstName} ${customer.lastName}`);
      console.log(`📱 ${customer.phone || 'No phone'}`);
      console.log(`💰 $${customer.totalSpent} (${customer.totalOrders} orders)`);
      console.log(`✅ Verified: ${customer.isEmailVerified ? 'Yes' : 'No'}`);
      console.log(`📍 ${customer.addresses.length} address(es)`);
      console.log('---');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
  }
}

testCustomers();
