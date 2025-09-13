// backend/models/Showtime.js - UPDATED with optional pricing override
const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  
  // Optional pricing override - if not provided, uses hall's default pricing
  pricing: {
    regular: { type: Number, min: 0 }, // Override regular seat price for this showtime
    box: { type: Number, min: 0 }      // Override box seat price for this showtime
  },
  
  // Status for the showtime
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  
  // Additional showtime-specific settings
  specialOffers: [{
    type: String,
    enum: ['student_discount', 'senior_discount', 'matinee', 'group_discount']
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
showtimeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual to get effective pricing (showtime override or hall default)
showtimeSchema.virtual('effectivePricing').get(function() {
  // If showtime has pricing override, use it
  if (this.pricing && (this.pricing.regular || this.pricing.box)) {
    return {
      regular: this.pricing.regular || this.populated('hallId')?.pricing?.regular || 10,
      box: this.pricing.box || this.populated('hallId')?.pricing?.box || 25
    };
  }
  
  // Otherwise use hall's default pricing
  if (this.populated('hallId') && this.populated('hallId').pricing) {
    return this.populated('hallId').pricing;
  }
  
  // Fallback to default pricing
  return {
    regular: 10,
    box: 25
  };
});

// Add indexes for better performance
showtimeSchema.index({ movieId: 1, startTime: 1 });
showtimeSchema.index({ hallId: 1, startTime: 1 });
showtimeSchema.index({ startTime: 1, status: 1 });

// Ensure virtuals are included in JSON output
showtimeSchema.set('toJSON', { virtuals: true });
showtimeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Showtime', showtimeSchema);