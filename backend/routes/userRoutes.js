// backend/routes/userRoutes.js - ENHANCED VERSION
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

router.get('/movies', getMovies);
router.get('/movies/:id', getMovieById);
router.get('/seats/:showtimeId', getSeats);
router.post('/book', authMiddleware, bookTicket);
router.get('/bookings', authMiddleware, getBookings);
router.get('/bookings/:bookingId', authMiddleware, getBookingById);

module.exports = router;