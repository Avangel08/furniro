// Test customer authentication API
const fetch = globalThis.fetch;

const API_BASE = 'http://localhost:3002';
let customerAccessToken = '';
let testCustomerEmail = '';

async function testCustomerRegister() {
  try {
    console.log('🧪 CUSTOMER REGISTRATION TEST');
    console.log('==============================');
    
    const randomId = Math.floor(Math.random() * 10000);
    testCustomerEmail = `customer.test.${randomId}@email.com`;
    
    const registerData = {
      email: testCustomerEmail,
      password: 'password123',
      firstName: 'Customer',
      lastName: 'Test',
      phone: '+1 (555) 123-4567',
      acceptsMarketing: true
    };
    
    console.log('📧 Registering customer:', testCustomerEmail);
    
    const response = await fetch(`${API_BASE}/api/auth/customer/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(registerData)
    });
    
    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', [...response.headers.entries()]);
    
    const data = await response.json();
    console.log('📡 Response body:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ Customer registration successful!');
      console.log(`👤 Created: ${data.data.customer.fullName} (${data.data.customer.email})`);
      console.log(`🆔 Customer ID: ${data.data.customer._id}`);
      console.log(`🔑 Access Token: ${data.data.accessToken.substring(0, 20)}...`);
      customerAccessToken = data.data.accessToken;
      return true;
    } else {
      console.error('❌ Customer registration failed:', data.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Registration test error:', error.message);
    return false;
  }
}

async function testCustomerLogin() {
  try {
    console.log('\n🧪 CUSTOMER LOGIN TEST');
    console.log('=======================');
    
    const loginData = {
      email: testCustomerEmail,
      password: 'password123',
      rememberMe: true
    };
    
    console.log('🔐 Logging in customer:', testCustomerEmail);
    
    const response = await fetch(`${API_BASE}/api/auth/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    });
    
    console.log('📡 Response status:', response.status);
    
    const data = await response.json();
    console.log('📡 Response body:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ Customer login successful!');
      console.log(`👤 Logged in: ${data.data.customer.fullName}`);
      console.log(`🔑 New Access Token: ${data.data.accessToken.substring(0, 20)}...`);
      customerAccessToken = data.data.accessToken;
      return true;
    } else {
      console.error('❌ Customer login failed:', data.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Login test error:', error.message);
    return false;
  }
}

async function testCustomerMe() {
  try {
    console.log('\n🧪 CUSTOMER ME TEST');
    console.log('====================');
    
    if (!customerAccessToken) {
      console.log('⚠️ No access token available for me test');
      return false;
    }
    
    console.log('👤 Getting customer info...');
    
    const response = await fetch(`${API_BASE}/api/auth/customer/me`, {
      headers: {
        'Authorization': `Bearer ${customerAccessToken}`
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    const data = await response.json();
    console.log('📡 Response body:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ Customer me successful!');
      console.log(`👤 Customer: ${data.data.customer.fullName} (${data.data.customer.email})`);
      console.log(`📧 Email verified: ${data.data.customer.isEmailVerified}`);
      console.log(`✅ Active: ${data.data.customer.isActive}`);
      console.log(`📍 Addresses: ${data.data.customer.addresses?.length || 0}`);
      return true;
    } else {
      console.error('❌ Customer me failed:', data.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Me test error:', error.message);
    return false;
  }
}

async function testCustomerLogout() {
  try {
    console.log('\n🧪 CUSTOMER LOGOUT TEST');
    console.log('========================');
    
    console.log('🚪 Logging out customer...');
    
    const response = await fetch(`${API_BASE}/api/auth/customer/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Response status:', response.status);
    
    const data = await response.json();
    console.log('📡 Response body:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ Customer logout successful!');
      return true;
    } else {
      console.error('❌ Customer logout failed:', data.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Logout test error:', error.message);
    return false;
  }
}

async function testInvalidLogin() {
  try {
    console.log('\n🧪 INVALID LOGIN TEST');
    console.log('======================');
    
    const invalidLoginData = {
      email: testCustomerEmail,
      password: 'wrongpassword'
    };
    
    console.log('🔐 Testing invalid login...');
    
    const response = await fetch(`${API_BASE}/api/auth/customer/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(invalidLoginData)
    });
    
    console.log('📡 Response status:', response.status);
    
    const data = await response.json();
    console.log('📡 Response body:', JSON.stringify(data, null, 2));
    
    if (response.status === 401 && !data.success) {
      console.log('✅ Invalid login correctly rejected!');
      return true;
    } else {
      console.error('❌ Invalid login test failed - should have been rejected');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Invalid login test error:', error.message);
    return false;
  }
}

async function runAllCustomerAuthTests() {
  console.log('🧪 CUSTOMER AUTHENTICATION API TESTS');
  console.log('=====================================');
  
  const results = {
    register: await testCustomerRegister(),
    login: await testCustomerLogin(),
    me: await testCustomerMe(),
    logout: await testCustomerLogout(),
    invalidLogin: await testInvalidLogin()
  };
  
  console.log('\n📊 TEST RESULTS SUMMARY:');
  console.log('=========================');
  console.log(`✅ Register: ${results.register ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Login: ${results.login ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Me: ${results.me ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Logout: ${results.logout ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Invalid Login: ${results.invalidLogin ? 'PASS' : 'FAIL'}`);
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalCount = Object.keys(results).length;
  
  console.log(`\n🎯 Overall: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    console.log('🎉 All customer auth tests PASSED! 🚀');
  } else {
    console.log('❌ Some tests failed. Please check the logs above.');
  }
}

runAllCustomerAuthTests();
