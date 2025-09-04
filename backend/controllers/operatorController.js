const Booking = require('../models/Booking');
const QRCode = require('qrcode');

exports.scanTicket = async (req, res) => {
  const { qrData } = req.body; // Assume qrData is the decoded string
  try {
    const booking = await Booking.findById(qrData.bookingId).populate('showtime_id');
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.checkIn = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findByIdAndUpdate(bookingId, { checked_in: true }, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};