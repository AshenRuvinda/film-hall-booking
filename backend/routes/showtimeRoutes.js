const express = require('express');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');
const Hall = require('../models/Hall');
const router = express.Router();

// GET /api/showtimes - Get all showtimes
router.get('/', async (req, res) => {
  try {
    console.log('📡 Fetching all showtimes');
    
    const showtimes = await Showtime.find()
      .populate('movieId', 'title genre duration poster')
      .populate('hallId', 'name totalSeats type')
      .sort({ startTime: 1 });
    
    console.log(`✅ Found ${showtimes.length} showtimes`);
    
    res.json(showtimes);
    
  } catch (error) {
    console.error('💥 Error fetching showtimes:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching showtimes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/showtimes/movie/:movieId - Get showtimes for a specific movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    console.log('📡 Fetching showtimes for movie ID:', movieId);
    
    // Find showtimes for the movie, populate movie and hall details
    const showtimes = await Showtime.find({ 
      movieId: movieId,
      // Optionally filter future showtimes only
      startTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Include shows from last 24h
    })
    .populate('movieId', 'title genre duration poster') // Populate movie details
    .populate('hallId', 'name totalSeats type') // Populate hall details
    .sort({ startTime: 1 }); // Sort by start time
    
    console.log(`✅ Found ${showtimes.length} showtimes for movie`);
    
    // Return the showtimes array directly (your frontend expects this format)
    res.json(showtimes);
    
  } catch (error) {
    console.error('💥 Error fetching showtimes:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching showtimes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/showtimes/:id - Get specific showtime by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📡 Fetching showtime with ID:', id);
    
    const showtime = await Showtime.findById(id)
      .populate('movieId', 'title genre duration poster')
      .populate('hallId', 'name totalSeats type layout');
    
    if (!showtime) {
      console.log('❌ Showtime not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Showtime not found' 
      });
    }
    
    console.log('✅ Showtime found:', showtime.startTime);
    
    res.json(showtime);
    
  } catch (error) {
    console.error('💥 Error fetching showtime:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid showtime ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching showtime',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;