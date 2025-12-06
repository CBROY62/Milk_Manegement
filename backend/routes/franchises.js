const express = require('express');
const { body, validationResult } = require('express-validator');
const Franchise = require('../models/Franchise');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// Apply for franchise
router.post('/apply', authenticate, [
  body('name').trim().notEmpty().withMessage('Franchise name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('Valid email is required')
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

    // Check if user already has a franchise
    const existingFranchise = await Franchise.findOne({ owner: req.user._id });
    if (existingFranchise) {
      return res.status(400).json({
        success: false,
        message: 'You already have a franchise application'
      });
    }

    const franchise = new Franchise({
      ...req.body,
      owner: req.user._id
    });

    await franchise.save();

    res.status(201).json({
      success: true,
      message: 'Franchise application submitted successfully',
      data: franchise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get user's franchise
router.get('/my-franchise', authenticate, async (req, res) => {
  try {
    const franchise = await Franchise.findOne({ owner: req.user._id })
      .populate('owner', 'name email phone');

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'No franchise found'
      });
    }

    res.json({
      success: true,
      data: franchise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get all franchises (Admin only)
router.get('/', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const franchises = await Franchise.find()
      .populate('owner', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: franchises.length,
      data: franchises
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update franchise status (Admin only)
router.put('/:id/status', authenticate, checkRole('admin'), [
  body('status').isIn(['pending', 'approved', 'rejected', 'active'])
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

    const { status } = req.body;
    const updateData = { status };

    if (status === 'approved' || status === 'active') {
      updateData.contractStartDate = new Date();
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year contract
      updateData.contractEndDate = endDate;
    }

    const franchise = await Franchise.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('owner', 'name email phone');

    if (!franchise) {
      return res.status(404).json({
        success: false,
        message: 'Franchise not found'
      });
    }

    res.json({
      success: true,
      message: 'Franchise status updated',
      data: franchise
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

