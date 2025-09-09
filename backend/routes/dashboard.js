// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();

// Import models
const Movie = require('../models/Movie');
const Hall = require('../models/Hall');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const User = require('../models/User');

// Middleware to check if user is admin (optional - add if you want to protect these routes)
const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all movies
router.get('/movies', async (req, res) => {
  try {
    const movies = await Movie.find().select('title description poster duration genre createdAt');
    res.json(movies);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Get all halls
router.get('/halls', async (req, res) => {
  try {
    const halls = await Hall.find().select('name location totalSeats seatBlocks boxSeats status createdAt');
    res.json(halls);
  } catch (error) {
    console.error('Error fetching halls:', error);
    res.status(500).json({ error: 'Failed to fetch halls' });
  }
});

// Get all bookings with populated showtime data
router.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'showtimeId',
        select: 'movieId hallId startTime endTime',
        populate: [
          { path: 'movieId', select: 'title' },
          { path: 'hallId', select: 'name totalSeats' }
        ]
      })
      .populate('userId', 'name email')
      .select('seats totalPrice status createdAt updatedAt showtimeId userId')
      .sort({ createdAt: -1 })
      .limit(1000); // Limit for performance
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get all showtimes with populated movie and hall data
router.get('/showtimes', async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate('movieId', 'title duration')
      .populate('hallId', 'name totalSeats')
      .select('movieId hallId startTime endTime createdAt')
      .sort({ startTime: -1 })
      .limit(1000); // Limit for performance
    
    res.json(showtimes);
  } catch (error) {
    console.error('Error fetching showtimes:', error);
    res.status(500).json({ error: 'Failed to fetch showtimes' });
  }
});

// Get all users (excluding passwords)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(1000); // Limit for performance
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get dashboard statistics (optimized single endpoint)
router.get('/stats', async (req, res) => {
  try {
    console.log('Fetching dashboard statistics...');
    const now = new Date();
    
    // Get basic counts in parallel
    const [movieCount, hallCount, userCount] = await Promise.all([
      Movie.countDocuments(),
      Hall.countDocuments(), 
      User.countDocuments()
    ]);

    console.log(`Basic counts - Movies: ${movieCount}, Halls: ${hallCount}, Users: ${userCount}`);

    // Get booking data
    const bookings = await Booking.find()
      .select('totalPrice status createdAt seats')
      .sort({ createdAt: -1 })
      .limit(1000);

    console.log(`Found ${bookings.length} bookings`);

    const totalBookings = bookings.length;
    
    // Calculate revenue from confirmed and checked-in bookings
    const totalRevenue = bookings
      .filter(booking => ['confirmed', 'checked-in'].includes(booking.status))
      .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

    console.log(`Total revenue: $${totalRevenue}`);

    // Get active showtimes count
    const activeShowtimes = await Showtime.countDocuments({
      endTime: { $gt: now }
    });

    console.log(`Active showtimes: ${activeShowtimes}`);

    // Process bookings by date (last 7 days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString();
    });

    const bookingsByDate = {};
    const revenueByDate = {};
    
    last7Days.forEach(date => {
      bookingsByDate[date] = 0;
      revenueByDate[date] = 0;
    });

    bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt).toLocaleDateString();
      if (bookingsByDate.hasOwnProperty(bookingDate)) {
        bookingsByDate[bookingDate]++;
        if (['confirmed', 'checked-in'].includes(booking.status)) {
          revenueByDate[bookingDate] += booking.totalPrice || 0;
        }
      }
    });

    const bookingsData = last7Days.map(date => ({
      date: date.split('/').slice(0, 2).join('/'),
      bookings: bookingsByDate[date]
    }));

    const revenueData = last7Days.map(date => ({
      date: date.split('/').slice(0, 2).join('/'),
      revenue: revenueByDate[date]
    }));

    // Booking status distribution
    const statusCount = bookings.reduce((acc, booking) => {
      const status = booking.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const bookingStatusData = Object.entries(statusCount).map(([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      count,
      percentage: totalBookings > 0 ? ((count / totalBookings) * 100).toFixed(1) : '0'
    }));

    const responseData = {
      stats: {
        totalMovies: movieCount,
        totalHalls: hallCount,
        totalBookings,
        totalRevenue,
        activeShowtimes,
        totalUsers: userCount
      },
      bookingsData,
      revenueData,
      bookingStatusData
    };

    console.log('Dashboard stats calculated successfully');
    res.json(responseData);
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      details: error.message 
    });
  }
});

// Get recent activities (bonus endpoint)
router.get('/recent-activities', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate({
        path: 'showtimeId',
        populate: {
          path: 'movieId',
          select: 'title'
        }
      })
      .select('status createdAt totalPrice')
      .sort({ createdAt: -1 })
      .limit(limit);

    const activities = recentBookings.map(booking => ({
      id: booking._id,
      type: 'booking',
      description: `${booking.userId?.name || 'User'} booked ${booking.showtimeId?.movieId?.title || 'a movie'}`,
      amount: booking.totalPrice,
      status: booking.status,
      timestamp: booking.createdAt
    }));

    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

// Health check for dashboard
router.get('/dashboard/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Dashboard API is working',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/stats',
      'GET /api/movies', 
      'GET /api/halls',
      'GET /api/bookings',
      'GET /api/showtimes',
      'GET /api/users',
      'GET /api/recent-activities'
    ]
  });
});

module.exports = router;