const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerValidation, loginValidation } = require('../validations/auth.validation');

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

module.exports = {
  register,
  login,
  verifyToken
};