import mongoose, { Document, Schema } from 'mongoose';

// Interface for Banner document
export interface IBanner extends Document {
  _id: string;
  title: string;
  type: 'Hero Banner' | 'Promotional' | 'Sale Banner' | 'Seasonal' | 'Category Banner';
  position: 'Homepage Top' | 'Homepage Middle' | 'Homepage Bottom' | 'Category Page' | 'Product Page';
  status: 'Active' | 'Inactive' | 'Scheduled' | 'Draft';
  
  // Content
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  
  // Scheduling
  startDate: Date;
  endDate: Date;
  
  // Performance metrics
  clicks: number;
  impressions: number;
  
  // Additional settings
  isActive: boolean;
  priority: number; // Higher number = higher priority
  targetAudience?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  clickThroughRate: number;
  isCurrentlyActive: boolean;
  daysRemaining: number;
}

// Banner Schema
const BannerSchema = new Schema<IBanner>({
  title: {
    type: String,
    required: [true, 'Banner title is required'],
    trim: true,
    maxlength: [255, 'Banner title cannot exceed 255 characters']
  },
  type: {
    type: String,
    required: [true, 'Banner type is required'],
    enum: {
      values: ['Hero Banner', 'Promotional', 'Sale Banner', 'Seasonal', 'Category Banner'],
      message: 'Banner type must be one of: Hero Banner, Promotional, Sale Banner, Seasonal, Category Banner'
    }
  },
  position: {
    type: String,
    required: [true, 'Banner position is required'],
    enum: {
      values: ['Homepage Top', 'Homepage Middle', 'Homepage Bottom', 'Category Page', 'Product Page'],
      message: 'Banner position must be one of: Homepage Top, Homepage Middle, Homepage Bottom, Category Page, Product Page'
    }
  },
  status: {
    type: String,
    required: [true, 'Banner status is required'],
    enum: {
      values: ['Active', 'Inactive', 'Scheduled', 'Draft'],
      message: 'Banner status must be one of: Active, Inactive, Scheduled, Draft'
    },
    default: 'Draft'
  },
  imageUrl: {
    type: String,
    required: [true, 'Banner image URL is required'],
    trim: true
  },
  linkUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Optional field
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Link URL must be a valid HTTP/HTTPS URL'
    }
  },
  altText: {
    type: String,
    trim: true,
    maxlength: [255, 'Alt text cannot exceed 255 characters']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: IBanner, v: Date) {
        return v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  clicks: {
    type: Number,
    default: 0,
    min: [0, 'Clicks cannot be negative']
  },
  impressions: {
    type: Number,
    default: 0,
    min: [0, 'Impressions cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot exceed 10']
  },
  targetAudience: {
    type: String,
    trim: true,
    maxlength: [500, 'Target audience description cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for click-through rate
BannerSchema.virtual('clickThroughRate').get(function() {
  if (this.impressions === 0) return 0;
  return Math.round((this.clicks / this.impressions) * 100 * 100) / 100; // Round to 2 decimal places
});

// Virtual for checking if banner is currently active
BannerSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && 
         this.status === 'Active' && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Virtual for days remaining
BannerSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const endDate = new Date(this.endDate);
  const diffTime = endDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Indexes for better performance
BannerSchema.index({ status: 1 });
BannerSchema.index({ type: 1 });
BannerSchema.index({ position: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });
BannerSchema.index({ isActive: 1 });
BannerSchema.index({ priority: -1 }); // Descending order for priority

// Pre-save middleware to update status based on dates
BannerSchema.pre('save', function(next) {
  const now = new Date();
  
  // Auto-update status based on dates
  if (this.status === 'Scheduled' && this.startDate <= now && this.endDate >= now) {
    this.status = 'Active';
  } else if (this.status === 'Active' && this.endDate < now) {
    this.status = 'Inactive';
  }
  
  next();
});

// Static method to get active banners for a specific position
BannerSchema.statics.getActiveBanners = function(position?: string) {
  const now = new Date();
  const query: any = {
    isActive: true,
    status: 'Active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  };
  
  if (position) {
    query.position = position;
  }
  
  return this.find(query).sort({ priority: -1, createdAt: -1 });
};

// Static method to update performance metrics
BannerSchema.statics.updatePerformance = function(bannerId: string, type: 'click' | 'impression') {
  const updateField = type === 'click' ? { $inc: { clicks: 1 } } : { $inc: { impressions: 1 } };
  return this.findByIdAndUpdate(bannerId, updateField, { new: true });
};

// Export the model
const Banner = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;
