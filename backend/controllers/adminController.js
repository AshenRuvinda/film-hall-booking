// backend/controllers/adminController.js - COMPLETE UPDATED VERSION
const Movie = require('../models/Movie');
const Hall = require('../models/Hall');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access denied. Admin role required.' });
  }
  next();
};

// Movie management functions
exports.addMovie = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const { title, description, poster, duration, genre } = req.body;
  
  if (!title || !duration) {
    return res.status(400).json({ msg: 'Title and duration are required' });
  }

  try {
    console.log('Adding new movie:', { title, duration, genre });
    
    const movie = new Movie({ 
      title: title.trim(), 
      description: description?.trim() || '', 
      poster, 
      duration: parseInt(duration), 
      genre: genre?.trim() || '' 
    });
    
    await movie.save();
    console.log('Movie added successfully:', movie._id);
    
    res.json({ msg: 'Movie added successfully', movie });
  } catch (error) {
    console.error('Add movie error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        msg: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateMovie = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const { title, description, poster, duration, genre } = req.body;
  
  try {
    console.log('Updating movie:', req.params.id);
    
    const updateData = {};
    if (title) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (poster !== undefined) updateData.poster = poster;
    if (duration) updateData.duration = parseInt(duration);
    if (genre !== undefined) updateData.genre = genre.trim();
    
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    
    console.log('Movie updated successfully:', movie._id);
    res.json({ msg: 'Movie updated successfully', movie });
  } catch (error) {
    console.error('Update movie error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        msg: 'Validation error', 
        details: Object.values(error.errors).map(err => err.message).join(', ')
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid movie ID format' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteMovie = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    console.log('Deleting movie:', req.params.id);
    
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    
    // Delete associated showtimes
    const deletedShowtimes = await Showtime.deleteMany({ movieId: req.params.id });
    console.log(`Deleted ${deletedShowtimes.deletedCount} associated showtimes`);
    
    console.log('Movie deleted successfully:', movie._id);
    res.json({ msg: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Delete movie error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid movie ID format' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
};

// Enhanced Hall Management
exports.getHalls = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    console.log('Fetching all halls for admin');
    
    const halls = await Hall.find().sort({ location: 1, name: 1 });
    
    console.log(`Found ${halls.length} halls`);
    res.json(halls);
  } catch (error) {
    console.error('Get halls error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.addHall = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const { 
    name, 
    location, 
    seatBlocks, 
    boxSeats, 
    dimensions,
    features,
    pricing 
  } = req.body;
  
  if (!name || !location || !seatBlocks || !dimensions) {
    return res.status(400).json({ 
      msg: 'Name, location, seat blocks, and dimensions are required' 
    });
  }

  try {
    console.log('Adding new hall:', name);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    // Check if hall name already exists
    const existingHall = await Hall.findOne({ name: name.trim() });
    if (existingHall) {
      return res.status(400).json({ msg: 'Hall with this name already exists' });
    }

    // Validate seat blocks
    if (!Array.isArray(seatBlocks) || seatBlocks.length === 0) {
      return res.status(400).json({ msg: 'At least one seat block is required' });
    }

    for (const block of seatBlocks) {
      if (!block.name || !block.rows || !block.seatsPerRow) {
        return res.status(400).json({ 
          msg: 'Each seat block must have name, rows, and seatsPerRow' 
        });
      }
      if (block.rows <= 0 || block.seatsPerRow <= 0) {
        return res.status(400).json({ 
          msg: 'Rows and seats per row must be positive numbers' 
        });
      }
    }

    // Validate dimensions
    if (!dimensions.width || !dimensions.height || dimensions.width <= 0 || dimensions.height <= 0) {
      return res.status(400).json({ msg: 'Valid dimensions are required' });
    }

    // Process seat blocks with row letters
    const processedSeatBlocks = seatBlocks.map((block, index) => {
      const startRowCode = 65 + (index * parseInt(block.rows)); // A=65, B=66, etc.
      const startRow = String.fromCharCode(Math.min(startRowCode, 90)); // Don't go past 'Z'
      
      return {
        name: block.name.trim(),
        rows: parseInt(block.rows),
        seatsPerRow: parseInt(block.seatsPerRow),
        startRow,
        position: block.position || { x: index * 100, y: 100 }
      };
    });

    // Process box seats with default positioning
    const processedBoxSeats = (boxSeats || []).map((box, index) => ({
      name: box.name.trim(),
      capacity: parseInt(box.capacity),
      position: box.position || { 
        x: index * 150 + 100, 
        y: parseFloat(dimensions.height) - 50 
      },
      price: parseFloat(box.price) || 0
    }));

    const hall = new Hall({
      name: name.trim(),
      location: location.trim(),
      seatBlocks: processedSeatBlocks,
      boxSeats: processedBoxSeats,
      dimensions: {
        width: parseFloat(dimensions.width),
        height: parseFloat(dimensions.height),
        screenPosition: dimensions.screenPosition || 'front'
      },
      features: Array.isArray(features) ? features : [],
      pricing: {
        regular: pricing?.regular ? parseFloat(pricing.regular) : 10,
        box: pricing?.box ? parseFloat(pricing.box) : 25
      }
    });

    await hall.save();
    console.log('Hall created successfully:', hall._id, 'Total seats:', hall.totalSeats);
    
    res.json({ msg: 'Hall created successfully', hall });
  } catch (error) {
    console.error('Add hall error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        msg: 'Validation error', 
        details: errors.join(', ')
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ msg: 'Hall name must be unique' });
    }
    
    res.status(500).json({ 
      msg: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

exports.updateHall = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    const { 
      name, 
      location, 
      seatBlocks, 
      boxSeats, 
      dimensions,
      features,
      pricing,
      status 
    } = req.body;

    console.log('Updating hall with ID:', req.params.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ msg: 'Hall not found' });
    }

    // Check if new name conflicts with existing halls (excluding current hall)
    if (name && name !== hall.name) {
      const existingHall = await Hall.findOne({ 
        name: name.trim(), 
        _id: { $ne: req.params.id } 
      });
      if (existingHall) {
        return res.status(400).json({ msg: 'Hall with this name already exists' });
      }
    }

    // Validate required fields
    if (name && !name.trim()) {
      return res.status(400).json({ msg: 'Hall name is required' });
    }

    if (location && !location.trim()) {
      return res.status(400).json({ msg: 'Location is required' });
    }

    // Validate seat blocks if provided
    if (seatBlocks && Array.isArray(seatBlocks)) {
      if (seatBlocks.length === 0) {
        return res.status(400).json({ msg: 'At least one seat block is required' });
      }
      
      for (const block of seatBlocks) {
        if (!block.name || !block.rows || !block.seatsPerRow) {
          return res.status(400).json({ 
            msg: 'Each seat block must have name, rows, and seatsPerRow' 
          });
        }
        if (block.rows <= 0 || block.seatsPerRow <= 0) {
          return res.status(400).json({ 
            msg: 'Rows and seats per row must be positive numbers' 
          });
        }
      }
    }

    // Validate box seats if provided
    if (boxSeats && Array.isArray(boxSeats)) {
      for (const box of boxSeats) {
        if (!box.name || !box.capacity) {
          return res.status(400).json({ 
            msg: 'Each box seat must have name and capacity' 
          });
        }
        if (box.capacity <= 0) {
          return res.status(400).json({ 
            msg: 'Box capacity must be a positive number' 
          });
        }
      }
    }

    // Validate dimensions if provided
    if (dimensions) {
      if (dimensions.width && dimensions.width <= 0) {
        return res.status(400).json({ msg: 'Width must be a positive number' });
      }
      if (dimensions.height && dimensions.height <= 0) {
        return res.status(400).json({ msg: 'Height must be a positive number' });
      }
    }

    // Build update object - only include fields that are provided
    const updateData = {};

    if (name) updateData.name = name.trim();
    if (location) updateData.location = location.trim();
    if (status) updateData.status = status;

    // Handle seat blocks with proper processing
    if (seatBlocks && Array.isArray(seatBlocks)) {
      updateData.seatBlocks = seatBlocks.map((block, index) => {
        const startRowCode = 65 + (index * parseInt(block.rows));
        const startRow = String.fromCharCode(Math.min(startRowCode, 90)); // Don't go past 'Z'
        
        return {
          name: block.name.trim(),
          rows: parseInt(block.rows),
          seatsPerRow: parseInt(block.seatsPerRow),
          startRow,
          position: block.position || { x: index * 100, y: 100 }
        };
      });
    }

    // Handle box seats
    if (boxSeats && Array.isArray(boxSeats)) {
      updateData.boxSeats = boxSeats.map((box, index) => ({
        name: box.name.trim(),
        capacity: parseInt(box.capacity),
        position: box.position || { 
          x: index * 150 + 100, 
          y: (dimensions?.height || hall.dimensions?.height || 300) - 50 
        },
        price: parseFloat(box.price) || 0
      }));
    }

    // Handle dimensions
    if (dimensions) {
      updateData.dimensions = {
        width: dimensions.width ? parseFloat(dimensions.width) : hall.dimensions?.width,
        height: dimensions.height ? parseFloat(dimensions.height) : hall.dimensions?.height,
        screenPosition: dimensions.screenPosition || hall.dimensions?.screenPosition || 'front'
      };
    }

    // Handle features
    if (features && Array.isArray(features)) {
      updateData.features = features;
    }

    // Handle pricing
    if (pricing) {
      updateData.pricing = {
        regular: pricing.regular ? parseFloat(pricing.regular) : hall.pricing?.regular || 10,
        box: pricing.box ? parseFloat(pricing.box) : hall.pricing?.box || 25
      };
    }

    // Set updatedAt
    updateData.updatedAt = new Date();

    console.log('Update data:', JSON.stringify(updateData, null, 2));

    // Perform the update
    const updatedHall = await Hall.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        useFindAndModify: false
      }
    );

    if (!updatedHall) {
      return res.status(404).json({ msg: 'Hall not found after update' });
    }

    console.log('Hall updated successfully:', updatedHall._id, 'Total seats:', updatedHall.totalSeats);
    res.json({ msg: 'Hall updated successfully', hall: updatedHall });

  } catch (error) {
    console.error('Update hall error:', error);
    
    // Handle specific mongoose errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        msg: 'Validation error', 
        details: errors.join(', ')
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid hall ID format' });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ msg: 'Hall name must be unique' });
    }

    res.status(500).json({ 
      msg: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

exports.deleteHall = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    console.log('Deleting hall:', req.params.id);
    
    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ msg: 'Hall not found' });
    }

    // Check if hall has future showtimes
    const futureShowtimes = await Showtime.countDocuments({
      hallId: req.params.id,
      startTime: { $gte: new Date() }
    });

    if (futureShowtimes > 0) {
      return res.status(400).json({ 
        msg: `Cannot delete hall with ${futureShowtimes} scheduled future showtimes` 
      });
    }

    // Delete the hall and associated showtimes
    await Hall.findByIdAndDelete(req.params.id);
    const deletedShowtimes = await Showtime.deleteMany({ hallId: req.params.id });
    
    console.log(`Hall deleted successfully. Also deleted ${deletedShowtimes.deletedCount} past showtimes.`);
    res.json({ msg: 'Hall deleted successfully' });
  } catch (error) {
    console.error('Delete hall error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid hall ID format' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
};

// Showtime management
exports.getShowtimes = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    console.log('Fetching all showtimes for admin');
    
    const showtimes = await Showtime.find()
      .populate('movieId', 'title duration genre')
      .populate('hallId', 'name location totalSeats')
      .sort({ startTime: 1 });
    
    console.log(`Found ${showtimes.length} showtimes`);
    res.json(showtimes);
  } catch (error) {
    console.error('Get showtimes error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.addShowtime = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const { movieId, hallId, startTime } = req.body;
  
  if (!movieId || !hallId || !startTime) {
    return res.status(400).json({ msg: 'Movie, hall, and start time are required' });
  }

  try {
    console.log('Adding new showtime:', { movieId, hallId, startTime });
    
    const movie = await Movie.findById(movieId);
    const hall = await Hall.findById(hallId);
    
    if (!movie) return res.status(404).json({ msg: 'Movie not found' });
    if (!hall) return res.status(404).json({ msg: 'Hall not found' });
    
    if (hall.status !== 'active') {
      return res.status(400).json({ msg: 'Hall is not active and cannot be scheduled' });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + (movie.duration * 60000)); // duration in minutes

    // Check for conflicting showtimes in the same hall
    const conflictingShowtime = await Showtime.findOne({
      hallId,
      $or: [
        { 
          startTime: { $lt: end }, 
          endTime: { $gt: start } 
        }
      ]
    });

    if (conflictingShowtime) {
      await conflictingShowtime.populate(['movieId', 'hallId']);
      return res.status(400).json({ 
        msg: `Hall is not available at this time. Conflicts with "${conflictingShowtime.movieId.title}" from ${conflictingShowtime.startTime.toLocaleString()} to ${conflictingShowtime.endTime.toLocaleString()}` 
      });
    }

    const showtime = new Showtime({
      movieId,
      hallId,
      startTime: start,
      endTime: end
    });

    await showtime.save();
    await showtime.populate([
      { path: 'movieId', select: 'title duration genre' },
      { path: 'hallId', select: 'name location totalSeats' }
    ]);
    
    console.log('Showtime created successfully:', showtime._id);
    res.json({ msg: 'Showtime created successfully', showtime });
  } catch (error) {
    console.error('Add showtime error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        msg: 'Validation error', 
        details: errors.join(', ')
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid movie or hall ID format' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateShowtime = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const { movieId, hallId, startTime } = req.body;

  try {
    console.log('Updating showtime:', req.params.id);
    
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ msg: 'Showtime not found' });
    }

    // Check if there are existing bookings
    const existingBookings = await Booking.countDocuments({
      showtimeId: req.params.id,
      status: { $ne: 'cancelled' }
    });

    if (existingBookings > 0) {
      return res.status(400).json({ 
        msg: `Cannot update showtime with ${existingBookings} existing bookings` 
      });
    }

    const updateData = {};
    
    if (movieId) {
      const movie = await Movie.findById(movieId);
      if (!movie) return res.status(404).json({ msg: 'Movie not found' });
      updateData.movieId = movieId;
    }

    if (hallId) {
      const hall = await Hall.findById(hallId);
      if (!hall) return res.status(404).json({ msg: 'Hall not found' });
      if (hall.status !== 'active') {
        return res.status(400).json({ msg: 'Hall is not active' });
      }
      updateData.hallId = hallId;
    }

    if (startTime) {
      const start = new Date(startTime);
      const movie = await Movie.findById(movieId || showtime.movieId);
      const end = new Date(start.getTime() + (movie.duration * 60000));
      
      // Check for conflicts (excluding current showtime)
      const conflictingShowtime = await Showtime.findOne({
        _id: { $ne: req.params.id },
        hallId: hallId || showtime.hallId,
        $or: [
          { 
            startTime: { $lt: end }, 
            endTime: { $gt: start } 
          }
        ]
      });

      if (conflictingShowtime) {
        return res.status(400).json({ 
          msg: 'Hall is not available at this time' 
        });
      }

      updateData.startTime = start;
      updateData.endTime = end;
    }

    const updatedShowtime = await Showtime.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'movieId', select: 'title duration genre' },
      { path: 'hallId', select: 'name location totalSeats' }
    ]);

    console.log('Showtime updated successfully:', updatedShowtime._id);
    res.json({ msg: 'Showtime updated successfully', showtime: updatedShowtime });
  } catch (error) {
    console.error('Update showtime error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        msg: 'Validation error', 
        details: errors.join(', ')
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid ID format' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteShowtime = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    console.log('Deleting showtime:', req.params.id);
    
    const showtime = await Showtime.findById(req.params.id);
    if (!showtime) {
      return res.status(404).json({ msg: 'Showtime not found' });
    }

    // Check if there are existing bookings
    const existingBookings = await Booking.countDocuments({
      showtimeId: req.params.id,
      status: { $ne: 'cancelled' }
    });

    if (existingBookings > 0) {
      return res.status(400).json({ 
        msg: `Cannot delete showtime with ${existingBookings} existing bookings. Cancel bookings first.` 
      });
    }

    await Showtime.findByIdAndDelete(req.params.id);
    
    console.log('Showtime deleted successfully');
    res.json({ msg: 'Showtime deleted successfully' });
  } catch (error) {
    console.error('Delete showtime error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid showtime ID format' });
    }
    
    res.status(500).json({ msg: 'Server error' });
  }
};

