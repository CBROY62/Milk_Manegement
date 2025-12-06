const mongoose = require('mongoose');

const franchiseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Franchise name is required'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active'],
    default: 'pending'
  },
  contractStartDate: {
    type: Date,
    default: null
  },
  contractEndDate: {
    type: Date,
    default: null
  },
  commissionRate: {
    type: Number,
    default: 10, // percentage
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  collection: 'franchises'
});

module.exports = mongoose.model('Franchise', franchiseSchema);

