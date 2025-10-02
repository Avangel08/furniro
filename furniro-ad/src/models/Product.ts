import mongoose, { Document, Schema } from 'mongoose';

// Helper function to generate unique 8-character product ID
function generateProductId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let result = '';
  
  // Add 2 random letters
  for (let i = 0; i < 2; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  // Add 6 random numbers
  for (let i = 0; i < 6; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  
  return result;
}

export interface IProduct extends Document {
  _id: string;
  name: string;
  sku: string;
  category: 'Dining' | 'Living' | 'Bedroom';
  brand?: string;
  description: string;
  price: number;
  oldPrice?: number;
  stock: number;
  status: 'Active' | 'Inactive' | 'Draft';
  weight?: number;
  dimensions?: string;
  material?: string;
  color?: string;
  tags?: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  _id: {
    type: String,
    default: generateProductId
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [255, 'Product name cannot exceed 255 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [100, 'SKU cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Dining', 'Living', 'Bedroom'],
      message: 'Category must be one of: Dining, Living, Bedroom'
    }
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  oldPrice: {
    type: Number,
    min: [0, 'Old price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['Active', 'Inactive', 'Draft'],
      message: 'Status must be one of: Active, Inactive, Draft'
    },
    default: 'Draft'
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  dimensions: {
    type: String,
    trim: true,
    maxlength: [100, 'Dimensions cannot exceed 100 characters']
  },
  material: {
    type: String,
    trim: true,
    maxlength: [255, 'Material cannot exceed 255 characters']
  },
  color: {
    type: String,
    trim: true,
    maxlength: [100, 'Color cannot exceed 100 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Each tag cannot exceed 50 characters']
  }],
  images: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
// Note: sku already has unique: true, so no need for separate index
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ name: 'text', description: 'text' });

// Virtual for formatted price
ProductSchema.virtual('formattedPrice').get(function() {
  return `$${this.price.toLocaleString()}`;
});

// Virtual for stock status
ProductSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'Out of Stock';
  if (this.stock < 5) return 'Low Stock';
  return 'In Stock';
});

// Pre-save middleware to ensure tags are unique and ID is unique
ProductSchema.pre('save', async function(next) {
  // Ensure tags are unique
  if (this.tags) {
    this.tags = [...new Set(this.tags.filter(tag => tag.trim() !== ''))];
  }
  
  // Ensure _id is unique (only for new documents)
  if (this.isNew && !this._id) {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      const newId = generateProductId();
      const existingProduct = await mongoose.models.Product.findById(newId);
      
      if (!existingProduct) {
        this._id = newId;
        break;
      }
      
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      return next(new Error('Failed to generate unique product ID'));
    }
  }
  
  next();
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
