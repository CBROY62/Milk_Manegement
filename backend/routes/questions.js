const express = require('express');
const { body, validationResult } = require('express-validator');
const Question = require('../models/Question');
const { authenticate } = require('../middleware/auth');
const { checkRole } = require('../middleware/roleCheck');

const router = express.Router();

// Get all questions (with filters)
router.get('/', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const { category, difficulty, search, isActive } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    let questions = await Question.find(query).sort({ createdAt: -1 });

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      questions = questions.filter(q => 
        q.questionText.match(searchRegex) ||
        q.explanation.match(searchRegex) ||
        q.tags.some(tag => tag.match(searchRegex))
      );
    }

    res.json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Get single question
router.get('/:id', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Create question (Admin only)
router.post('/', authenticate, checkRole('admin'), [
  body('questionText').trim().notEmpty().withMessage('Question text is required'),
  body('options').isArray({ min: 2, max: 6 }).withMessage('Question must have between 2 and 6 options'),
  body('options.*').trim().notEmpty().withMessage('Each option must not be empty'),
  body('correctAnswer').isInt({ min: 0 }).withMessage('Correct answer index must be a non-negative integer'),
  body('category').optional().isIn(['general', 'milk_products', 'nutrition', 'health', 'business', 'other']).withMessage('Invalid category'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  body('explanation').optional().trim(),
  body('tags').optional().isArray()
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

    const { questionText, options, correctAnswer, category, difficulty, explanation, tags, isActive } = req.body;

    // Validate correct answer index
    if (correctAnswer < 0 || correctAnswer >= options.length) {
      return res.status(400).json({
        success: false,
        message: 'Correct answer index is out of range'
      });
    }

    const question = new Question({
      questionText,
      options,
      correctAnswer,
      category: category || 'general',
      difficulty: difficulty || 'medium',
      explanation: explanation || '',
      tags: tags || [],
      isActive: isActive !== undefined ? isActive : true
    });

    await question.save();

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Update question (Admin only)
router.put('/:id', authenticate, checkRole('admin'), [
  body('questionText').optional().trim().notEmpty().withMessage('Question text cannot be empty'),
  body('options').optional().isArray({ min: 2, max: 6 }).withMessage('Question must have between 2 and 6 options'),
  body('options.*').optional().trim().notEmpty().withMessage('Each option must not be empty'),
  body('correctAnswer').optional().isInt({ min: 0 }).withMessage('Correct answer index must be a non-negative integer'),
  body('category').optional().isIn(['general', 'milk_products', 'nutrition', 'health', 'business', 'other']).withMessage('Invalid category'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level')
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

    const { options, correctAnswer } = req.body;

    // If updating options or correct answer, validate
    if (options && correctAnswer !== undefined) {
      if (correctAnswer < 0 || correctAnswer >= options.length) {
        return res.status(400).json({
          success: false,
          message: 'Correct answer index is out of range'
        });
      }
    } else if (options) {
      // If only updating options, check existing correct answer
      const existingQuestion = await Question.findById(req.params.id);
      if (existingQuestion && existingQuestion.correctAnswer >= options.length) {
        return res.status(400).json({
          success: false,
          message: 'Current correct answer index is out of range for new options'
        });
      }
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Delete question (Admin only)
router.delete('/:id', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.json({
      success: true,
      message: 'Question deleted successfully'
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

