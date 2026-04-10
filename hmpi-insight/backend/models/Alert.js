const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['contamination', 'threshold_exceeded', 'prediction_warning', 'system'],
    required: true
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  location: {
    district: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contaminationData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContaminationData'
  },
  affectedMetals: [{
    metal: String,
    concentration: Number,
    limit: Number,
    exceedanceRatio: Number
  }],
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notificationMethod: {
      type: String,
      enum: ['email', 'sms', 'dashboard', 'push']
    },
    sentAt: Date,
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'read'],
      default: 'pending'
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  acknowledgedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acknowledgedAt: Date,
    notes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: Date,
  metadata: {
    hmpiValue: Number,
    category: String,
    predictedTrend: String,
    recommendedActions: [String]
  }
});

// Index for efficient queries
alertSchema.index({ createdAt: -1 });
alertSchema.index({ 'location.district': 1, severity: 1 });
alertSchema.index({ isActive: 1, severity: 1 });

module.exports = mongoose.model('Alert', alertSchema);
