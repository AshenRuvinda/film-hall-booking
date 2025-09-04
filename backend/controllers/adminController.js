const Movie = require('../models/Movie');
const Hall = require('../models/Hall');
const Showtime = require('../models/Showtime');
const Booking = require('../models/Booking');

exports.addMovie = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const { title, description, poster, duration, genre } = req.body;
  try {
    const movie = new Movie({ title, description, poster, duration, genre });
    await movie.save();
    res.json({ msg: 'Movie added', movie });
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
      { new: true }
    );
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    res.json({ msg: 'Movie updated', movie });
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
    res.json({ msg: 'Movie deleted' });
  } catch (error) {
    console.error('Delete movie error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.manageHalls = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const { name, totalSeats } = req.body;
  try {
    const hall = new Hall({ name, totalSeats });
    await hall.save();
    res.json({ msg: 'Hall created', hall });
  } catch (error) {
    console.error('Manage halls error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.manageShowtimes = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  const { movieId, hallId, startTime, endTime } = req.body;
  try {
    const showtime = new Showtime({ movieId, hallId, startTime, endTime });
    await showtime.save();
    res.json({ msg: 'Showtime created', showtime });
  } catch (error) {
    console.error('Manage showtimes error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.getReports = async (req, res) => {
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Unauthorized' });
  }

  try {
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const popularMovies = await Booking.aggregate([
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
          bookings: { $sum: 1 }
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      popularMovies
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ msg: 'Server error' });
  }
};