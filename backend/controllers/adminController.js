const Movie = require('../models/Movie');
const Hall = require('../models/Hall');
const Showtime = require('../models/Showtime');

exports.addMovie = async (req, res) => {
  if (req.session.user.role !== 'admin') return res.status(403).json({ msg: 'Unauthorized' });

  const { title, description, poster, duration, genre } = req.body;
  try {
    const movie = new Movie({ title, description, poster, duration, genre });
    await movie.save();
    res.json({ msg: 'Movie added', movie });
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};

// Implement updateMovie, deleteMovie, manageHalls, manageShowtimes, getReports similarly