#!/usr/bin/env node

/**
 * Comprehensive Customer Authentication Test Script
 * Tests all customer auth endpoints and edge cases
 */

const API_BASE_URL = 'http://localhost:3002';

// Test data
const testCustomer = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  phone: '+1234567890',
  acceptsMarketing: true
};

const invalidCredentials = {
  email: 'invalid@example.com',
  password: 'wrongpassword'
};

let accessToken = '';
let refreshToken = '';

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();
  
  return {
    status: response.status,
    data,
    headers: response.headers
  };
}

// Test functions
async function testCustomerRegistration() {
  console.log('\n🧪 Testing Customer Registration...');
  
  try {
    const result = await apiCall('/api/auth/customer/register', {
      method: 'POST',
      body: JSON.stringify(testCustomer)
    });
    
    if (result.status === 201) {
      console.log('✅ Registration successful');
      console.log('   Customer ID:', result.data.data.customer._id);
      console.log('   Email:', result.data.data.customer.email);
      console.log('   Full Name:', result.data.data.customer.fullName);
      return true;
    } else {
      console.log('❌ Registration failed:', result.status, result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return false;
  }
}

async function testCustomerLogin() {
  console.log('\n🧪 Testing Customer Login...');
  
  try {
    const result = await apiCall('/api/auth/customer/login', {
      method: 'POST',
      body: JSON.stringify({
        email: testCustomer.email,
        password: testCustomer.password,
        rememberMe: false
      })
    });
    
    if (result.status === 200) {
      console.log('✅ Login successful');
      accessToken = result.data.data.accessToken;
      console.log('   Access Token:', accessToken.substring(0, 20) + '...');
      
      // Check for refresh token cookie
      const setCookieHeader = result.headers.get('set-cookie');
      if (setCookieHeader && setCookieHeader.includes('customerRefreshToken')) {
        console.log('✅ Refresh token cookie set');
      } else {
        console.log('⚠️  Refresh token cookie not found');
      }
      
      return true;
    } else {
      console.log('❌ Login failed:', result.status, result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testCustomerMe() {
  console.log('\n🧪 Testing Customer /me endpoint...');
  
  if (!accessToken) {
    console.log('❌ No access token available');
    return false;
  }
  
  try {
    const result = await apiCall('/api/auth/customer/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (result.status === 200) {
      console.log('✅ /me endpoint successful');
      console.log('   Customer ID:', result.data.data.customer._id);
      console.log('   Email:', result.data.data.customer.email);
      console.log('   Role:', result.data.data.customer.role);
      return true;
    } else {
      console.log('❌ /me endpoint failed:', result.status, result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ /me endpoint error:', error.message);
    return false;
  }
}

async function testInvalidCredentials() {
  console.log('\n🧪 Testing Invalid Credentials...');
  
  try {
    const result = await apiCall('/api/auth/customer/login', {
      method: 'POST',
      body: JSON.stringify(invalidCredentials)
    });
    
    if (result.status === 401) {
      console.log('✅ Invalid credentials properly rejected');
      return true;
    } else {
      console.log('❌ Invalid credentials not properly handled:', result.status, result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Invalid credentials test error:', error.message);
    return false;
  }
}

async function testInvalidToken() {
  console.log('\n🧪 Testing Invalid Token...');
  
  try {
    const result = await apiCall('/api/auth/customer/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer invalid-token-12345'
      }
    });
    
    if (result.status === 401) {
      console.log('✅ Invalid token properly rejected');
      return true;
    } else {
      console.log('❌ Invalid token not properly handled:', result.status, result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Invalid token test error:', error.message);
    return false;
  }
}

async function testMissingToken() {
  console.log('\n🧪 Testing Missing Token...');
  
  try {
    const result = await apiCall('/api/auth/customer/me', {
      method: 'GET'
    });
    
    if (result.status === 401) {
      console.log('✅ Missing token properly rejected');
      return true;
    } else {
      console.log('❌ Missing token not properly handled:', result.status, result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Missing token test error:', error.message);
    return false;
  }
}

async function testCustomerLogout() {
  console.log('\n🧪 Testing Customer Logout...');
  
  if (!accessToken) {
    console.log('❌ No access token available');
    return false;
  }
  
  try {
    const result = await apiCall('/api/auth/customer/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (result.status === 200) {
      console.log('✅ Logout successful');
      return true;
    } else {
      console.log('❌ Logout failed:', result.status, result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Logout error:', error.message);
    return false;
  }
}

async function testTokenAfterLogout() {
  console.log('\n🧪 Testing Token After Logout...');
  
  if (!accessToken) {
    console.log('❌ No access token available');
    return false;
  }
  
  try {
    const result = await apiCall('/api/auth/customer/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (result.status === 401) {
      console.log('✅ Token properly invalidated after logout');
      return true;
    } else {
      console.log('❌ Token still valid after logout:', result.status, result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Token after logout test error:', error.message);
    return false;
  }
}

async function testDuplicateRegistration() {
  console.log('\n🧪 Testing Duplicate Registration...');
  
  try {
    const result = await apiCall('/api/auth/customer/register', {
      method: 'POST',
      body: JSON.stringify(testCustomer)
    });
    
    if (result.status === 400) {
      console.log('✅ Duplicate registration properly rejected');
      return true;
    } else {
      console.log('❌ Duplicate registration not properly handled:', result.status, result.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Duplicate registration test error:', error.message);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting Comprehensive Customer Authentication Tests');
  console.log('=' .repeat(60));
  
  const tests = [
    { name: 'Customer Registration', fn: testCustomerRegistration },
    { name: 'Customer Login', fn: testCustomerLogin },
    { name: 'Customer /me endpoint', fn: testCustomerMe },
    { name: 'Invalid Credentials', fn: testInvalidCredentials },
    { name: 'Invalid Token', fn: testInvalidToken },
    { name: 'Missing Token', fn: testMissingToken },
    { name: 'Customer Logout', fn: testCustomerLogout },
    { name: 'Token After Logout', fn: testTokenAfterLogout },
    { name: 'Duplicate Registration', fn: testDuplicateRegistration }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} crashed:`, error.message);
      failed++;
    }
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Customer authentication system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the authentication system.');
  }
}

// Run tests
runTests().catch(console.error);
