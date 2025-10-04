import connectDB from '@/lib/mongodb';
import Banner from '@/models/Banner';

export class BannerScheduler {
  /**
   * Check and update banner statuses based on their start/end dates
   */
  static async updateBannerStatuses() {
    try {
      await connectDB();
      
      const now = new Date();
      
      // Find banners that should be activated (start date reached, status is Scheduled)
      const bannersToActivate = await Banner.find({
        status: 'Scheduled',
        startDate: { $lte: now },
        endDate: { $gte: now }
      });

      // Find banners that should be deactivated (end date passed, status is Active)
      const bannersToDeactivate = await Banner.find({
        status: 'Active',
        endDate: { $lt: now }
      });

      // Find banners that should be scheduled (start date in future, status is Active)
      const bannersToSchedule = await Banner.find({
        status: 'Active',
        startDate: { $gt: now }
      });

      const results = {
        activated: 0,
        deactivated: 0,
        scheduled: 0,
        errors: [] as string[]
      };

      // Activate banners
      if (bannersToActivate.length > 0) {
        try {
          const activateResult = await Banner.updateMany(
            { _id: { $in: bannersToActivate.map(b => b._id) } },
            { 
              $set: { 
                status: 'Active',
                isActive: true,
                updatedAt: now
              }
            }
          );
          results.activated = activateResult.modifiedCount;
        } catch (error: any) {
          results.errors.push(`Failed to activate banners: ${error.message}`);
        }
      }

      // Deactivate banners
      if (bannersToDeactivate.length > 0) {
        try {
          const deactivateResult = await Banner.updateMany(
            { _id: { $in: bannersToDeactivate.map(b => b._id) } },
            { 
              $set: { 
                status: 'Inactive',
                isActive: false,
                updatedAt: now
              }
            }
          );
          results.deactivated = deactivateResult.modifiedCount;
        } catch (error: any) {
          results.errors.push(`Failed to deactivate banners: ${error.message}`);
        }
      }

      // Schedule banners
      if (bannersToSchedule.length > 0) {
        try {
          const scheduleResult = await Banner.updateMany(
            { _id: { $in: bannersToSchedule.map(b => b._id) } },
            { 
              $set: { 
                status: 'Scheduled',
                isActive: false,
                updatedAt: now
              }
            }
          );
          results.scheduled = scheduleResult.modifiedCount;
        } catch (error: any) {
          results.errors.push(`Failed to schedule banners: ${error.message}`);
        }
      }

      return results;

    } catch (error: any) {
      console.error('Error updating banner statuses:', error);
      throw new Error(`Failed to update banner statuses: ${error.message}`);
    }
  }

  /**
   * Get banner scheduling statistics
   */
  static async getSchedulingStats() {
    try {
      await connectDB();
      
      const now = new Date();
      
      const stats = await Banner.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const upcomingBanners = await Banner.countDocuments({
        status: 'Scheduled',
        startDate: { $gt: now }
      });

      const expiringBanners = await Banner.countDocuments({
        status: 'Active',
        endDate: { 
          $gte: now,
          $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
        }
      });

      const expiredBanners = await Banner.countDocuments({
        status: 'Active',
        endDate: { $lt: now }
      });

      return {
        statusCounts: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {} as Record<string, number>),
        upcomingBanners,
        expiringBanners,
        expiredBanners
      };

    } catch (error: any) {
      console.error('Error getting scheduling stats:', error);
      throw new Error(`Failed to get scheduling stats: ${error.message}`);
    }
  }

  /**
   * Get banners that need attention (expiring soon, expired, etc.)
   */
  static async getBannersNeedingAttention() {
    try {
      await connectDB();
      
      const now = new Date();
      const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      
      const expiringSoon = await Banner.find({
        status: 'Active',
        endDate: { 
          $gte: now,
          $lte: threeDaysFromNow
        }
      }).select('title endDate status').lean();

      const expired = await Banner.find({
        status: 'Active',
        endDate: { $lt: now }
      }).select('title endDate status').lean();

      const startingSoon = await Banner.find({
        status: 'Scheduled',
        startDate: { 
          $gte: now,
          $lte: threeDaysFromNow
        }
      }).select('title startDate status').lean();

      return {
        expiringSoon,
        expired,
        startingSoon
      };

    } catch (error: any) {
      console.error('Error getting banners needing attention:', error);
      throw new Error(`Failed to get banners needing attention: ${error.message}`);
    }
  }
}
