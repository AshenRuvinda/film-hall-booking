// routes/publicRoutes.js
const express = require('express');
const Hall = require('../models/Hall');
const router = express.Router();

// Get all active theaters for public viewing
router.get('/halls', async (req, res) => {
  try {
    console.log('Fetching public halls...');
    
    const halls = await Hall.find({ 
      status: 'active' 
    }).select('name location totalSeats status features pricing dimensions seatBlocks boxSeats');
    
    console.log(`Retrieved ${halls.length} active theaters`);
    
    // Ensure consistent data structure
    const formattedHalls = halls.map(hall => ({
      _id: hall._id,
      name: hall.name || 'Unnamed Theater',
      location: hall.location || 'Location TBD',
      totalSeats: hall.totalSeats || 0,
      status: hall.status || 'active',
      features: Array.isArray(hall.features) ? hall.features : [],
      pricing: {
        regular: hall.pricing?.regular || 15,
        premium: hall.pricing?.premium || 20,
        box: hall.pricing?.box || 25
      },
      dimensions: {
        width: hall.dimensions?.width || 20,
        height: hall.dimensions?.height || 15
      },
      seatBlocks: Array.isArray(hall.seatBlocks) ? hall.seatBlocks : [],
      boxSeats: Array.isArray(hall.boxSeats) ? hall.boxSeats : []
    }));
    
    res.json(formattedHalls);
  } catch (error) {
    console.error('Error in public halls endpoint:', error);
    res.status(500).json({ 
      message: 'Unable to fetch theaters at this time',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Optional: Get specific hall details
router.get('/halls/:id', async (req, res) => {
  try {
    const hall = await Hall.findOne({ 
      _id: req.params.id, 
      status: 'active' 
    });
    
    if (!hall) {
      return res.status(404).json({ message: 'Theater not found' });
    }
    
    res.json(hall);
  } catch (error) {
    console.error('Error fetching hall details:', error);
    res.status(500).json({ message: 'Error fetching theater details' });
  }
});

module.exports = router;