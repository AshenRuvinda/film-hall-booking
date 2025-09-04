const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  poster_url: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  genre: { type: String, required: true },
});

module.exports = mongoose.model('Movie', MovieSchema);