const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  poster: { type: String }, // URL or path to poster image
  duration: { type: Number }, // in minutes
  genre: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Movie', movieSchema);