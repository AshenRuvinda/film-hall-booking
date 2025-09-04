const Movie = require('../models/Movie');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const QRCode = require('qrcode');

exports.getMovies = async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.bookTicket = async (req, res) => {
  const { showtimeId, seats } = req.body;
  try {
    const seatDocs = await Seat.find({ _id: { $in: seats }, isBooked: false });
    if (seatDocs.length !== seats.length) return res.status(400).json({ msg: 'Some seats are already booked' });

    await Seat.updateMany({ _id: { $in: seats } }, { isBooked: true, showtimeId });

    const totalPrice = seats.length * 10; // Example pricing
    const qrCode = await QRCode.toDataURL(`booking:${showtimeId}:${seats.join(',')}`);

    const booking = new Booking({
      userId: req.session.user.id,
      showtimeId,
      seats,
      totalPrice,
      qrCode,
    });
    await booking.save();

    res.json({ msg: 'Booking successful', booking });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.session.user.id }).populate('showtimeId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};