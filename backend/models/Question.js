const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Options are required'],
    validate: {
      validator: function(v) {
        return v.length >= 2 && v.length <= 6;
      },
      message: 'Question must have between 2 and 6 options'
    }
  },
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    validate: {
      validator: function(v) {
        return v >= 0 && v < this.options.length;
      },
      message: 'Correct answer index must be within options range'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['general', 'milk_products', 'nutrition', 'health', 'business', 'other'],
    default: 'general'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  explanation: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  collection: 'questions'
});

// Indexes for faster queries
questionSchema.index({ category: 1, isActive: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Question', questionSchema);

