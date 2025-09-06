// backend/controllers/operatorController.js - FIXED VERSION
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Hall = require('../models/Hall');
const User = require('../models/User');

exports.scanTicket = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    console.log('Scan ticket request received:', { qrData });
    
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

    // Validate ObjectId format
    if (!showtimeId || !showtimeId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid showtime ID format' });
    }

    // Find booking by showtime and seats
    let booking;
    
    try {
      if (seatsData) {
        // If seats data is provided, find by showtime and seats
        const seatIds = seatsData.split(',').map(s => s.trim()).filter(s => s);
        
        booking = await Booking.findOne({
          showtimeId: showtimeId,
          $or: [
            { 'seats.seatId': { $in: seatIds } },
            { 'seats.seatNumber': { $in: seatIds } }
          ],
          status: { $ne: 'cancelled' }
        })
        .populate({
          path: 'showtimeId',
          populate: [
            { path: 'movieId', select: 'title genre duration' },
            { path: 'hallId', select: 'name totalSeats' }
          ]
        })
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
        .populate('userId', 'name email');
      }
    } catch (populateError) {
      console.error('Database query error:', populateError);
      return res.status(500).json({ error: 'Database query failed' });
    }

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or has been cancelled' });
    }

    // Check if showtime exists and is populated
    if (!booking.showtimeId) {
      console.error('Showtime not found for booking:', booking._id);
      return res.status(404).json({ error: 'Associated showtime not found' });
    }

    // Check if the showtime has already passed
    const now = new Date();
    const showtime = booking.showtimeId;
    
    if (showtime.endTime && now > new Date(showtime.endTime)) {
      return res.status(400).json({ error: 'This showtime has already ended' });
    }

    // Check if it's too early to check in (more than 30 minutes before showtime)
    if (showtime.startTime) {
      const checkInWindow = new Date(new Date(showtime.startTime).getTime() - 30 * 60 * 1000); // 30 minutes before
      if (now < checkInWindow) {
        return res.status(400).json({ 
          error: `Check-in opens at ${checkInWindow.toLocaleTimeString()}` 
        });
      }
    }

    console.log('Booking found:', booking._id);
    res.json(booking);
    
  } catch (error) {
    console.error('Scan ticket error:', error);
    
    // Handle specific error types
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format in QR code' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    console.log('Check-in request for booking:', bookingId);
    
    if (!bookingId) {
      return res.status(400).json({ error: 'Booking ID is required' });
    }

    // Validate ObjectId format
    if (!bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }

    let booking;
    try {
      booking = await Booking.findById(bookingId)
        .populate({
          path: 'showtimeId',
          populate: [
            { path: 'movieId', select: 'title genre duration' },
            { path: 'hallId', select: 'name totalSeats' }
          ]
        })
        .populate('userId', 'name email');
    } catch (dbError) {
      console.error('Database query error:', dbError);
      return res.status(500).json({ error: 'Database query failed' });
    }
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'This booking has been cancelled' });
    }

    if (booking.status === 'checked-in') {
      return res.status(400).json({ error: 'Customer has already been checked in' });
    }

    // Check if showtime exists
    if (!booking.showtimeId) {
      return res.status(400).json({ error: 'Associated showtime not found' });
    }

    // Check if showtime is valid for check-in
    const now = new Date();
    const showtime = booking.showtimeId;
    
    if (showtime.endTime && now > new Date(showtime.endTime)) {
      return res.status(400).json({ error: 'This showtime has already ended' });
    }

    if (showtime.startTime) {
      const checkInWindow = new Date(new Date(showtime.startTime).getTime() - 30 * 60 * 1000);
      if (now < checkInWindow) {
        return res.status(400).json({ 
          error: `Check-in opens at ${checkInWindow.toLocaleTimeString()}` 
        });
      }
    }

    // Update booking status to checked-in
    booking.status = 'checked-in';
    booking.checkedInAt = now;
    
    // Optionally set who checked them in (operator)
    if (req.user && req.user.id) {
      booking.checkedInBy = req.user.id;
    }
    
    await booking.save();

    console.log(`Booking ${bookingId} checked in successfully`);
    res.json(booking);
    
  } catch (error) {
    console.error('Check-in error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid booking ID format' });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error during check-in' });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getBookingStats = async (req, res) => {
  try {
    console.log('Fetching booking stats...');
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Get today's bookings with error handling
    let todaysBookings = 0;
    try {
      todaysBookings = await Booking.countDocuments({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
        status: { $ne: 'cancelled' }
      });
    } catch (error) {
      console.error('Error counting today\'s bookings:', error);
    }

    // Get checked-in bookings today with error handling
    let checkedInToday = 0;
    try {
      checkedInToday = await Booking.countDocuments({
        checkedInAt: { $gte: startOfDay, $lt: endOfDay }
      });
    } catch (error) {
      console.error('Error counting checked-in bookings:', error);
    }

    // Get upcoming showtimes today with error handling
    let upcomingShowtimes = [];
    try {
      upcomingShowtimes = await Showtime.find({
        startTime: { $gte: today, $lt: endOfDay }
      })
      .populate('movieId', 'title')
      .populate('hallId', 'name')
      .sort({ startTime: 1 })
      .limit(5); // Next 5 showtimes
    } catch (error) {
      console.error('Error fetching upcoming showtimes:', error);
      upcomingShowtimes = [];
    }

    const stats = {
      todaysBookings,
      checkedInToday,
      upcomingShowtimes
    };
    
    console.log('Stats generated:', stats);
    res.json(stats);
    
  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.searchBooking = async (req, res) => {
  try {
    const { query } = req.query;
    
    console.log('Search booking request:', query);
    
    if (!query || query.length < 3) {
      return res.status(400).json({ error: 'Search query must be at least 3 characters' });
    }

    const searchQuery = query.trim();
    let bookings = [];

    try {
      // Search by booking ID (if it looks like an ObjectId)
      if (searchQuery.match(/^[0-9a-fA-F]{24}$/)) {
        const booking = await Booking.findById(searchQuery)
          .populate({
            path: 'showtimeId',
            populate: [
              { path: 'movieId', select: 'title' },
              { path: 'hallId', select: 'name' }
            ]
          })
          .populate('userId', 'name email');
          
        if (booking && booking.status !== 'cancelled') {
          bookings = [booking];
        }
      }
      
      // If no results from ID search, search by partial ID
      if (bookings.length === 0) {
        bookings = await Booking.find({
          _id: { $regex: searchQuery, $options: 'i' },
          status: { $ne: 'cancelled' }
        })
        .populate({
          path: 'showtimeId',
          populate: [
            { path: 'movieId', select: 'title' },
            { path: 'hallId', select: 'name' }
          ]
        })
        .populate('userId', 'name email')
        .limit(10)
        .sort({ createdAt: -1 });
      }

      // Also search by user details
      if (bookings.length < 10) {
        const userBookings = await User.find({
          $or: [
            { name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } }
          ]
        })
        .select('_id')
        .limit(20);

        if (userBookings.length > 0) {
          const userIds = userBookings.map(user => user._id);
          
          const additionalBookings = await Booking.find({
            userId: { $in: userIds },
            status: { $ne: 'cancelled' }
          })
          .populate({
            path: 'showtimeId',
            populate: [
              { path: 'movieId', select: 'title' },
              { path: 'hallId', select: 'name' }
            ]
          })
          .populate('userId', 'name email')
          .limit(10 - bookings.length)
          .sort({ createdAt: -1 });

          // Combine results and remove duplicates
          const existingIds = new Set(bookings.map(b => b._id.toString()));
          additionalBookings.forEach(booking => {
            if (!existingIds.has(booking._id.toString())) {
              bookings.push(booking);
            }
          });
        }
      }

      console.log(`Found ${bookings.length} bookings for query: ${searchQuery}`);
      res.json(bookings);
      
    } catch (dbError) {
      console.error('Database search error:', dbError);
      return res.status(500).json({ error: 'Database search failed' });
    }
    
  } catch (error) {
    console.error('Search booking error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};