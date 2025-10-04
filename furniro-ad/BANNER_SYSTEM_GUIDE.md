# 🎯 Banner Management System Guide

## 📋 Overview

The Banner Management System is a comprehensive solution for managing promotional banners and marketing campaigns. It includes full CRUD operations, performance tracking, scheduling, and analytics.

## 🚀 Features

### ✅ Core Features
- **Banner Management**: Create, read, update, delete banners
- **Performance Tracking**: Track clicks and impressions
- **Scheduling**: Auto-activate/deactivate banners based on dates
- **Analytics**: Comprehensive performance analytics and insights
- **Image Management**: Upload and manage banner images
- **Customer Integration**: Display banners on customer frontend

### ✅ Advanced Features
- **Real-time Analytics**: Live performance metrics
- **Smart Insights**: AI-like performance recommendations
- **Visual Charts**: Interactive performance charts
- **Scheduling Dashboard**: Manage banner activation/deactivation
- **Performance Tracking**: Customer-side click/impression tracking

## 🏗️ System Architecture

### Backend Components
```
furniro-ad/
├── src/models/Banner.ts              # Banner Mongoose model
├── src/app/api/banners/              # Banner API endpoints
│   ├── route.ts                      # GET, POST banners
│   ├── [id]/route.ts                 # GET, PUT, DELETE single banner
│   ├── track/route.ts                # Track performance
│   ├── schedule/route.ts             # Scheduling management
│   └── analytics/route.ts            # Analytics data
├── src/services/
│   ├── bannerService.ts              # API service layer
│   └── bannerScheduler.ts            # Scheduling logic
└── src/components/
    ├── BannerAnalytics.tsx           # Individual banner analytics
    ├── BannerSchedulingDashboard.tsx # Scheduling dashboard
    ├── BannerAnalyticsDashboard.tsx  # Analytics dashboard
    └── BannerCharts.tsx              # Performance charts
```

### Frontend Components
```
furniro-cust/
├── components/BannerDisplay.tsx      # Customer banner display
├── models/Banner.ts                  # Customer Banner model
└── app/api/banners/                  # Customer API endpoints
    ├── route.ts                      # Get active banners
    └── track/route.ts                # Track performance
```

## 📊 Database Schema

### Banner Model
```typescript
interface IBanner {
  _id: string;
  title: string;                      // Banner title
  type: 'Hero Banner' | 'Promotional' | 'Sale Banner' | 'Seasonal' | 'Other';
  position: 'Homepage Top' | 'Homepage Middle' | 'Homepage Bottom' | 'Category Page' | 'Product Page' | 'Checkout Page' | 'Other';
  status: 'Active' | 'Inactive' | 'Scheduled';
  startDate: Date;                    // Campaign start date
  endDate: Date;                      // Campaign end date
  imageUrl: string;                   // Banner image URL
  linkUrl?: string;                   // Click destination URL
  altText?: string;                   // Image alt text
  clicks: number;                     // Total clicks
  impressions: number;                // Total impressions
  priority: number;                   // Display priority (1-10)
  targetAudience?: string;            // Target audience description
  isActive: boolean;                  // Active status
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎮 Usage Guide

### 1. Banner Management

#### Create Banner
1. Navigate to **Banners** → **Banner Management**
2. Click **Add Banner**
3. Fill in the form:
   - **Title**: Banner title
   - **Type**: Banner type (Hero, Promotional, etc.)
   - **Position**: Where to display (Homepage Top, etc.)
   - **Status**: Active, Inactive, or Scheduled
   - **Image**: Upload image or enter URL
   - **Link URL**: Destination when clicked
   - **Dates**: Start and end dates
   - **Priority**: Display priority (1-10)

#### Edit Banner
1. Find the banner in the list
2. Click the **Actions** dropdown
3. Select **Edit Banner**
4. Modify the fields as needed
5. Click **Update Banner**

#### Delete Banner
1. Find the banner in the list
2. Click the **Actions** dropdown
3. Select **Delete Banner**
4. Confirm deletion

### 2. Scheduling Dashboard

#### View Scheduling Status
1. Navigate to **Banners** → **Scheduling Dashboard**
2. View banner status overview:
   - **Active Banners**: Currently running
   - **Scheduled Banners**: Waiting to start
   - **Inactive Banners**: Not running
   - **Starting Soon**: Banners starting in next 3 days

#### Update Banner Statuses
1. Click **Update Statuses** button
2. System will automatically:
   - Activate banners whose start date has arrived
   - Deactivate banners whose end date has passed
   - Schedule banners for future activation

#### Monitor Attention Items
- **Expiring Soon**: Banners ending in next 3 days
- **Expired**: Banners that should be deactivated
- **Starting Soon**: Banners starting in next 3 days

### 3. Analytics Dashboard

#### View Performance Metrics
1. Navigate to **Banners** → **Analytics Dashboard**
2. View key metrics:
   - **Total Banners**: All banners count
   - **Total Clicks**: All-time clicks
   - **Total Impressions**: All-time views
   - **Average CTR**: Overall click-through rate

#### Analyze Performance
- **Top Performing Banners**: Ranked by CTR
- **Performance by Type**: CTR by banner type
- **Performance by Position**: CTR by banner position
- **Daily Performance Trend**: 7-day performance history

#### Visual Charts
- **Bar Charts**: Clicks and impressions by type/position
- **CTR Charts**: Color-coded performance indicators
- **Line Charts**: Daily performance trends

#### Performance Insights
- **Low CTR Alerts**: Banners with poor performance
- **Low Visibility**: Banners with few impressions
- **Excellent Performance**: High-performing banners
- **Best Performing Type**: Recommendations for banner types

### 4. Customer Frontend Integration

#### Display Banners
```typescript
import { BannerDisplay, useActiveBanners } from '@/components/BannerDisplay';

