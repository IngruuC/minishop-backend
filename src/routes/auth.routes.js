const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { 
  register, 
  login, 
  verifyToken,
  forgotPassword,
  resetPassword 
} = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Rutas protegidas
router.get('/verify', authMiddleware, verifyToken);

module.exports = router;