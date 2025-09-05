// backend/controllers/userController.js - FIXED bookTicket function
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

// Get showtime details with hall and movie info
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

// Get booked seats for a specific showtime
exports.getShowtimeSeats = async (req, res) => {
  try {
    const showtimeId = req.params.id;
    console.log(`Fetching booked seats for showtime: ${showtimeId}`);
    
    // Find all confirmed bookings for this showtime
    const bookings = await Booking.find({ 
      showtimeId,
      status: { $in: ['confirmed', 'pending', 'checked-in'] }
    });

    // Extract all booked seat IDs
    const bookedSeats = [];
    bookings.forEach(booking => {
      if (booking.seats && Array.isArray(booking.seats)) {
        booking.seats.forEach(seat => {
          // Handle different seat data formats
          if (typeof seat === 'object') {
            if (seat.seatId) {
              bookedSeats.push(seat.seatId);
            } else if (seat.seatNumber) {
              bookedSeats.push(seat.seatNumber);
            }
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

// FIXED: Enhanced bookTicket function
exports.bookTicket = async (req, res) => {
  const { showtimeId, seats } = req.body;
  
  if (!req.session.user) {
    return res.status(401).json({ msg: 'Please log in to book tickets' });
  }

  try {
    console.log(`Booking attempt by user ${req.session.user.email} for showtime ${showtimeId}`);
    console.log('Seats data received:', JSON.stringify(seats, null, 2));
    
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

    // Process seats data and calculate total price
    let seatData = [];
    let totalPrice = 0;

    // Handle different seat formats
    for (const seat of seats) {
      let seatInfo;
      
      if (typeof seat === 'object' && seat.seatId) {
        // Format: { seatId: 'Block 1-A1', seatType: 'regular', price: 10 }
        seatInfo = {
          seatId: seat.seatId,
          seatType: seat.seatType || 'regular',
          price: seat.price || 10
        };
      } else if (typeof seat === 'object' && seat.id) {
        // Format: { id: 'Block 1-A1', type: 'regular', price: 10 }
        seatInfo = {
          seatId: seat.id,
          seatType: seat.type || 'regular',
          price: seat.price || 10
        };
      } else if (typeof seat === 'string') {
        // Format: 'Block 1-A1'
        seatInfo = {
          seatId: seat,
          seatType: 'regular',
          price: 10
        };
      } else {
        console.error('Unrecognized seat format:', seat);
        continue;
      }
      
      seatData.push(seatInfo);
      totalPrice += seatInfo.price;
    }

    console.log('Processed seat data:', JSON.stringify(seatData, null, 2));
    console.log('Total price:', totalPrice);

    // Check if any seats are already booked for this showtime
    const existingBookings = await Booking.find({
      showtimeId,
      status: { $in: ['confirmed', 'pending', 'checked-in'] }
    });

    const bookedSeatIds = [];
    existingBookings.forEach(booking => {
      if (booking.seats) {
        booking.seats.forEach(bookedSeat => {
          if (typeof bookedSeat === 'object' && bookedSeat.seatId) {
            bookedSeatIds.push(bookedSeat.seatId);
          } else if (typeof bookedSeat === 'object' && bookedSeat.seatNumber) {
            bookedSeatIds.push(bookedSeat.seatNumber);
          } else if (typeof bookedSeat === 'string') {
            bookedSeatIds.push(bookedSeat);
          }
        });
      }
    });

    console.log('Currently booked seats:', bookedSeatIds);

    // Check for conflicts
    const requestedSeatIds = seatData.map(s => s.seatId);
    const conflictingSeats = requestedSeatIds.filter(seatId => bookedSeatIds.includes(seatId));
    
    if (conflictingSeats.length > 0) {
      return res.status(400).json({ 
        msg: `Seats ${conflictingSeats.join(', ')} are already booked` 
      });
    }

    // Create QR code data
    const qrData = `booking:${showtimeId}:${requestedSeatIds.join(',')}`;
    console.log('QR data:', qrData);
    
    let qrCode;
    try {
      qrCode = await QRCode.toDataURL(qrData);
    } catch (qrError) {
      console.error('QR code generation error:', qrError);
      // Continue without QR code if generation fails
      qrCode = null;
    }

    // Create booking with proper seat structure
    const booking = new Booking({
      userId: req.session.user.id,
      showtimeId,
      seats: seatData, // Store as array of objects with seatId, seatType, price
      totalPrice,
      qrCode,
      status: 'confirmed'
    });

    console.log('Creating booking:', {
      userId: req.session.user.id,
      showtimeId,
      seats: seatData,
      totalPrice,
      status: 'confirmed'
    });

    await booking.save();
    
    // Populate the booking with related data for response
    await booking.populate([
      { 
        path: 'showtimeId', 
        populate: [
          { path: 'movieId', select: 'title genre duration poster' },
          { path: 'hallId', select: 'name location totalSeats' }
        ]
      }
    ]);

    console.log(`Booking created successfully: ${booking._id}`);
    
    res.json({ 
      msg: 'Booking successful', 
      booking: {
        _id: booking._id,
        userId: booking.userId,
        showtimeId: booking.showtimeId,
        seats: booking.seats,
        totalPrice: booking.totalPrice,
        status: booking.status,
        qrCode: booking.qrCode,
        createdAt: booking.createdAt
      }
    });
    
  } catch (error) {
    console.error('Book ticket error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      msg: 'Booking failed due to server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
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