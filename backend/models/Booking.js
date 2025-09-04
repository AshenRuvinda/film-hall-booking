const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  showtime_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seats: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat' }],
  total_price: { type: Number, required: true },
  payment_method: { type: String, enum: ['card', 'pay_at_gate'], required: true },
  payment_status: { type: String, enum: ['pending', 'paid'], default: 'pending' },
  checked_in: { type: Boolean, default: false },
});

module.exports = mongoose.model('Booking', BookingSchema);