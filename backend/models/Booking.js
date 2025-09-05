// backend/models/Booking.js - FIXED VERSION
const mongoose = require('mongoose');

// Define seat info schema for embedded seat data
const seatInfoSchema = new mongoose.Schema({
  seatId: { type: String, required: true }, // e.g., "Block 1-A1", "Box 1-1"
  seatType: { 
    type: String, 
    enum: ['regular', 'box'], 
    default: 'regular' 
  },
  price: { type: Number, required: true, min: 0 }
}, { _id: false }); // Don't create separate _id for seat info objects

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  
  // Updated seats field to handle the new seat selection format
  seats: {
    type: [seatInfoSchema],
    required: true,
    validate: {
      validator: function(seats) {
        return Array.isArray(seats) && seats.length > 0;
      },
      message: 'At least one seat is required'
    }
  },
  
  totalPrice: { type: Number, required: true, min: 0 },
  
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'checked-in', 'cancelled'], 
    default: 'confirmed' 
  },
  
  qrCode: { type: String }, // Base64 encoded QR code data URL
  checkedInAt: { type: Date }, // Timestamp when checked in
  checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Operator who checked in
  
  // Payment related fields (for future use)
  paymentMethod: { 
    type: String,
    enum: ['cash', 'card', 'online', 'wallet'],
    default: 'online'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better query performance
bookingSchema.index({ showtimeId: 1, status: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ status: 1, createdAt: -1 });
bookingSchema.index({ 'seats.seatId': 1 });

// Virtual to get seat count
bookingSchema.virtual('seatCount').get(function() {
  return this.seats ? this.seats.length : 0;
});

// Virtual to get seat IDs as array (for backward compatibility)
bookingSchema.virtual('seatIds').get(function() {
  return this.seats ? this.seats.map(seat => seat.seatId) : [];
});

// Method to check if booking contains a specific seat
bookingSchema.methods.hasSeat = function(seatId) {
  return this.seats.some(seat => seat.seatId === seatId);
};

// Method to get total seats by type
bookingSchema.methods.getSeatsByType = function(seatType) {
  return this.seats.filter(seat => seat.seatType === seatType);
};

// Static method to find conflicting bookings
bookingSchema.statics.findConflictingBookings = function(showtimeId, seatIds) {
  return this.find({
    showtimeId: showtimeId,
    status: { $in: ['confirmed', 'pending', 'checked-in'] },
    'seats.seatId': { $in: seatIds }
  });
};

// Ensure virtuals are included in JSON output
bookingSchema.set('toJSON', { virtuals: true });
bookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', bookingSchema);