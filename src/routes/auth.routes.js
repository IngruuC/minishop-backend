const express = require('express');
const router = express.Router();
const passport = require('../config/passport.config');
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

// ==================== GOOGLE OAUTH ====================
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      // Generar JWT token
      const token = jwt.sign(
        { 
          id: req.user._id,
          email: req.user.email,
          rol: req.user.rol 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Redirigir al frontend con el token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Error en Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);

// ==================== FACEBOOK OAUTH ====================
router.get('/facebook',
  passport.authenticate('facebook', { 
    scope: ['email'],
    session: false
  })
);

router.get('/facebook/callback',
  passport.authenticate('facebook', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=facebook_auth_failed`,
    session: false
  }),
  (req, res) => {
    try {
      // Generar JWT token
      const token = jwt.sign(
        { 
          id: req.user._id,
          email: req.user.email,
          rol: req.user.rol 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Redirigir al frontend con el token
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('Error en Facebook callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
  }
);
module.exports = router;