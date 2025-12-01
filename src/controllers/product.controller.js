const Product = require('../models/Product');
const { productValidation } = require('../validations/product.validation');

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
    const categories = await Product.distinct('categoria', { activo: true });
    res.json({ success: true, data: categories });
  } catch (error) {
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
    // Validar datos
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
    // Validar datos
    const { error } = productValidation(req.body);
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

// Eliminar producto (baja lógica)
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

module.exports = {
  getPublicProducts,
  getAllProducts,
  getProductById,
  getCategories,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductPermanently
};