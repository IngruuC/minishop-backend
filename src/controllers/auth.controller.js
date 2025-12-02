const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../validations/auth.validation');
const { sendResetPasswordEmail } = require('../config/email.config');

// Registrar usuario
const register = async (req, res) => {
  try {
    // Validar datos
    const { error } = registerValidation(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: error.details[0].message 
      });
    }

    const { nombre, email, password } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'El email ya está registrado' 
      });
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear usuario
    const user = new User({
      nombre,
      email,
      password: hashedPassword
    });

    await user.save();

    res.status(201).json({ 
      success: true,
      message: 'Usuario registrado correctamente',
      data: {
        id: user._id,
        nombre: user.nombre,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al registrar usuario',
      error: error.message 
    });
  }
};

// Login
const login = async (req, res) => {
  try {
    // Validar datos
    const { error } = loginValidation(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: error.details[0].message 
      });
    }

    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Email o contraseña incorrectos' 
      });
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(400).json({ 
        success: false,
        message: 'Usuario desactivado' 
      });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Email o contraseña incorrectos' 
      });
    }

    // Crear token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        rol: user.rol 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user._id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message 
    });
  }
};

// Verificar token
const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado' 
      });
    }

    res.json({ 
      success: true,
      data: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al verificar token',
      error: error.message 
    });
  }
};
// Solicitar recuperación de contraseña
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'El email es obligatorio'
      });
    }

    const user = await User.findOne({ email });

    // Por seguridad, siempre respondemos lo mismo aunque el usuario no exista
    if (!user) {
      return res.json({
        success: true,
        message: 'Si el email existe, recibirás un enlace de recuperación'
      });
    }

    // Generar token único
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash del token para guardarlo en BD
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Guardar token y expiración (1 hora)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    // Enviar email
    const emailResult = await sendResetPasswordEmail(email, resetToken);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Error al enviar el email de recuperación'
      });
    }

    res.json({
      success: true,
      message: 'Si el email existe, recibirás un enlace de recuperación'
    });

  } catch (error) {
    console.error('Error en forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
};

// Resetear contraseña
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña es obligatoria'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    // Hash del token recibido
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Buscar usuario con token válido y no expirado
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Limpiar token
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    
    await user.save();

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Error al resetear la contraseña',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  verifyToken,
  forgotPassword,
  resetPassword
};