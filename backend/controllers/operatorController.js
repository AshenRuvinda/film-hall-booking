const Booking = require('../models/Booking');
const QRCode = require('qrcode');

exports.scanTicket = async (req, res) => {
  const { qrData } = req.body;
  try {
    // Parse QR data (format: "booking:showtimeId:seats")
    const parts = qrData.split(':');
    if (parts.length < 2) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }

    const showtimeId = parts[1];
    const seats = parts[2]?.split(',') || [];

    const booking = await Booking.findOne({ 
      showtimeId: showtimeId,
      seats: { $in: seats }
    }).populate('showtimeId');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (err) {
    console.error('Scan ticket error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.checkIn = async (req, res) => {
  const { bookingId } = req.params;
  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId, 
      { status: 'checked-in' }, 
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (err) {
    console.error('Check in error:', err);
    res.status(400).json({ error: err.message });
  }
};