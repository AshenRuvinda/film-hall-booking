const mongoose = require('mongoose');

const ShowtimeSchema = new mongoose.Schema({
  movie_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
  hall_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Hall', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true }, // e.g., '10:00 AM'
});

module.exports = mongoose.model('Showtime', ShowtimeSchema);