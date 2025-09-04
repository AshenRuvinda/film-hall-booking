const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showtimeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat' }],
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'checked-in'], default: 'pending' },
  qrCode: { type: String }, // URL or data for QR code
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);