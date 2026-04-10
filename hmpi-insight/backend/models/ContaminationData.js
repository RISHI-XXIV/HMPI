const mongoose = require('mongoose');

const contaminationDataSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      pincode: String,
      district: String,
      state: String,
      locality: String
    }
  },
  sampleId: {
    type: String,
    required: true,
    unique: true
  },
  sampleDate: {
    type: Date,
    required: true
  },
  source: {
    type: String,
    enum: ['borewell', 'well', 'handpump', 'river', 'lake', 'other'],
    required: true
  },
  depth: {
    type: Number, // in meters
    min: 0
  },
  metalConcentrations: {
    lead: { type: Number, min: 0 },
    arsenic: { type: Number, min: 0 },
    mercury: { type: Number, min: 0 },
    cadmium: { type: Number, min: 0 },
    chromium: { type: Number, min: 0 },
    nickel: { type: Number, min: 0 },
    copper: { type: Number, min: 0 },
    zinc: { type: Number, min: 0 },
    iron: { type: Number, min: 0 },
    manganese: { type: Number, min: 0 }
  },
  hmpiResults: {
    hmpi: Number,
    category: {
      type: String,
      enum: ['Safe', 'Moderate', 'High', 'Critical']
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    exceededLimits: [{
      metal: String,
      concentration: Number,
      limit: Number,
      exceedanceRatio: Number
    }]
  },
  wqi: {
    value: Number,
    quality: String
  },
  additionalParameters: {
    pH: { type: Number, min: 0, max: 14 },
    temperature: Number,
    turbidity: Number,
    dissolvedOxygen: Number,
    conductivity: Number
  },
  weather: {
    season: {
      type: String,
      enum: ['summer', 'monsoon', 'winter', 'spring']
    },
    rainfall: Number,
    temperature: Number
  },
  industrialProximity: {
    nearestIndustry: String,
    distance: Number, // in km
    industryType: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index
contaminationDataSchema.index({ location: '2dsphere' });

// Create compound index for efficient queries
contaminationDataSchema.index({ 'location.address.district': 1, 'hmpiResults.category': 1 });
contaminationDataSchema.index({ sampleDate: -1 });
contaminationDataSchema.index({ 'hmpiResults.hmpi': -1 });

// Update timestamp on save
contaminationDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ContaminationData', contaminationDataSchema);
