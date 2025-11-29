const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().min(3).max(50).required().messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede superar 50 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es obligatorio'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es obligatoria'
    })
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es obligatorio'
    }),
    password: Joi.string().required().messages({
      'any.required': 'La contraseña es obligatoria'
    })
  });

  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation
};