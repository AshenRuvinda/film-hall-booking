// backend/routes/userRoutes.js - COMPLETE UPDATED VERSION
const express = require('express');
const { 
  getMovies, 
  getMovieById,
  getShowtimeById,    // NEW
  getShowtimeSeats,   // NEW
  getSeats,
  bookTicket, 
  getBookings,
  getBookingById
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/movies', getMovies);
router.get('/movies/:id', getMovieById);
router.get('/seats/:showtimeId', getSeats);

// NEW ROUTES for SeatSelection component
router.get('/showtimes/:id', getShowtimeById);           // Get showtime details
router.get('/showtimes/:id/seats', getShowtimeSeats);    // Get booked seats for showtime

// Protected routes
router.post('/bookings', authMiddleware, bookTicket);    // Changed from /book to /bookings
router.post('/book', authMiddleware, bookTicket);        // Keep old route for backward compatibility
router.get('/bookings', authMiddleware, getBookings);
router.get('/bookings/:bookingId', authMiddleware, getBookingById);

module.exports = router;