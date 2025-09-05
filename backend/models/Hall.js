// backend/models/Hall.js - ENHANCED VERSION
const mongoose = require('mongoose');

const seatBlockSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Block A", "Block B"
  rows: { type: Number, required: true }, // Number of rows in this block
  seatsPerRow: { type: Number, required: true }, // Seats per row
  startRow: { type: String, required: true }, // Starting row letter (A, B, C, etc.)
  position: {
    x: { type: Number, required: true }, // X coordinate for layout
    y: { type: Number, required: true }  // Y coordinate for layout
  }
});

const boxSeatSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Box 1", "Box 2"
  capacity: { type: Number, required: true }, // Number of seats in this box
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  price: { type: Number, default: 0 } // Premium pricing for box seats
});

const hallSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  location: { 
    type: String, 
    required: true 
  }, // e.g., "Ground Floor", "Second Floor - East Wing"
  
  // Basic seat information
  totalSeats: { type: Number, required: true },
  
  // Regular seat blocks
  seatBlocks: [seatBlockSchema],
  
  // Box seats (premium seating at the back)
  boxSeats: [boxSeatSchema],
  
  // Hall dimensions and layout
  dimensions: {
    width: { type: Number, required: true }, // in meters
    height: { type: Number, required: true }, // in meters
    screenPosition: {
      type: String,
      enum: ['front', 'back', 'left', 'right'],
      default: 'front'
    }
  },
  
  // Additional features
  features: [{
    type: String,
    enum: [
      'air_conditioning', 
      'dolby_sound', 
      'imax', 
      '3d_capable', 
      'wheelchair_accessible',
      'reclining_seats',
      'food_service'
    ]
  }],
  
  // Pricing structure
  pricing: {
    regular: { type: Number, default: 10 }, // Regular seat price
    box: { type: Number, default: 25 }      // Box seat price
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'maintenance', 'inactive'],
    default: 'active'
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate total seats automatically
hallSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Calculate regular seats
  const regularSeats = this.seatBlocks.reduce((total, block) => {
    return total + (block.rows * block.seatsPerRow);
  }, 0);
  
  // Calculate box seats
  const boxSeatsTotal = this.boxSeats.reduce((total, box) => {
    return total + box.capacity;
  }, 0);
  
  this.totalSeats = regularSeats + boxSeatsTotal;
  next();
});

// Add indexes for better performance
hallSchema.index({ name: 1 });
hallSchema.index({ location: 1 });
hallSchema.index({ status: 1 });

// Virtual for getting regular seats count
hallSchema.virtual('regularSeatsCount').get(function() {
  return this.seatBlocks.reduce((total, block) => {
    return total + (block.rows * block.seatsPerRow);
  }, 0);
});

// Virtual for getting box seats count
hallSchema.virtual('boxSeatsCount').get(function() {
  return this.boxSeats.reduce((total, box) => {
    return total + box.capacity;
  }, 0);
});

// Ensure virtuals are included in JSON output
hallSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Hall', hallSchema);