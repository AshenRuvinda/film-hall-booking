// backend/controllers/operatorController.js - ENHANCED VERSION
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Hall = require('../models/Hall');
const User = require('../models/User');

exports.scanTicket = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ error: 'QR data is required' });
    }

    console.log('Scanning QR data:', qrData);
    
    // Parse QR data (expected format: "booking:showtimeId:seatIds")
    const parts = qrData.split(':');
    
    if (parts.length < 2) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }

    const [type, showtimeId, seatsData] = parts;
    
    if (type !== 'booking') {
      return res.status(400).json({ error: 'Invalid QR code type' });
    }

    // Find booking by showtime and seats
    let booking;
    
    if (seatsData) {
      // If seats data is provided, find by showtime and seats
      const seatIds = seatsData.split(',');
      booking = await Booking.findOne({
        showtimeId: showtimeId,
        seats: { $in: seatIds },
        status: { $ne: 'cancelled' }
      })
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title genre duration' },
          { path: 'hallId', select: 'name totalSeats' }
        ]
      })
      .populate('seats', 'seatNumber')
      .populate('userId', 'name email');
    } else {
      // If no seats data, try to find by showtime only
      booking = await Booking.findOne({
        showtimeId: showtimeId,
        status: { $ne: 'cancelled' }
      })
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title genre duration' },
          { path: 'hallId', select: 'name totalSeats' }
        ]
      })
      .populate('seats', 'seatNumber')
      .populate('userId', 'name email');
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or has been cancelled' });
    }

    // Check if the showtime has already passed
    const now = new Date();
    const showtime = booking.showtimeId;
    
    if (now > showtime.endTime) {
      return res.status(400).json({ error: 'This showtime has already ended' });
    }

    // Check if it's too early to check in (more than 30 minutes before showtime)
    const checkInWindow = new Date(showtime.startTime.getTime() - 30 * 60 * 1000); // 30 minutes before
    if (now < checkInWindow) {
      return res.status(400).json({ 
        error: `Check-in opens at ${checkInWindow.toLocaleTimeString()}` 
      });
    }

    console.log('Booking found:', booking._id);
    res.json(booking);
    
  } catch (error) {
    console.error('Scan ticket error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    const booking = await Booking.findById(bookingId)
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movieId', select: 'title genre duration' },
          { path: 'hallId', select: 'name totalSeats' }
        ]
      })
      .populate('seats', 'seatNumber')
      .populate('userId', 'name email');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'This booking has been cancelled' });
    }

    if (booking.status === 'checked-in') {
      return res.status(400).json({ error: 'Customer has already been checked in' });
    }

    // Check if showtime is valid for check-in
    const now = new Date();
    const showtime = booking.showtimeId;
    
    if (now > showtime.endTime) {
      return res.status(400).json({ error: 'This showtime has already ended' });
    }

    const checkInWindow = new Date(showtime.startTime.getTime() - 30 * 60 * 1000);
    if (now < checkInWindow) {
      return res.status(400).json({ 
        error: `Check-in opens at ${checkInWindow.toLocaleTimeString()}` 
      });
    }

    // Update booking status to checked-in
    booking.status = 'checked-in';
    booking.checkedInAt = now;
    await booking.save();

    console.log(`Booking ${bookingId} checked in successfully`);
    res.json(booking);
    
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getBookingStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Get today's bookings
    const todaysBookings = await Booking.find({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
      status: { $ne: 'cancelled' }
    });

    // Get checked-in bookings today
    const checkedInToday = await Booking.find({
      checkedInAt: { $gte: startOfDay, $lt: endOfDay }
    });

    // Get upcoming showtimes today
    const upcomingShowtimes = await Showtime.find({
      startTime: { $gte: today, $lt: endOfDay }
    })
    .populate('movieId', 'title')
    .populate('hallId', 'name')
    .sort({ startTime: 1 });

    res.json({
      todaysBookings: todaysBookings.length,
      checkedInToday: checkedInToday.length,
      upcomingShowtimes: upcomingShowtimes.slice(0, 5) // Next 5 showtimes
    });
    
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.searchBooking = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 3) {
      return res.status(400).json({ error: 'Search query must be at least 3 characters' });
    }

    // Search by booking ID, user name, or email
    const bookings = await Booking.find({
      $or: [
        { _id: { $regex: query, $options: 'i' } },
      ],
      status: { $ne: 'cancelled' }
    })
    .populate({
      path: 'showtimeId',
      populate: [
        { path: 'movieId', select: 'title' },
        { path: 'hallId', select: 'name' }
      ]
    })
    .populate('seats', 'seatNumber')
    .populate('userId', 'name email')
    .limit(10)
    .sort({ createdAt: -1 });

    // Also search by user details
    const userBookings = await Booking.find({
      status: { $ne: 'cancelled' }
    })
    .populate({
      path: 'userId',
      match: {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      },
      select: 'name email'
    })
    .populate({
      path: 'showtimeId',
      populate: [
        { path: 'movieId', select: 'title' },
        { path: 'hallId', select: 'name' }
      ]
    })
    .populate('seats', 'seatNumber')
    .limit(10)
    .sort({ createdAt: -1 });

    // Filter out bookings where user didn't match
    const filteredUserBookings = userBookings.filter(booking => booking.userId);

    // Combine and deduplicate results
    const allBookings = [...bookings, ...filteredUserBookings];
    const uniqueBookings = allBookings.filter((booking, index, self) => 
      index === self.findIndex(b => b._id.toString() === booking._id.toString())
    );

    res.json(uniqueBookings);
    
  } catch (error) {
    console.error('Search booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};