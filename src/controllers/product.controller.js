const Product = require('../models/Product');
const { productValidation, productUpdateValidation } = require('../validations/product.validation');

// Obtener todos los productos (públicos - solo activos)
const getPublicProducts = async (req, res) => {
  try {
    const products = await Product.find({ activo: true }).sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      data: products 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener productos',
      error: error.message 
    });
  }
};

// Obtener categorías únicas (público)
const getCategories = async (req, res) => {
  try {
    const pipeline = [
      { $match: { activo: true, categoria: { $exists: true, $ne: '' } } },
      { $project: { categoria: { $trim: { input: '$categoria' } } } },
      { $group: { _id: { $toLower: '$categoria' }, name: { $first: '$categoria' }, count: { $sum: 1 } } },
      { $sort: { count: -1, name: 1 } },
      { $project: { _id: 0, category: '$name', slug: '$_id', count: 1 } }
    ];

    const categories = await Product.aggregate(pipeline);

    res.json({ success: true, data: categories || [] });
  } catch (error) {
    console.error('Error getCategories:', error);
    res.status(500).json({ success: false, message: 'Error al obtener categorías', error: error.message });
  }
};

// Obtener productos por categoría (público)
const getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ categoria: category, activo: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener productos por categoría', error: error.message });
  }
};

// Obtener todos los productos (admin - todos)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
    res.json({ 
      success: true,
      data: products 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener productos',
      error: error.message 
    });
  }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Producto no encontrado' 
      });
    }

    res.json({ 
      success: true,
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al obtener producto',
      error: error.message 
    });
  }
};

// Crear producto
const createProduct = async (req, res) => {
  try {
    // Validar datos con validación completa (todos los campos requeridos)
    const { error } = productValidation(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: error.details[0].message 
      });
    }

    const product = new Product(req.body);
    await product.save();

    res.status(201).json({ 
      success: true,
      message: 'Producto creado correctamente',
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al crear producto',
      error: error.message 
    });
  }
};

// Actualizar producto
const updateProduct = async (req, res) => {
  try {
    // Usar validación de UPDATE (campos opcionales)
    const { error } = productUpdateValidation(req.body);
    if (error) {
      return res.status(400).json({ 
        success: false,
        message: error.details[0].message 
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Producto no encontrado' 
      });
    }

    res.json({ 
      success: true,
      message: 'Producto actualizado correctamente',
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al actualizar producto',
      error: error.message 
    });
  }
};

// Eliminar producto (baja lógica - cambia activo a false)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Producto no encontrado' 
      });
    }

    res.json({ 
      success: true,
      message: 'Producto desactivado correctamente',
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al desactivar producto',
      error: error.message 
    });
  }
};

// Eliminar producto permanentemente (baja física)
const deleteProductPermanently = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Producto no encontrado' 
      });
    }

    res.json({ 
      success: true,
      message: 'Producto eliminado permanentemente' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al eliminar producto',
      error: error.message 
    });
  }
};

// Toggle estado activo del producto
const toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Producto no encontrado' 
      });
    }

    product.activo = !product.activo;
    await product.save();

    res.json({ 
      success: true,
      message: `Producto ${product.activo ? 'activado' : 'desactivado'} correctamente`,
      data: product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error al cambiar estado del producto',
      error: error.message 
    });
  }
};

module.exports = {
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
};