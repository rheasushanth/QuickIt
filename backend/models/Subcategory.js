import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subcategory name is required'],
    trim: true,
    unique: true,
    maxlength: [50, 'Subcategory name cannot exceed 50 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Parent category is required']
  },
  categoryName: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
subcategorySchema.index({ category: 1, sortOrder: 1 });
subcategorySchema.index({ name: 1, isActive: 1 });

const Subcategory = mongoose.model('Subcategory', subcategorySchema);
export default Subcategory;
