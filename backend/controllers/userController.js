const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');

exports.getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getShowtimes = async (req, res) => {
  const { movieId } = req.params;
  const currentDate = new Date();
  try {
    const showtimes = await Showtime.find({ movie_id: movieId, date: { $gte: currentDate } });
    res.json(showtimes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.bookSeats = async (req, res) => {
  const { showtimeId, seats, payment_method } = req.body;
  const userId = req.session.user.id;
  try {
    // Check if seats are available
    const availableSeats = await Seat.find({ showtime_id: showtimeId, seat_number: { $in: seats }, is_booked: false });
    if (availableSeats.length !== seats.length) return res.status(400).json({ error: 'Seats not available' });

    // Book seats
    await Seat.updateMany({ _id: { $in: availableSeats.map(s => s._id) } }, { is_booked: true, booked_by: userId });

    // Create booking
    const total_price = seats.length * 10; // Assume $10 per seat
    const booking = new Booking({ user_id: userId, showtime_id: showtimeId, seats: availableSeats.map(s => s._id), total_price, payment_method, payment_status: payment_method === 'card' ? 'paid' : 'pending' });
    await booking.save();
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  const userId = req.session.user.id;
  try {
    const bookings = await Booking.find({ user_id: userId }).populate('showtime_id');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};