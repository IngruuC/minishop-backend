const Joi = require('joi');

// Validación para CREAR producto (todos los campos obligatorios)
const productValidation = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().min(3).max(100).required().messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede superar 100 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
    descripcion: Joi.string().min(10).max(500).required().messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede superar 500 caracteres',
      'any.required': 'La descripción es obligatoria'
    }),
    precio: Joi.number().min(0).required().messages({
      'number.min': 'El precio no puede ser negativo',
      'any.required': 'El precio es obligatorio'
    }),
    imagen: Joi.string().uri().allow('').optional(),
    stock: Joi.number().min(0).required().messages({
      'number.min': 'El stock no puede ser negativo',
      'any.required': 'El stock es obligatorio'
    }),
    categoria: Joi.string().max(50).optional(),
    activo: Joi.boolean().optional()
  });

  return schema.validate(data);
};

// Validación para ACTUALIZAR producto (campos opcionales)
const productUpdateValidation = (data) => {
  const schema = Joi.object({
    nombre: Joi.string().min(3).max(100).messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede superar 100 caracteres'
    }),
    descripcion: Joi.string().min(10).max(500).messages({
      'string.min': 'La descripción debe tener al menos 10 caracteres',
      'string.max': 'La descripción no puede superar 500 caracteres'
    }),
    precio: Joi.number().min(0).messages({
      'number.min': 'El precio no puede ser negativo'
    }),
    imagen: Joi.string().uri().allow('').optional(),
    stock: Joi.number().min(0).messages({
      'number.min': 'El stock no puede ser negativo'
    }),
    categoria: Joi.string().max(50).allow('').optional(),
    activo: Joi.boolean().optional()
  }).min(1).messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar'
  });

  return schema.validate(data);
};

module.exports = { productValidation, productUpdateValidation };