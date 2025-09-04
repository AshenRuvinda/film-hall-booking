// backend/routes/userRoutes.js - COMPLETE FIXED VERSION
const express = require('express');
const { 
  getMovies, 
  getMovieById,
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

// Protected routes
router.post('/book', authMiddleware, bookTicket);
router.get('/bookings', authMiddleware, getBookings);
router.get('/bookings/:bookingId', authMiddleware, getBookingById);

module.exports = router;