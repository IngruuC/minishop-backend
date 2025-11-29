const express = require('express');
const router = express.Router();
const {
  getPublicProducts,
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductPermanently
} = require('../controllers/product.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas públicas
router.get('/public', getPublicProducts);

// Rutas protegidas (requieren autenticación)
router.get('/', authMiddleware, getAllProducts);
router.get('/:id', authMiddleware, getProductById);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.delete('/:id/permanent', authMiddleware, deleteProductPermanently);

module.exports = router;