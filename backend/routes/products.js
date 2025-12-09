const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// Get all products (public - window shopping)
router.get('/', async (req, res) => {
  try {
    const { type, isB2B, variant } = req.query;
    const query = { isActive: true };

    if (type && (type === 'cow_milk' || type === 'buffalo_milk')) {
      query.type = type;
    }

    if (variant && ['full_cream', 'standardized', 'toned', 'double_toned', 'skimmed'].includes(variant)) {
      query.variant = variant;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    // Adjust pricing based on B2B/B2C
    const productsWithPricing = products.map(product => {
      const productObj = product.toObject();
      if (isB2B === 'true') {
        productObj.currentPrice = productObj.priceB2B;
        productObj.pricingType = 'B2B';
      } else {
        productObj.currentPrice = productObj.priceB2C;
        productObj.pricingType = 'B2C';
      }
      return productObj;
    });

    res.json({
      success: true,
      count: productsWithPricing.length,
      data: productsWithPricing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { isB2B } = req.query;
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const productObj = product.toObject();
    if (isB2B === 'true') {
      productObj.currentPrice = productObj.priceB2B;
      productObj.pricingType = 'B2B';
    } else {
      productObj.currentPrice = productObj.priceB2C;
      productObj.pricingType = 'B2C';
    }

    res.json({
      success: true,
      data: productObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create product (Admin only)
router.post('/', authenticate, checkRole('admin'), [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('type').isIn(['cow_milk', 'buffalo_milk']).withMessage('Invalid product type'),
  body('variant').optional().isIn(['full_cream', 'standardized', 'toned', 'double_toned', 'skimmed']).withMessage('Invalid product variant'),
  body('fatContent').optional().isFloat({ min: 0, max: 100 }).withMessage('Fat content must be between 0 and 100'),
  body('priceB2C').isFloat({ min: 0 }).withMessage('B2C price must be a positive number'),
  body('priceB2B').isFloat({ min: 0 }).withMessage('B2B price must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const product = new Product(req.body);
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update product (Admin only)
router.put('/:id', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete product (Admin only)
router.delete('/:id', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;

