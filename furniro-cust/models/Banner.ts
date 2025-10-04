import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
  _id: string;
  title: string;
  type: 'Hero Banner' | 'Promotional' | 'Sale Banner' | 'Seasonal' | 'Other';
  position: 'Homepage Top' | 'Homepage Middle' | 'Homepage Bottom' | 'Category Page' | 'Product Page' | 'Checkout Page' | 'Other';
  status: 'Active' | 'Inactive' | 'Scheduled';
  startDate: Date;
  endDate: Date;
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  clicks: number;
  impressions: number;
  priority: number;
  targetAudience?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
      values: ['Hero Banner', 'Promotional', 'Sale Banner', 'Seasonal', 'Other'],
      message: 'Banner type must be one of: Hero Banner, Promotional, Sale Banner, Seasonal, Other'
    }
  },
  position: {
    type: String,
    required: [true, 'Banner position is required'],
    enum: {
      values: ['Homepage Top', 'Homepage Middle', 'Homepage Bottom', 'Category Page', 'Product Page', 'Checkout Page', 'Other'],
      message: 'Banner position must be one of: Homepage Top, Homepage Middle, Homepage Bottom, Category Page, Product Page, Checkout Page, Other'
    }
  },
  status: {
    type: String,
    required: [true, 'Banner status is required'],
    enum: {
      values: ['Active', 'Inactive', 'Scheduled'],
      message: 'Banner status must be one of: Active, Inactive, Scheduled'
    },
    default: 'Inactive'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function (this: IBanner, value: Date) {
        return value >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true
  },
  linkUrl: {
    type: String,
    trim: true
  },
  altText: {
    type: String,
    trim: true,
    maxlength: [255, 'Alt text cannot exceed 255 characters']
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
  priority: {
    type: Number,
    default: 1,
    min: [1, 'Priority must be at least 1'],
    max: [10, 'Priority cannot exceed 10']
  },
  targetAudience: {
    type: String,
    trim: true,
    maxlength: [500, 'Target audience cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

BannerSchema.index({ status: 1, position: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });
BannerSchema.index({ priority: 1 });

const Banner = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);

export default Banner;
