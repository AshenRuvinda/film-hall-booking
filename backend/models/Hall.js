// backend/models/Hall.js - FIXED VERSION
const mongoose = require('mongoose');

const seatBlockSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Block A", "Block B"
  rows: { type: Number, required: true, min: 1 }, // Number of rows in this block
  seatsPerRow: { type: Number, required: true, min: 1 }, // Seats per row
  startRow: { type: String, required: true }, // Starting row letter (A, B, C, etc.)
  position: {
    x: { type: Number, required: true, default: 0 }, // X coordinate for layout
    y: { type: Number, required: true, default: 0 }  // Y coordinate for layout
  }
});

const boxSeatSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Box 1", "Box 2"
  capacity: { type: Number, required: true, min: 1 }, // Number of seats in this box
  position: {
    x: { type: Number, required: true, default: 0 },
    y: { type: Number, required: true, default: 0 }
  },
  price: { type: Number, default: 0 } // Premium pricing for box seats
});

const hallSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  location: { 
    type: String, 
    required: true,
    trim: true 
  }, // e.g., "Ground Floor", "Second Floor - East Wing"
  
  // Basic seat information (calculated automatically)
  totalSeats: { type: Number, default: 0 },
  
  // Regular seat blocks
  seatBlocks: {
    type: [seatBlockSchema],
    validate: {
      validator: function(blocks) {
        return Array.isArray(blocks) && blocks.length > 0;
      },
      message: 'At least one seat block is required'
    }
  },
  
  // Box seats (premium seating at the back)
  boxSeats: {
    type: [boxSeatSchema],
    default: []
  },
  
  // Hall dimensions and layout
  dimensions: {
    width: { type: Number, required: true, min: 1 }, // in meters
    height: { type: Number, required: true, min: 1 }, // in meters
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
    regular: { type: Number, default: 10, min: 0 }, // Regular seat price
    box: { type: Number, default: 25, min: 0 }      // Box seat price
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

// Calculate total seats automatically before saving
hallSchema.pre('save', function(next) {
  try {
    this.updatedAt = new Date();
    
    // Calculate regular seats
    let regularSeats = 0;
    if (this.seatBlocks && Array.isArray(this.seatBlocks)) {
      regularSeats = this.seatBlocks.reduce((total, block) => {
        const rows = parseInt(block.rows) || 0;
        const seatsPerRow = parseInt(block.seatsPerRow) || 0;
        return total + (rows * seatsPerRow);
      }, 0);
    }
    
    // Calculate box seats
    let boxSeatsTotal = 0;
    if (this.boxSeats && Array.isArray(this.boxSeats)) {
      boxSeatsTotal = this.boxSeats.reduce((total, box) => {
        const capacity = parseInt(box.capacity) || 0;
        return total + capacity;
      }, 0);
    }
    
    this.totalSeats = regularSeats + boxSeatsTotal;
    console.log(`Hall ${this.name}: Regular seats: ${regularSeats}, Box seats: ${boxSeatsTotal}, Total: ${this.totalSeats}`);
    
    next();
  } catch (error) {
    console.error('Pre-save error:', error);
    next(error);
  }
});

// Update middleware for findOneAndUpdate
hallSchema.pre('findOneAndUpdate', function(next) {
  try {
    const update = this.getUpdate();
    
    // Set updatedAt
    if (update.$set) {
      update.$set.updatedAt = new Date();
    } else {
      update.updatedAt = new Date();
    }
    
    // If seatBlocks or boxSeats are being updated, recalculate totalSeats
    if (update.seatBlocks || update.boxSeats || update.$set?.seatBlocks || update.$set?.boxSeats) {
      const seatBlocks = update.seatBlocks || update.$set?.seatBlocks || [];
      const boxSeats = update.boxSeats || update.$set?.boxSeats || [];
      
      // Calculate regular seats
      const regularSeats = seatBlocks.reduce((total, block) => {
        const rows = parseInt(block.rows) || 0;
        const seatsPerRow = parseInt(block.seatsPerRow) || 0;
        return total + (rows * seatsPerRow);
      }, 0);
      
      // Calculate box seats
      const boxSeatsTotal = boxSeats.reduce((total, box) => {
        const capacity = parseInt(box.capacity) || 0;
        return total + capacity;
      }, 0);
      
      const totalSeats = regularSeats + boxSeatsTotal;
      
      if (update.$set) {
        update.$set.totalSeats = totalSeats;
      } else {
        update.totalSeats = totalSeats;
      }
      
      console.log(`Update: Regular seats: ${regularSeats}, Box seats: ${boxSeatsTotal}, Total: ${totalSeats}`);
    }
    
    next();
  } catch (error) {
    console.error('Pre-findOneAndUpdate error:', error);
    next(error);
  }
});

// Add indexes for better performance
hallSchema.index({ name: 1 });
hallSchema.index({ location: 1 });
hallSchema.index({ status: 1 });

// Virtual for getting regular seats count
hallSchema.virtual('regularSeatsCount').get(function() {
  if (!this.seatBlocks || !Array.isArray(this.seatBlocks)) return 0;
  return this.seatBlocks.reduce((total, block) => {
    return total + ((block.rows || 0) * (block.seatsPerRow || 0));
  }, 0);
});

// Virtual for getting box seats count
hallSchema.virtual('boxSeatsCount').get(function() {
  if (!this.boxSeats || !Array.isArray(this.boxSeats)) return 0;
  return this.boxSeats.reduce((total, box) => {
    return total + (box.capacity || 0);
  }, 0);
});

// Ensure virtuals are included in JSON output
hallSchema.set('toJSON', { virtuals: true });
hallSchema.set('toObject', { virtuals: true });

// Custom validation for seat blocks
hallSchema.path('seatBlocks').validate(function(seatBlocks) {
  if (!Array.isArray(seatBlocks) || seatBlocks.length === 0) {
    return false;
  }
  
  for (const block of seatBlocks) {
    if (!block.name || !block.rows || !block.seatsPerRow) {
      return false;
    }
    if (block.rows <= 0 || block.seatsPerRow <= 0) {
      return false;
    }
  }
  
  return true;
}, 'At least one valid seat block is required');

// Custom validation for dimensions
hallSchema.path('dimensions.width').validate(function(value) {
  return value > 0;
}, 'Width must be greater than 0');

hallSchema.path('dimensions.height').validate(function(value) {
  return value > 0;
}, 'Height must be greater than 0');

module.exports = mongoose.model('Hall', hallSchema);