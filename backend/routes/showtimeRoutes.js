// backend/routes/showtimeRoutes.js - UPDATED to include pricing
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
      .populate('hallId', 'name totalSeats pricing') // Include pricing
      .sort({ startTime: 1 });
    
    console.log(`✅ Found ${showtimes.length} showtimes`);
    
    // Add effective pricing to each showtime
    const showtimesWithPricing = showtimes.map(showtime => {
      const showtimeObj = showtime.toObject();
      
      // Calculate effective pricing (showtime override or hall default)
      let effectivePricing;
      if (showtime.pricing && (showtime.pricing.regular || showtime.pricing.box)) {
        effectivePricing = {
          regular: showtime.pricing.regular || showtime.hallId?.pricing?.regular || 10,
          box: showtime.pricing.box || showtime.hallId?.pricing?.box || 25
        };
      } else {
        effectivePricing = {
          regular: showtime.hallId?.pricing?.regular || 10,
          box: showtime.hallId?.pricing?.box || 25
        };
      }
      
      return {
        ...showtimeObj,
        pricing: effectivePricing,
        price: effectivePricing.regular // For backward compatibility
      };
    });
    
    res.json(showtimesWithPricing);
    
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
    
    // Find showtimes for the movie, populate movie and hall details WITH PRICING
    const showtimes = await Showtime.find({ 
      movieId: movieId,
      // Optionally filter future showtimes only
      startTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Include shows from last 24h
    })
    .populate('movieId', 'title genre duration poster') // Populate movie details
    .populate('hallId', 'name totalSeats pricing seatBlocks boxSeats') // Populate hall details WITH PRICING
    .sort({ startTime: 1 }); // Sort by start time
    
    console.log(`✅ Found ${showtimes.length} showtimes for movie`);
    
    // Add effective pricing to each showtime
    const showtimesWithPricing = showtimes.map(showtime => {
      const showtimeObj = showtime.toObject();
      
      // Calculate effective pricing (showtime override or hall default)
      let effectivePricing;
      if (showtime.pricing && (showtime.pricing.regular || showtime.pricing.box)) {
        // Use showtime-specific pricing if available
        effectivePricing = {
          regular: showtime.pricing.regular || showtime.hallId?.pricing?.regular || 10,
          box: showtime.pricing.box || showtime.hallId?.pricing?.box || 25
        };
        console.log(`Showtime ${showtime._id} has pricing override:`, effectivePricing);
      } else {
        // Use hall's default pricing
        effectivePricing = {
          regular: showtime.hallId?.pricing?.regular || 10,
          box: showtime.hallId?.pricing?.box || 25
        };
        console.log(`Showtime ${showtime._id} using hall pricing:`, effectivePricing);
      }
      
      return {
        ...showtimeObj,
        pricing: effectivePricing,
        price: effectivePricing.regular // For backward compatibility
      };
    });
    
    console.log('Returning showtimes with pricing data');
    res.json(showtimesWithPricing);
    
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
      .populate('hallId', 'name totalSeats pricing seatBlocks boxSeats');
    
    if (!showtime) {
      console.log('❌ Showtime not found:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Showtime not found' 
      });
    }
    
    console.log('✅ Showtime found:', showtime.startTime);
    
    // Add effective pricing
    const showtimeObj = showtime.toObject();
    let effectivePricing;
    
    if (showtime.pricing && (showtime.pricing.regular || showtime.pricing.box)) {
      effectivePricing = {
        regular: showtime.pricing.regular || showtime.hallId?.pricing?.regular || 10,
        box: showtime.pricing.box || showtime.hallId?.pricing?.box || 25
      };
    } else {
      effectivePricing = {
        regular: showtime.hallId?.pricing?.regular || 10,
        box: showtime.hallId?.pricing?.box || 25
      };
    }
    
    const responseData = {
      ...showtimeObj,
      pricing: effectivePricing,
      price: effectivePricing.regular
    };
    
    res.json(responseData);
    
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