// backend/controllers/userController.js - COMPLETE FIXED VERSION
const Movie = require('../models/Movie');
const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Showtime = require('../models/Showtime');
const Hall = require('../models/Hall');
const QRCode = require('qrcode');

exports.getMovies = async (req, res) => {
  try {
    console.log('Fetching movies...');
    const movies = await Movie.find().sort({ createdAt: -1 });
    console.log(`Found ${movies.length} movies`);
    res.json(movies);
  } catch (error) {
    console.error('Get movies error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

exports.getMovieById = async (req, res) => {
  try {
    console.log(`Fetching movie with ID: ${req.params.id}`);
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      console.log('Movie not found');
      return res.status(404).json({ msg: 'Movie not found' });
    }
    
    // Get showtimes for this movie
    const showtimes = await Showtime.find({ movieId: movie._id })
      .populate('hallId', 'name totalSeats')
      .sort({ startTime: 1 });
    
    console.log(`Found ${showtimes.length} showtimes for movie`);
    
    const movieWithShowtimes = {
      ...movie.toObject(),
      showtimes
    };
    
    res.json(movieWithShowtimes);
  } catch (error) {
    console.error('Get movie by ID error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

exports.getSeats = async (req, res) => {
  const { showtimeId } = req.params;
  try {
    console.log(`Fetching seats for showtime: ${showtimeId}`);
    
    const showtime = await Showtime.findById(showtimeId).populate('hallId');
    if (!showtime) {
      return res.status(404).json({ msg: 'Showtime not found' });
    }

    // Find or create seats for this hall
    let seats = await Seat.find({ hallId: showtime.hallId._id });
    
    // If no seats exist, create them
    if (seats.length === 0) {
      console.log('Creating seats for hall...');
      const hall = showtime.hallId;
      const seatData = [];
      
      // Create seats (e.g., rows A-J, seats 1-10)
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const seatsPerRow = Math.ceil(hall.totalSeats / rows.length);
      
      for (let i = 0; i < rows.length; i++) {
        for (let j = 1; j <= seatsPerRow && seatData.length < hall.totalSeats; j++) {
          seatData.push({
            hallId: hall._id,
            seatNumber: `${rows[i]}${j}`,
            type: 'normal',
            isBooked: false
          });
        }
      }
      
      seats = await Seat.insertMany(seatData);
      console.log(`Created ${seats.length} seats`);
    }

    // Check which seats are booked for this showtime
    const bookedSeats = await Booking.find({ 
      showtimeId,
      status: { $ne: 'cancelled' }
    }).populate('seats');
    
    const bookedSeatIds = bookedSeats.flatMap(booking => 
      booking.seats.map(seat => seat._id.toString())
    );

    const seatsWithStatus = seats.map(seat => ({
      ...seat.toObject(),
      isBooked: bookedSeatIds.includes(seat._id.toString())
    }));

    console.log(`Returning ${seatsWithStatus.length} seats, ${bookedSeatIds.length} booked`);
    res.json(seatsWithStatus);
  } catch (error) {
    console.error('Get seats error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

exports.bookTicket = async (req, res) => {
  const { showtimeId, seats } = req.body;
  
  if (!req.session.user) {
    return res.status(401).json({ msg: 'Please log in to book tickets' });
  }

  try {
    console.log(`Booking attempt by user ${req.session.user.email} for showtime ${showtimeId}`);
    
    // Validate input
    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ msg: 'Invalid booking data' });
    }

    // Validate showtime exists
    const showtime = await Showtime.findById(showtimeId)
      .populate('movieId', 'title')
      .populate('hallId', 'name');
      
    if (!showtime) {
      return res.status(404).json({ msg: 'Showtime not found' });
    }

    // Check if seats exist and are valid
    const seatDocs = await Seat.find({ _id: { $in: seats } });
    if (seatDocs.length !== seats.length) {
      return res.status(400).json({ msg: 'Some seats not found' });
    }

    // Check if any seats are already booked for this showtime
    const existingBookings = await Booking.find({
      showtimeId,
      seats: { $in: seats },
      status: { $ne: 'cancelled' }
    });

    if (existingBookings.length > 0) {
      return res.status(400).json({ msg: 'Some seats are already booked' });
    }

    const totalPrice = seats.length * 10; // $10 per seat
    const qrData = `booking:${showtimeId}:${seats.join(',')}`;
    const qrCode = await QRCode.toDataURL(qrData);

    const booking = new Booking({
      userId: req.session.user.id,
      showtimeId,
      seats,
      totalPrice,
      qrCode,
      status: 'confirmed'
    });

    await booking.save();
    await booking.populate([
      { path: 'showtimeId', populate: { path: 'movieId hallId' } },
      { path: 'seats' }
    ]);

    console.log(`Booking created successfully: ${booking._id}`);
    res.json({ msg: 'Booking successful', booking });
  } catch (error) {
    console.error('Book ticket error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ msg: 'Please log in to view bookings' });
  }

  try {
    console.log(`Fetching bookings for user: ${req.session.user.email}`);
    
    const bookings = await Booking.find({ userId: req.session.user.id })
      .populate({
        path: 'showtimeId',
        populate: {
          path: 'movieId hallId'
        }
      })
      .populate('seats')
      .sort({ createdAt: -1 });

    console.log(`Found ${bookings.length} bookings`);
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ msg: 'Please log in to view booking' });
  }

  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      userId: req.session.user.id
    })
    .populate({
      path: 'showtimeId',
      populate: {
        path: 'movieId hallId'
      }
    })
    .populate('seats');

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};