const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true
  },
  precio: {
    type: Number,
    required: true,
    min: 0
  },
  imagen: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  categoria: {
    type: String,
    default: 'General'
  },
  activo: {
    type: Boolean,
    default: true
  },
  // ==================== PROMOCIÓN ====================
  promocion: {
    activa: {
      type: Boolean,
      default: false
    },
    tipo: {
      type: String,
      enum: ['porcentaje', 'monto_fijo'],
      default: 'porcentaje'
    },
    valor: {
      type: Number,
      default: 0,
      min: 0
    },
    fechaInicio: {
      type: Date,
      default: null
    },
    fechaFin: {
      type: Date,
      default: null
    }
  }
}, {
  timestamps: true
});

// Virtual para calcular el precio con descuento
productSchema.virtual('precioConDescuento').get(function() {
  if (!this.promocion.activa) {
    return this.precio;
  }

  const ahora = new Date();
  const fechaInicio = this.promocion.fechaInicio;
  const fechaFin = this.promocion.fechaFin;

  // Verificar si la promoción está vigente
  if (fechaInicio && fechaFin && (ahora < fechaInicio || ahora > fechaFin)) {
    return this.precio;
  }

  // Calcular descuento
  if (this.promocion.tipo === 'porcentaje') {
    return Math.round(this.precio * (1 - this.promocion.valor / 100) * 100) / 100;
  } else {
    return Math.max(0, Math.round((this.precio - this.promocion.valor) * 100) / 100);
  }
});

// Virtual para verificar si la promoción está vigente
productSchema.virtual('promocionVigente').get(function() {
  if (!this.promocion.activa) {
    return false;
  }

  const ahora = new Date();
  const fechaInicio = this.promocion.fechaInicio;
  const fechaFin = this.promocion.fechaFin;

  if (!fechaInicio || !fechaFin) {
    return true; // Si no hay fechas, la promoción es indefinida
  }

  return ahora >= fechaInicio && ahora <= fechaFin;
});

// Incluir virtuals en JSON y Object
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);