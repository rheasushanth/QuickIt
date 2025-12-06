import express from 'express';
import {
  getSubcategories,
  getSubcategoriesByCategory,
  getAllSubcategoriesAdmin,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory
} from '../controllers/subcategoryController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getSubcategories);
router.get('/category/:categoryId', getSubcategoriesByCategory);

// Admin routes
router.get('/admin/all', protect, admin, getAllSubcategoriesAdmin);
router.post('/admin', protect, admin, createSubcategory);
router.put('/admin/:id', protect, admin, updateSubcategory);
router.delete('/admin/:id', protect, admin, deleteSubcategory);

export default router;
