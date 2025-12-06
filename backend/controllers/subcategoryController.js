import Subcategory from '../models/Subcategory.js';
import Category from '../models/Category.js';

// @desc    Get all active subcategories
// @route   GET /api/subcategories
// @access  Public
export const getSubcategories = async (req, res) => {
  try {
    const { category } = req.query;
    
    let query = { isActive: true };
    if (category) {
      query.category = category;
    }

    const subcategories = await Subcategory.find(query)
      .populate('category', 'name')
      .sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: { subcategories }
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subcategories'
    });
  }
};

// @desc    Get subcategories by category
// @route   GET /api/subcategories/category/:categoryId
// @access  Public
export const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const subcategories = await Subcategory.find({ 
      category: categoryId, 
      isActive: true 
    }).sort({ sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: { subcategories }
    });
  } catch (error) {
    console.error('Get subcategories by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subcategories'
    });
  }
};

// ============================================
// ADMIN ONLY CONTROLLERS
// ============================================

// @desc    Get all subcategories including inactive (Admin)
// @route   GET /api/subcategories/admin/all
// @access  Private/Admin
export const getAllSubcategoriesAdmin = async (req, res) => {
  try {
    const subcategories = await Subcategory.find()
      .populate('category', 'name')
      .sort({ category: 1, sortOrder: 1, name: 1 });

    res.json({
      success: true,
      data: { subcategories }
    });
  } catch (error) {
    console.error('Get all subcategories admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subcategories'
    });
  }
};

// @desc    Create new subcategory (Admin)
// @route   POST /api/subcategories/admin
// @access  Private/Admin
export const createSubcategory = async (req, res) => {
  try {
    const { name, category, image, description, sortOrder } = req.body;

    // Verify category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if subcategory already exists
    const existingSubcategory = await Subcategory.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      category
    });

    if (existingSubcategory) {
      return res.status(400).json({
        success: false,
        message: 'Subcategory with this name already exists in this category'
      });
    }

    const subcategory = await Subcategory.create({
      name,
      category,
      categoryName: categoryExists.name,
      image,
      description,
      sortOrder,
      isActive: true
    });

    const populatedSubcategory = await Subcategory.findById(subcategory._id)
      .populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: { subcategory: populatedSubcategory }
    });
  } catch (error) {
    console.error('Create subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating subcategory',
      error: error.message
    });
  }
};

// @desc    Update subcategory (Admin)
// @route   PUT /api/subcategories/admin/:id
// @access  Private/Admin
export const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    // If category is being changed, verify it exists
    if (updateData.category && updateData.category !== subcategory.category.toString()) {
      const categoryExists = await Category.findById(updateData.category);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
      updateData.categoryName = categoryExists.name;
    }

    // If name is being changed, check for duplicates
    if (updateData.name && updateData.name !== subcategory.name) {
      const existingSubcategory = await Subcategory.findOne({ 
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        category: updateData.category || subcategory.category,
        _id: { $ne: id }
      });

      if (existingSubcategory) {
        return res.status(400).json({
          success: false,
          message: 'Subcategory with this name already exists in this category'
        });
      }
    }

    Object.assign(subcategory, updateData);
    await subcategory.save();

    const populatedSubcategory = await Subcategory.findById(id)
      .populate('category', 'name');

    res.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: { subcategory: populatedSubcategory }
    });
  } catch (error) {
    console.error('Update subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating subcategory',
      error: error.message
    });
  }
};

// @desc    Delete subcategory (Admin)
// @route   DELETE /api/subcategories/admin/:id
// @access  Private/Admin
export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findById(id);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found'
      });
    }

    // Soft delete - mark as inactive
    subcategory.isActive = false;
    await subcategory.save();

    res.json({
      success: true,
      message: 'Subcategory deleted successfully'
    });
  } catch (error) {
    console.error('Delete subcategory error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting subcategory'
    });
  }
};
