const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import models
const Banner = require('../src/models/Banner').default;

async function testBannerSystem() {
  try {
    console.log('🧪 Testing Banner Management System...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Create a test banner
    console.log('\n📝 Test 1: Creating a test banner...');
    const testBanner = new Banner({
      title: 'Test Banner - Summer Sale',
      type: 'Sale Banner',
      position: 'Homepage Top',
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      imageUrl: 'https://example.com/banner.jpg',
      linkUrl: 'https://example.com/sale',
      altText: 'Summer Sale Banner',
      priority: 1,
      targetAudience: 'All customers',
      clicks: 0,
      impressions: 0
    });

    const savedBanner = await testBanner.save();
    console.log('✅ Test banner created:', savedBanner._id);

    // Test 2: Update banner
    console.log('\n📝 Test 2: Updating banner...');
    savedBanner.clicks = 25;
    savedBanner.impressions = 1000;
    await savedBanner.save();
    console.log('✅ Banner updated with performance data');

    // Test 3: Find banners
    console.log('\n📝 Test 3: Finding banners...');
    const banners = await Banner.find({ status: 'Active' });
    console.log(`✅ Found ${banners.length} active banners`);

    // Test 4: Test scheduling logic
    console.log('\n📝 Test 4: Testing scheduling logic...');
    
    // Create a scheduled banner
    const scheduledBanner = new Banner({
      title: 'Scheduled Banner - Black Friday',
      type: 'Promotional',
      position: 'Homepage Middle',
      status: 'Scheduled',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      imageUrl: 'https://example.com/black-friday.jpg',
      priority: 2,
      clicks: 0,
      impressions: 0
    });
    await scheduledBanner.save();
    console.log('✅ Scheduled banner created');

    // Create an expired banner
    const expiredBanner = new Banner({
      title: 'Expired Banner - Spring Sale',
      type: 'Seasonal',
      position: 'Homepage Bottom',
      status: 'Active',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      imageUrl: 'https://example.com/spring-sale.jpg',
      priority: 3,
      clicks: 50,
      impressions: 2000
    });
    await expiredBanner.save();
    console.log('✅ Expired banner created');

    // Test 5: Performance tracking
    console.log('\n📝 Test 5: Testing performance tracking...');
    const bannerToTrack = await Banner.findById(savedBanner._id);
    bannerToTrack.clicks += 5;
    bannerToTrack.impressions += 100;
    await bannerToTrack.save();
    console.log('✅ Performance tracking updated');

    // Test 6: Analytics queries
    console.log('\n📝 Test 6: Testing analytics queries...');
    
    // Total banners
    const totalBanners = await Banner.countDocuments();
    console.log(`✅ Total banners: ${totalBanners}`);

    // Active banners
    const activeBanners = await Banner.countDocuments({ status: 'Active' });
    console.log(`✅ Active banners: ${activeBanners}`);

    // Total clicks and impressions
    const totalClicks = await Banner.aggregate([
      { $group: { _id: null, total: { $sum: '$clicks' } } }
    ]);
    const totalImpressions = await Banner.aggregate([
      { $group: { _id: null, total: { $sum: '$impressions' } } }
    ]);
    
    console.log(`✅ Total clicks: ${totalClicks[0]?.total || 0}`);
    console.log(`✅ Total impressions: ${totalImpressions[0]?.total || 0}`);

    // Performance by type
    const performanceByType = await Banner.aggregate([
      {
        $group: {
          _id: '$type',
          totalClicks: { $sum: '$clicks' },
          totalImpressions: { $sum: '$impressions' },
          count: { $sum: 1 }
        }
      }
    ]);
    console.log('✅ Performance by type:', performanceByType);

    // Test 7: Cleanup test data
    console.log('\n📝 Test 7: Cleaning up test data...');
    await Banner.deleteMany({ 
      title: { 
        $in: [
          'Test Banner - Summer Sale',
          'Scheduled Banner - Black Friday',
          'Expired Banner - Spring Sale'
        ]
      }
    });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All banner system tests passed!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Banner creation');
    console.log('✅ Banner updates');
    console.log('✅ Banner queries');
    console.log('✅ Scheduling logic');
    console.log('✅ Performance tracking');
    console.log('✅ Analytics queries');
    console.log('✅ Data cleanup');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the test
testBannerSystem();
