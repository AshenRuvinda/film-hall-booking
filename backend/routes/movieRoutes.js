const express = require('express');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const router = express.Router();

// GET /api/movies - Get all movies (public)
router.get('/', async (req, res) => {
  try {
    console.log('📡 Fetching all movies');
    const movies = await Movie.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${movies.length} movies`);
    
    res.json({
      success: true,
      data: movies,
      count: movies.length
    });
  } catch (error) {
    console.error('💥 Error fetching movies:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching movies',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/movies/:id - Get movie by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('📡 Fetching movie with ID:', id);
    
    // Find movie by ID
    const movie = await Movie.findById(id);
    
    if (!movie) {
      console.log('❌ Movie not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Movie not found' 
      });
    }
    
    console.log('✅ Movie found:', movie.title);
    
    // Return the movie data directly (your frontend expects this format)
    res.json(movie);
    
  } catch (error) {
    console.error('💥 Error fetching movie:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid movie ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching movie',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;