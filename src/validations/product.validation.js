const Joi = require('joi');

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

module.exports = { productValidation };