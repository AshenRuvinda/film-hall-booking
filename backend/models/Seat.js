const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  showtime_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Showtime', required: true },
  seat_number: { type: String, required: true }, // e.g., 'A1'
  is_booked: { type: Boolean, default: false },
  booked_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Seat', SeatSchema);