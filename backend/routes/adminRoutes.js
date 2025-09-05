// backend/routes/adminRoutes.js - ENHANCED WITH HALL MANAGEMENT
const express = require('express');
const { 
  addMovie, 
  updateMovie, 
  deleteMovie, 
  getHalls,
  addHall, 
  updateHall,
  deleteHall,
  getShowtimes,
  addShowtime, 
  getReports 
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(requireRole('admin'));

// Movie management
router.post('/movies', addMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

// Enhanced Hall management
router.get('/halls', getHalls);
router.post('/halls', addHall);
router.put('/halls/:id', updateHall);
router.delete('/halls/:id', deleteHall);

// Showtime management
router.get('/showtimes', getShowtimes);
router.post('/showtimes', addShowtime);

// Reports
router.get('/reports', getReports);

module.exports = router;