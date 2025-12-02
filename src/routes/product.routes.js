const express = require('express');
const router = express.Router();
const {
  getPublicProducts,
  getAllProducts,
  getProductById,
  getCategories,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductPermanently,
  toggleProductStatus
} = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/public', getPublicProducts);
router.get('/public/categories', getCategories);
router.get('/public/category/:category', getProductsByCategory);

// Rutas protegidas (requieren autenticación)
router.get('/', authMiddleware, getAllProducts);
router.get('/:id', authMiddleware, getProductById);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.patch('/:id/toggle-status', authMiddleware, toggleProductStatus);
router.delete('/:id', authMiddleware, deleteProduct);
router.delete('/:id/permanent', authMiddleware, deleteProductPermanently);

module.exports = router;