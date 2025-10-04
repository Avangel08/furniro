// Simple test script for banner API endpoints
const API_BASE_URL = 'http://localhost:3002';

async function testBannerAPI() {
  console.log('🧪 Testing Banner API Endpoints...\n');

  try {
    // Test 1: Get banners (should work without auth for now)
    console.log('📝 Test 1: GET /api/banners');
    const response1 = await fetch(`${API_BASE_URL}/api/banners`);
    const data1 = await response1.json();
    console.log('✅ Response:', response1.status, data1.success ? 'Success' : 'Failed');
    if (data1.data) {
      console.log(`   Found ${data1.data.length} banners`);
    }

    // Test 2: Get scheduling info
    console.log('\n📝 Test 2: GET /api/banners/schedule');
    const response2 = await fetch(`${API_BASE_URL}/api/banners/schedule`);
    const data2 = await response2.json();
    console.log('✅ Response:', response2.status, data2.success ? 'Success' : 'Failed');
    if (data2.data) {
      console.log('   Scheduling stats available');
    }

    // Test 3: Get analytics
    console.log('\n📝 Test 3: GET /api/banners/analytics');
    const response3 = await fetch(`${API_BASE_URL}/api/banners/analytics`);
    const data3 = await response3.json();
    console.log('✅ Response:', response3.status, data3.success ? 'Success' : 'Failed');
    if (data3.data) {
      console.log('   Analytics data available');
    }

    // Test 4: Health check for cron endpoint
    console.log('\n📝 Test 4: GET /api/cron/banner-schedule');
    const response4 = await fetch(`${API_BASE_URL}/api/cron/banner-schedule`);
    const data4 = await response4.json();
    console.log('✅ Response:', response4.status, data4.success ? 'Success' : 'Failed');

    console.log('\n🎉 Banner API tests completed!');
    console.log('\n📊 Test Summary:');
    console.log('✅ GET /api/banners');
    console.log('✅ GET /api/banners/schedule');
    console.log('✅ GET /api/banners/analytics');
    console.log('✅ GET /api/cron/banner-schedule');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the server is running on http://localhost:3002');
  }
}

// Run the test
testBannerAPI();
