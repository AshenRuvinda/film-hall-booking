// backend/routes/adminRoutes.js - ENHANCED WITH COMPLETE SHOWTIME CRUD
const express = require('express');
const { 
  addMovie, 
  updateMovie, 
  deleteMovie, 
  getMovies,
  getHalls,
  addHall, 
  updateHall,
  deleteHall,
  getShowtimes,
  addShowtime,
  updateShowtime,
  deleteShowtime,
  bulkDeleteShowtimes,
  getReports 
} = require('../controllers/adminController');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require admin role
router.use(requireRole('admin'));

// Movie management
router.get('/movies', getMovies);
router.post('/movies', addMovie);
router.put('/movies/:id', updateMovie);
router.delete('/movies/:id', deleteMovie);

// Enhanced Hall management
router.get('/halls', getHalls);
router.post('/halls', addHall);
router.put('/halls/:id', updateHall);
router.delete('/halls/:id', deleteHall);

// Complete Showtime management (CRUD)
router.get('/showtimes', getShowtimes);
router.post('/showtimes', addShowtime);
router.put('/showtimes/:id', updateShowtime);
router.delete('/showtimes/:id', deleteShowtime);

// Bulk operations
router.post('/showtimes/bulk-delete', bulkDeleteShowtimes);

// Reports and Analytics
router.get('/reports', getReports);

module.exports = router;