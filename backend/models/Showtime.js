const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  hallId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Showtime', showtimeSchema);