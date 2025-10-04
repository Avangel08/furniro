import mongoose from 'mongoose';
import User from '../src/models/User';
import Customer from '../src/models/Customer';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/furniro';

async function seedUsers() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Clear existing data
    console.log('🧹 Clearing existing users and customers...');
    await User.deleteMany({});
    await Customer.deleteMany({});

    // Create Admin Users
    console.log('👤 Creating admin users...');
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

    // Use create() instead of insertMany() to trigger pre-save middleware
    const createdUsers = await User.create(adminUsers);
    console.log(`✅ Created ${createdUsers.length} admin users`);

    // Create Sample Customers
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
        acceptsMarketing: true,
        addresses: [{
          type: 'shipping',
          isDefault: true,
          firstName: 'Sarah',
          lastName: 'Johnson',
          address1: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US',
          phone: '+1 (555) 123-4567'
        }]
      },
      {
        email: 'michael.brown@email.com',
        password: 'password123',
        firstName: 'Michael',
        lastName: 'Brown',
        phone: '+1 (555) 234-5678',
        isEmailVerified: true,
        totalOrders: 8,
        totalSpent: 2150,
        acceptsMarketing: false,
        addresses: [{
          type: 'shipping',
          isDefault: true,
          firstName: 'Michael',
          lastName: 'Brown',
          address1: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          country: 'US'
        }]
      },
      {
        email: 'emily.davis@email.com',
        password: 'password123',
        firstName: 'Emily',
        lastName: 'Davis',
        phone: '+1 (555) 345-6789',
        isEmailVerified: false,
        totalOrders: 3,
        totalSpent: 890,
        isActive: false,
        acceptsMarketing: true
      },
      {
        email: 'james.wilson@email.com',
        password: 'password123',
        firstName: 'James',
        lastName: 'Wilson',
        phone: '+1 (555) 456-7890',
        isEmailVerified: true,
        totalOrders: 15,
        totalSpent: 4320,
        acceptsMarketing: true,
        addresses: [{
          type: 'shipping',
          isDefault: true,
          firstName: 'James',
          lastName: 'Wilson',
          address1: '789 Pine St',
          address2: 'Apt 4B',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60601',
          country: 'US',
          phone: '+1 (555) 456-7890'
        }, {
          type: 'billing',
          isDefault: true,
          firstName: 'James',
          lastName: 'Wilson',
          company: 'Wilson Corp',
          address1: '321 Business Blvd',
          city: 'Chicago',
          state: 'IL',
          zipCode: '60602',
          country: 'US'
        }]
      },
      {
        email: 'lisa.anderson@email.com',
        password: 'password123',
        firstName: 'Lisa',
        lastName: 'Anderson',
        phone: '+1 (555) 567-8901',
        isEmailVerified: true,
        totalOrders: 6,
        totalSpent: 1680,
        acceptsMarketing: true,
        dateOfBirth: new Date('1990-05-15'),
        gender: 'female'
      }
    ];

    // Use create() instead of insertMany() to trigger pre-save middleware
    const createdCustomers = await Customer.create(sampleCustomers);
    console.log(`✅ Created ${createdCustomers.length} sample customers`);

    // Display created data
    console.log('\n📊 SEED DATA SUMMARY:');
    console.log('==========================================');
    
    console.log('\n👤 ADMIN USERS:');
    createdUsers.forEach(user => {
      console.log(`  • ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n👥 CUSTOMERS:');
    createdCustomers.forEach(customer => {
      console.log(`  • ${customer.getFullName()} (${customer.email}) - Orders: ${customer.totalOrders}, Spent: $${customer.totalSpent}`);
    });

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('Admin: admin@furniro.com / password123');
    console.log('Manager: manager@furniro.com / password123');
    console.log('Staff: staff@furniro.com / password123');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeding
seedUsers();
