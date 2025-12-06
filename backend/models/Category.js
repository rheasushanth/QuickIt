import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  image: {
    type: String,
    required: [true, 'Category image is required']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  subcategories: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String
    },
    description: {
      type: String
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  productCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better performance
categorySchema.index({ name: 1, isActive: 1 });
categorySchema.index({ sortOrder: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;