// Get active banners for specific position
const { banners, loading, error } = useActiveBanners('Homepage Top');

// Display banner with tracking
<BannerDisplay banner={banner} className="banner-container" />
```

#### Track Performance
- **Automatic Impression Tracking**: When banner loads
- **Automatic Click Tracking**: When banner is clicked
- **Real-time Updates**: Performance metrics update immediately

## 🔧 API Endpoints

### Admin API
```
GET    /api/banners              # List banners with filters
POST   /api/banners              # Create new banner
GET    /api/banners/[id]         # Get single banner
PUT    /api/banners/[id]         # Update banner
DELETE /api/banners/[id]         # Delete banner
POST   /api/banners/track        # Track banner performance
GET    /api/banners/schedule     # Get scheduling info
POST   /api/banners/schedule     # Update banner statuses
GET    /api/banners/analytics    # Get analytics data
```

### Customer API
```
GET    /api/banners              # Get active banners
POST   /api/banners/track        # Track performance
```

### Cron API
```
GET    /api/cron/banner-schedule # Health check
POST   /api/cron/banner-schedule # Update statuses (with auth)
```

## 🚀 Setup Instructions

### 1. Environment Variables
```env
MONGODB_URI=mongodb://localhost:27017/furniro
CRON_SECRET=your-secret-key-for-cron-jobs
```

### 2. Database Setup
The Banner model will be automatically created when first used.

### 3. Cron Job Setup
Set up a cron job to call the scheduling endpoint:
```bash
# Run every hour
0 * * * * curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3002/api/cron/banner-schedule
```

### 4. Customer Frontend Integration
1. Copy banner components to customer frontend
2. Add banner display to pages
3. Configure API endpoints

## 📈 Performance Optimization

### Database Indexes
- `status` + `position` (compound index)
- `startDate` + `endDate` (compound index)
- `priority` (single index)

### Caching
- Banner data cached on customer frontend
- Analytics data cached for 5 minutes
- Performance tracking uses efficient updates

### Monitoring
- Track API response times
- Monitor database query performance
- Alert on high error rates

## 🐛 Troubleshooting

### Common Issues

#### Banners Not Displaying
1. Check banner status is "Active"
2. Verify current date is within start/end date range
3. Check banner position matches display location
4. Ensure image URL is accessible

#### Performance Tracking Not Working
1. Verify API endpoints are accessible
2. Check network requests in browser dev tools
3. Ensure banner IDs are correct
4. Check database connection

#### Scheduling Not Working
1. Verify cron job is running
2. Check CRON_SECRET environment variable
3. Review server logs for errors
4. Test manual status update

### Debug Commands
```bash
# Test banner system
node scripts/test-banner-system.js

# Test API endpoints
node scripts/test-banner-api.js

# Check banner statuses
node scripts/check-banner-status.js
```

## 📚 Additional Resources

- **API Documentation**: Available at `/api/banners` endpoints
- **Component Documentation**: In component files
- **Database Schema**: In `src/models/Banner.ts`
- **Service Documentation**: In `src/services/` files

## 🎯 Best Practices

### Banner Design
- Use high-quality images (recommended: 1200x400px)
- Keep text minimal and readable
- Use contrasting colors for visibility
- Test on different screen sizes

### Performance
- Set appropriate start/end dates
- Use priority to control display order
- Monitor CTR and optimize underperforming banners
- Regular cleanup of expired banners

### Analytics
- Review performance weekly
- A/B test different banner designs
- Track seasonal performance patterns
- Use insights to optimize future campaigns

---

**🎉 Banner Management System is ready for production use!**
