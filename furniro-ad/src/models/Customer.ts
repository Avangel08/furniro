import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for Customer document
export interface ICustomer extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  
  // Address information
  addresses: {
    type: 'shipping' | 'billing';
    isDefault: boolean;
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  }[];
  
  // Account status
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Shopping behavior
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: Date;
  
  // Marketing preferences
  acceptsMarketing: boolean;
  preferredLanguage: string;
  
  // Timestamps
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
  getDefaultAddress(type?: 'shipping' | 'billing'): any;
}

// Address sub-schema
const AddressSchema = new Schema({
  type: {
    type: String,
    enum: ['shipping', 'billing'],
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  address1: {
    type: String,
    required: true,
    trim: true
  },
  address2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'US',
    trim: true
  },
  phone: {
    type: String,
    trim: true
  }
}, { _id: true });

// Customer Schema
const CustomerSchema = new Schema<ICustomer>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(date: Date) {
        return !date || date < new Date();
      },
      message: 'Date of birth must be in the past'
    }
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: null
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Addresses
  addresses: [AddressSchema],
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // Shopping behavior
  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  lastOrderDate: {
    type: Date,
    default: null
  },
  
  // Marketing preferences
  acceptsMarketing: {
    type: Boolean,
    default: false
  },
  preferredLanguage: {
    type: String,
    default: 'en',
    enum: ['en', 'vi', 'es', 'fr', 'de']
  },
  
  // Login tracking
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
CustomerSchema.index({ email: 1 });
CustomerSchema.index({ isActive: 1 });
CustomerSchema.index({ totalSpent: -1 });
CustomerSchema.index({ lastOrderDate: -1 });
CustomerSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
CustomerSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Instance method to compare password
CustomerSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to get full name
CustomerSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`.trim();
};

// Instance method to get default address
CustomerSchema.methods.getDefaultAddress = function(type?: 'shipping' | 'billing') {
  if (!this.addresses || this.addresses.length === 0) return null;
  
  if (type) {
    return this.addresses.find(addr => addr.type === type && addr.isDefault) || 
           this.addresses.find(addr => addr.type === type);
  }
  
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

// Static method to find customer by email
CustomerSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Virtual for full name
CustomerSchema.virtual('fullName').get(function() {
  return this.getFullName();
});

// Virtual for customer status
CustomerSchema.virtual('status').get(function() {
  if (!this.isActive) return 'Inactive';
  if (!this.isEmailVerified) return 'Unverified';
  return 'Active';
});

// Ensure virtual fields are serialized
CustomerSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.__v;
    return ret;
  }
});

// Create and export the model
const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
