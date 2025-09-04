const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  seatNumber: { type: String, required: true },
  type: { type: String, enum: ['normal', 'box'], default: 'normal' },
  isBooked: { type: Boolean, default: false },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Seat', seatSchema);