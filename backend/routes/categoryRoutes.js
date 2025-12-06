import express from 'express';
import {
  getCategories,
  getCategoryById,
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.get('/admin/all', protect, admin, getAllCategoriesAdmin);
router.post('/admin', protect, admin, createCategory);
router.put('/admin/:id', protect, admin, updateCategory);
router.delete('/admin/:id', protect, admin, deleteCategory);

export default router;