import express from 'express';
import {
  getProducts,
  getProductById,
  getSimilarProducts,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/search', searchProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id/similar', getSimilarProducts);
router.get('/:id', getProductById);
router.get('/', getProducts);

// Admin routes
router.get('/admin/all', protect, admin, getAllProductsAdmin);
router.post('/admin', protect, admin, createProduct);
router.put('/admin/:id', protect, admin, updateProduct);
router.delete('/admin/:id', protect, admin, deleteProduct);

export default router;