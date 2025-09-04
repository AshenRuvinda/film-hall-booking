// backend/controllers/adminController.js - ENHANCED VERSION
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
    
    // Also delete related showtimes
    await Showtime.deleteMany({ movieId: req.params.id });
    
    res.json({ msg: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getHalls = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    const halls = await Hall.find().sort({ name: 1 });
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

  const { name, totalSeats } = req.body;
  
  if (!name || !totalSeats) {
    return res.status(400).json({ msg: 'Name and total seats are required' });
  }

  try {
    const existingHall = await Hall.findOne({ name });
    if (existingHall) {
      return res.status(400).json({ msg: 'Hall with this name already exists' });
    }

    const hall = new Hall({ name, totalSeats });
    await hall.save();
    res.json({ msg: 'Hall created successfully', hall });
  } catch (error) {
    console.error('Add hall error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getShowtimes = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    const showtimes = await Showtime.find()
      .populate('movieId', 'title')
      .populate('hallId', 'name')
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
    // Verify movie and hall exist
    const movie = await Movie.findById(movieId);
    const hall = await Hall.findById(hallId);
    
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    if (!hall) {
      return res.status(404).json({ msg: 'Hall not found' });
    }

    // Calculate end time based on movie duration
    const start = new Date(startTime);
    const end = new Date(start.getTime() + (movie.duration * 60000)); // duration in minutes

    // Check for conflicting showtimes in the same hall
    const conflictingShowtime = await Showtime.findOne({
      hallId,
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
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

    res.json({
      totalBookings,
      totalRevenue: revenueResult[0]?.total || 0,
      popularMovies
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};