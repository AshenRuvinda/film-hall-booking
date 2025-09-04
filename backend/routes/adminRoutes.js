// backend/routes/adminRoutes.js - ENHANCED VERSION
const express = require('express');
const { 
  addMovie, 
  updateMovie, 
  deleteMovie, 
  getHalls,
  addHall, 
  getShowtimes,
  addShowtime, 
  getReports 
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Movie management
router.post('/movies', authMiddleware, addMovie);
router.put('/movies/:id', authMiddleware, updateMovie);
router.delete('/movies/:id', authMiddleware, deleteMovie);

// Hall management
router.get('/halls', authMiddleware, getHalls);
router.post('/halls', authMiddleware, addHall);

// Showtime management
router.get('/showtimes', authMiddleware, getShowtimes);
router.post('/showtimes', authMiddleware, addShowtime);

// Reports
router.get('/reports', authMiddleware, getReports);

module.exports = router;