// Reports and Analytics
exports.getReports = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    console.log('Generating admin reports');
    
    // Get total bookings (excluding cancelled)
    const totalBookings = await Booking.countDocuments({ 
      status: { $ne: 'cancelled' } 
    });
    
    // Get total revenue
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Get popular movies
    const popularMovies = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      {
        $lookup: {
          from: 'showtimes',
          localField: 'showtimeId',
          foreignField: '_id',
          as: 'showtime'
        }
      },
      { $unwind: '$showtime' },
      {
        $lookup: {
          from: 'movies',
          localField: 'showtime.movieId',
          foreignField: '_id',
          as: 'movie'
        }
      },
      { $unwind: '$movie' },
      {
        $group: {
          _id: '$movie._id',
          title: { $first: '$movie.title' },
          genre: { $first: '$movie.genre' },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          totalSeats: { $sum: { $size: '$seats' } }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    // Get hall utilization
    const hallUtilization = await Hall.aggregate([
      {
        $lookup: {
          from: 'showtimes',
          localField: '_id',
          foreignField: 'hallId',
          as: 'showtimes'
        }
      },
      {
        $lookup: {
          from: 'bookings',
          let: { hallId: '$_id' },
          pipeline: [
            {
              $lookup: {
                from: 'showtimes',
                localField: 'showtimeId',
                foreignField: '_id',
                as: 'showtime'
              }
            },
            { $unwind: '$showtime' },
            { $match: { 
              $expr: { $eq: ['$showtime.hallId', '$$hallId'] },
              status: { $ne: 'cancelled' }
            }},
            { $group: { 
              _id: null, 
              totalBookedSeats: { $sum: { $size: '$seats' } },
              totalBookings: { $sum: 1 }
            }}
          ],
          as: 'bookingStats'
        }
      },
      {
        $project: {
          name: 1,
          location: 1,
          totalSeats: 1,
          status: 1,
          showtimeCount: { $size: '$showtimes' },
          totalBookedSeats: { 
            $ifNull: [{ $arrayElemAt: ['$bookingStats.totalBookedSeats', 0] }, 0] 
          },
          totalBookings: { 
            $ifNull: [{ $arrayElemAt: ['$bookingStats.totalBookings', 0] }, 0] 
          },
          utilizationRate: {
            $cond: [
              { $gt: [{ $size: '$showtimes' }, 0] },
              {
                $multiply: [
                  {
                    $divide: [
                      { $ifNull: [{ $arrayElemAt: ['$bookingStats.totalBookedSeats', 0] }, 0] },
                      { $multiply: ['$totalSeats', { $size: '$showtimes' }] }
                    ]
                  },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { utilizationRate: -1 } }
    ]);

    // Get recent bookings for activity feed
    const recentBookings = await Booking.find({ 
      status: { $ne: 'cancelled' } 
    })
    .populate('userId', 'name email')
    .populate({
      path: 'showtimeId',
      populate: [
        { path: 'movieId', select: 'title' },
        { path: 'hallId', select: 'name' }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(10);

    // Get booking trends (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const bookingTrends = await Booking.aggregate([
      { 
        $match: { 
          createdAt: { $gte: weekAgo },
          status: { $ne: 'cancelled' }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          seats: { $sum: { $size: '$seats' } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Booking.aggregate([
      { 
        $match: { 
          createdAt: { $gte: sixMonthsAgo },
          status: { $ne: 'cancelled' }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get status counts
    const statusCounts = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const reports = {
      overview: {
        totalBookings,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalHalls: await Hall.countDocuments(),
        totalMovies: await Movie.countDocuments(),
        totalShowtimes: await Showtime.countDocuments(),
        activeHalls: await Hall.countDocuments({ status: 'active' })
      },
      popularMovies,
      hallUtilization,
      recentBookings: recentBookings.map(booking => ({
        _id: booking._id,
        customerName: booking.userId?.name || 'Unknown',
        customerEmail: booking.userId?.email || 'Unknown',
        movieTitle: booking.showtimeId?.movieId?.title || 'Unknown Movie',
        hallName: booking.showtimeId?.hallId?.name || 'Unknown Hall',
        seatsCount: booking.seats?.length || 0,
        totalPrice: booking.totalPrice,
        status: booking.status,
        createdAt: booking.createdAt
      })),
      bookingTrends: bookingTrends.map(trend => ({
        date: `${trend._id.year}-${String(trend._id.month).padStart(2, '0')}-${String(trend._id.day).padStart(2, '0')}`,
        bookings: trend.bookings,
        revenue: Math.round(trend.revenue * 100) / 100,
        seats: trend.seats
      })),
      monthlyRevenue: monthlyRevenue.map(month => ({
        month: `${month._id.year}-${String(month._id.month).padStart(2, '0')}`,
        revenue: Math.round(month.revenue * 100) / 100,
        bookings: month.bookings
      })),
      statusCounts: statusCounts.reduce((acc, status) => {
        acc[status._id] = status.count;
        return acc;
      }, {})
    };

    console.log('Reports generated successfully');
    console.log('Overview:', reports.overview);
    
    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ 
      msg: 'Server error generating reports',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get all movies (for admin dropdown/selection)
exports.getMovies = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    console.log('Fetching all movies for admin');
    
    const movies = await Movie.find().sort({ title: 1 });
    
    console.log(`Found ${movies.length} movies`);
    res.json(movies);
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Bulk operations
exports.bulkDeleteShowtimes = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const { showtimeIds } = req.body;
  
  if (!Array.isArray(showtimeIds) || showtimeIds.length === 0) {
    return res.status(400).json({ msg: 'Showtime IDs array is required' });
  }

  try {
    console.log('Bulk deleting showtimes:', showtimeIds);
    
    // Check for existing bookings
    const bookingsCount = await Booking.countDocuments({
      showtimeId: { $in: showtimeIds },
      status: { $ne: 'cancelled' }
    });

    if (bookingsCount > 0) {
      return res.status(400).json({ 
        msg: `Cannot delete showtimes with ${bookingsCount} existing bookings` 
      });
    }

    const result = await Showtime.deleteMany({ _id: { $in: showtimeIds } });
    
    console.log(`Bulk deleted ${result.deletedCount} showtimes`);
    res.json({ 
      msg: `Successfully deleted ${result.deletedCount} showtimes`,
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Bulk delete showtimes error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Export middleware for use in routes
exports.checkAdmin = checkAdmin;