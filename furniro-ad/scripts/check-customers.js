#!/usr/bin/env node

const mongoose = require('mongoose');
const Customer = require('../src/models/Customer.ts').default;

async function checkCustomers() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/furniro');
    console.log('✅ Connected to MongoDB');
    
    console.log('🔍 Fetching customers...');
    const customers = await Customer.find({}).sort({ createdAt: -1 });
    console.log(`📊 Total customers: ${customers.length}`);
    
    if (customers.length === 0) {
      console.log('❌ No customers found in database');
    } else {
      console.log('\n📋 Customer List:');
      customers.forEach((customer, index) => {
        console.log(`${index + 1}. Email: ${customer.email}`);
        console.log(`   Name: ${customer.firstName} ${customer.lastName}`);
        console.log(`   Phone: ${customer.phone || 'N/A'}`);
        console.log(`   Created: ${customer.createdAt}`);
        console.log(`   Active: ${customer.isActive}`);
        console.log('---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCustomers();
