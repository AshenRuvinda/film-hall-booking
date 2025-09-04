// backend/routes/operatorRoutes.js - ENHANCED VERSION
const express = require('express');
const { 
  scanTicket, 
  checkIn, 
  getBookingStats,
  searchBooking 
} = require('../controllers/operatorController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// All operator routes require operator role
router.use(requireRole('operator'));

// Ticket scanning and check-in
router.post('/scan', scanTicket);
router.put('/check-in/:bookingId', checkIn);

// Dashboard stats
router.get('/stats', getBookingStats);

// Search bookings
router.get('/search', searchBooking);

module.exports = router;