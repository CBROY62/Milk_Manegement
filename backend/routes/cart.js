const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', authenticate, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
      await cart.save();
    }

    // Update pricing based on user type
    const itemsWithPricing = cart.items.map(item => {
      const itemObj = item.toObject();
      if (req.user.isB2B) {
        itemObj.product.currentPrice = itemObj.product.priceB2B;
        itemObj.product.pricingType = 'B2B';
      } else {
        itemObj.product.currentPrice = itemObj.product.priceB2C;
        itemObj.product.pricingType = 'B2C';
      }
      return itemObj;
    });

    res.json({
      success: true,
      data: {
        ...cart.toObject(),
        items: itemsWithPricing
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Add item to cart
router.post('/add', authenticate, [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

    const { productId, quantity } = req.body;

    // Get product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Determine price based on user type
    const price = req.user.isB2B ? product.priceB2B : product.priceB2C;

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].price = price;
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        price
      });
    }

    await cart.save();
    await cart.populate('items.product');

    // Update pricing based on user type (consistent with GET endpoint)
    const itemsWithPricing = cart.items.map(item => {
      const itemObj = item.toObject();
      if (req.user.isB2B) {
        itemObj.product.currentPrice = itemObj.product.priceB2B;
        itemObj.product.pricingType = 'B2B';
      } else {
        itemObj.product.currentPrice = itemObj.product.priceB2C;
        itemObj.product.pricingType = 'B2C';
      }
      return itemObj;
    });

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        ...cart.toObject(),
        items: itemsWithPricing
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update item quantity
router.put('/update/:productId', authenticate, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    // Check stock
    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');

    // Update pricing based on user type (consistent with GET endpoint)
    const itemsWithPricing = cart.items.map(item => {
      const itemObj = item.toObject();
      if (req.user.isB2B) {
        itemObj.product.currentPrice = itemObj.product.priceB2B;
        itemObj.product.pricingType = 'B2B';
      } else {
        itemObj.product.currentPrice = itemObj.product.priceB2C;
        itemObj.product.pricingType = 'B2C';
      }
      return itemObj;
    });

    res.json({
      success: true,
      message: 'Cart updated',
      data: {
        ...cart.toObject(),
        items: itemsWithPricing
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Remove item from cart
router.delete('/remove/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product');

    // Update pricing based on user type (consistent with GET endpoint)
    const itemsWithPricing = cart.items.map(item => {
      const itemObj = item.toObject();
      if (req.user.isB2B) {
        itemObj.product.currentPrice = itemObj.product.priceB2B;
        itemObj.product.pricingType = 'B2B';
      } else {
        itemObj.product.currentPrice = itemObj.product.priceB2C;
        itemObj.product.pricingType = 'B2C';
      }
      return itemObj;
    });

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        ...cart.toObject(),
        items: itemsWithPricing
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Clear cart
router.delete('/clear', authenticate, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared'
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

