const Movie = require('../models/Movie');
const Hall = require('../models/Hall');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');

exports.addMovie = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    await movie.save();
    res.status(201).json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.editMovie = async (req, res) => {
  const { id } = req.params;
  try {
    const movie = await Movie.findByIdAndUpdate(id, req.body, { new: true });
    res.json(movie);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteMovie = async (req, res) => {
  const { id } = req.params;
  try {
    await Movie.findByIdAndDelete(id);
    res.json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addHall = async (req, res) => {
  try {
    const hall = new Hall(req.body);
    await hall.save();
    res.status(201).json(hall);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.manageShowtimes = async (req, res) => {
  try {
    const showtime = new Showtime(req.body);
    await showtime.save();
    // Initialize seats for showtime
    const hall = await Hall.findById(req.body.hall_id);
    for (let i = 1; i <= hall.totalSeats; i++) {
      const seat = new Seat({ showtime_id: showtime._id, seat_number: `A${i}` });
      await seat.save();
    }
    res.status(201).json(showtime);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate('showtime_id user_id');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReports = async (req, res) => {
  // Simple revenue report
  try {
    const revenue = await Booking.aggregate([{ $group: { _id: null, total: { $sum: '$total_price' } } }]);
    res.json(revenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};