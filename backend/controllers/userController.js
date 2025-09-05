// backend/controllers/userController.js - COMPLETE UPDATED VERSION
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

// NEW: Get showtime details with hall and movie info
exports.getShowtimeById = async (req, res) => {
  try {
    console.log(`Fetching showtime with ID: ${req.params.id}`);
    
    const showtime = await Showtime.findById(req.params.id)
      .populate('movieId')
      .populate('hallId');
    
    if (!showtime) {
      console.log('Showtime not found');
      return res.status(404).json({ msg: 'Showtime not found' });
    }

    // Format the response to match what the frontend expects
    const formattedShowtime = {
      _id: showtime._id,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      price: showtime.price || 10,
      movie: showtime.movieId,
      hall: showtime.hallId
    };

    console.log('Showtime found:', formattedShowtime);
    res.json(formattedShowtime);
  } catch (error) {
    console.error('Get showtime error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// NEW: Get booked seats for a specific showtime
exports.getShowtimeSeats = async (req, res) => {
  try {
    const showtimeId = req.params.id;
    console.log(`Fetching booked seats for showtime: ${showtimeId}`);
    
    // Find all confirmed bookings for this showtime
    const bookings = await Booking.find({ 
      showtimeId,
      status: { $in: ['confirmed', 'pending'] }
    }).populate('seats');

    // Extract all booked seat IDs
    const bookedSeats = [];
    bookings.forEach(booking => {
      if (booking.seats && Array.isArray(booking.seats)) {
        booking.seats.forEach(seat => {
          // Handle both seat objects and seat IDs
          if (typeof seat === 'object' && seat.seatNumber) {
            // Create seat ID format that matches SeatMap component
            bookedSeats.push(seat.seatNumber);
          } else if (typeof seat === 'string') {
            bookedSeats.push(seat);
          }
        });
      }
    });

    console.log(`Found ${bookedSeats.length} booked seats`);
    res.json({ bookedSeats });
  } catch (error) {
    console.error('Get booked seats error:', error);
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

// UPDATED: Enhanced bookTicket function to handle new seat selection format
exports.bookTicket = async (req, res) => {
  const { showtimeId, seats } = req.body;
  
  if (!req.session.user) {
    return res.status(401).json({ msg: 'Please log in to book tickets' });
  }

  try {
    console.log(`Booking attempt by user ${req.session.user.email} for showtime ${showtimeId}`);
    console.log('Seats data:', seats);
    
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

    // Handle new seat format from SeatMap component
    let seatIds = [];
    let totalPrice = 0;

    if (seats[0] && typeof seats[0] === 'object' && seats[0].id) {
      // New format: [{ id: 'Block 1-A1', type: 'regular', price: 10 }]
      seats.forEach(seat => {
        seatIds.push(seat.id);
        totalPrice += seat.price;
      });
    } else {
      // Old format: array of seat IDs
      seatIds = seats;
      totalPrice = seats.length * 10; // Default price
    }

    // Check if any seats are already booked for this showtime
    const existingBookings = await Booking.find({
      showtimeId,
      status: { $ne: 'cancelled' }
    });

    const bookedSeatIds = [];
    existingBookings.forEach(booking => {
      if (booking.seats) {
        booking.seats.forEach(seat => {
          if (typeof seat === 'object' && seat.seatNumber) {
            bookedSeatIds.push(seat.seatNumber);
          } else {
            bookedSeatIds.push(seat);
          }
        });
      }
    });

    const conflictingSeats = seatIds.filter(seatId => bookedSeatIds.includes(seatId));
    if (conflictingSeats.length > 0) {
      return res.status(400).json({ 
        msg: `Seats ${conflictingSeats.join(', ')} are already booked` 
      });
    }

    // Create QR code
    const qrData = `booking:${showtimeId}:${seatIds.join(',')}`;
    const qrCode = await QRCode.toDataURL(qrData);

    // Create booking with seat information
    const bookingSeats = seats[0] && typeof seats[0] === 'object' && seats[0].id 
      ? seats.map(seat => ({
          seatId: seat.id,
          seatType: seat.type,
          price: seat.price
        }))
      : seatIds.map(seatId => ({
          seatId,
          seatType: 'regular',
          price: 10
        }));

    const booking = new Booking({
      userId: req.session.user.id,
      showtimeId,
      seats: bookingSeats,
      totalPrice,
      qrCode,
      status: 'confirmed'
    });

    await booking.save();
    await booking.populate([
      { path: 'showtimeId', populate: { path: 'movieId hallId' } }
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
    });

    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};