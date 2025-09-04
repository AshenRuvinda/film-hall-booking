const mongoose = require('mongoose');

const HallSchema = new mongoose.Schema({
  name: { type: String, required: true },
  totalSeats: { type: Number, required: true },
  boxSeats: { type: Number, required: true },
});

module.exports = mongoose.model('Hall', HallSchema);