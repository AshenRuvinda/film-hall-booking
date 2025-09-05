// backend/controllers/adminController.js - ENHANCED HALL MANAGEMENT
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

// Movie management functions (keep existing ones)
exports.addMovie = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const { title, description, poster, duration, genre } = req.body;
  
  if (!title || !duration) {
    return res.status(400).json({ msg: 'Title and duration are required' });
  }

  try {
    const movie = new Movie({ title, description, poster, duration, genre });
    await movie.save();
    res.json({ msg: 'Movie added successfully', movie });
  } catch (error) {
    console.error('Add movie error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateMovie = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const { title, description, poster, duration, genre } = req.body;
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { title, description, poster, duration, genre },
      { new: true, runValidators: true }
    );
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    res.json({ msg: 'Movie updated successfully', movie });
  } catch (error) {
    console.error('Update movie error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteMovie = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    
    await Showtime.deleteMany({ movieId: req.params.id });
    res.json({ msg: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Enhanced Hall Management
exports.getHalls = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    const halls = await Hall.find().sort({ location: 1, name: 1 });
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
    // Check if hall name already exists
    const existingHall = await Hall.findOne({ name });
    if (existingHall) {
      return res.status(400).json({ msg: 'Hall with this name already exists' });
    }

    // Validate seat blocks
    if (!Array.isArray(seatBlocks) || seatBlocks.length === 0) {
      return res.status(400).json({ msg: 'At least one seat block is required' });
    }

    // Validate dimensions
    if (!dimensions.width || !dimensions.height || dimensions.width <= 0 || dimensions.height <= 0) {
      return res.status(400).json({ msg: 'Valid dimensions are required' });
    }

    // Generate row letters for seat blocks
    const processedSeatBlocks = seatBlocks.map((block, index) => {
      const startRowCode = 65 + (index * block.rows); // A=65, B=66, etc.
      const startRow = String.fromCharCode(startRowCode);
      
      return {
        ...block,
        startRow,
        position: block.position || { x: index * 100, y: 100 }
      };
    });

    // Process box seats with default positioning at the back
    const processedBoxSeats = (boxSeats || []).map((box, index) => ({
      ...box,
      position: box.position || { 
        x: index * 150 + 100, 
        y: dimensions.height - 50 // Position at the back
      }
    }));

    const hall = new Hall({
      name: name.trim(),
      location: location.trim(),
      seatBlocks: processedSeatBlocks,
      boxSeats: processedBoxSeats,
      dimensions,
      features: features || [],
      pricing: {
        regular: pricing?.regular || 10,
        box: pricing?.box || 25
      }
    });

    await hall.save();
    res.json({ msg: 'Hall created successfully', hall });
  } catch (error) {
    console.error('Add hall error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        msg: 'Validation error', 
        details: error.message 
      });
    }
    res.status(500).json({ msg: 'Server error' });
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

    const hall = await Hall.findById(req.params.id);
    if (!hall) {
      return res.status(404).json({ msg: 'Hall not found' });
    }

    // Check if new name conflicts with existing halls
    if (name && name !== hall.name) {
      const existingHall = await Hall.findOne({ name, _id: { $ne: req.params.id } });
      if (existingHall) {
        return res.status(400).json({ msg: 'Hall with this name already exists' });
      }
    }

    // Update fields
    if (name) hall.name = name.trim();
    if (location) hall.location = location.trim();
    if (seatBlocks) hall.seatBlocks = seatBlocks;
    if (boxSeats) hall.boxSeats = boxSeats;
    if (dimensions) hall.dimensions = dimensions;
    if (features) hall.features = features;
    if (pricing) hall.pricing = pricing;
    if (status) hall.status = status;

    await hall.save();
    res.json({ msg: 'Hall updated successfully', hall });
  } catch (error) {
    console.error('Update hall error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.deleteHall = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
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
        msg: 'Cannot delete hall with scheduled showtimes' 
      });
    }

    await Hall.findByIdAndDelete(req.params.id);
    await Showtime.deleteMany({ hallId: req.params.id });
    
    res.json({ msg: 'Hall deleted successfully' });
  } catch (error) {
    console.error('Delete hall error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Showtime management (keep existing)
exports.getShowtimes = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    const showtimes = await Showtime.find()
      .populate('movieId', 'title')
      .populate('hallId', 'name location')
      .sort({ startTime: 1 });
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
    const movie = await Movie.findById(movieId);
    const hall = await Hall.findById(hallId);
    
    if (!movie) return res.status(404).json({ msg: 'Movie not found' });
    if (!hall) return res.status(404).json({ msg: 'Hall not found' });
    if (hall.status !== 'active') {
      return res.status(400).json({ msg: 'Hall is not active' });
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + (movie.duration * 60000));

    const conflictingShowtime = await Showtime.findOne({
      hallId,
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }]
    });

    if (conflictingShowtime) {
      return res.status(400).json({ msg: 'Hall is not available at this time' });
    }

    const showtime = new Showtime({
      movieId,
      hallId,
      startTime: start,
      endTime: end
    });

    await showtime.save();
    await showtime.populate(['movieId', 'hallId']);
    
    res.json({ msg: 'Showtime created successfully', showtime });
  } catch (error) {
    console.error('Add showtime error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Reports (keep existing)
exports.getReports = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    const totalBookings = await Booking.countDocuments({ status: { $ne: 'cancelled' } });
    
    const revenueResult = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

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
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 }
    ]);

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
        $project: {
          name: 1,
          location: 1,
          totalSeats: 1,
          showtimeCount: { $size: '$showtimes' }
        }
      },
      { $sort: { showtimeCount: -1 } }
    ]);

    res.json({
      totalBookings,
      totalRevenue: revenueResult[0]?.total || 0,
      popularMovies,
      hallUtilization
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};