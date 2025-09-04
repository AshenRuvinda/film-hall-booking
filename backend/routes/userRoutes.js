const express = require('express');
const { getMovies, getShowtimes, bookSeats, getMyBookings } = require('../controllers/userController');

const router = express.Router();

router.get('/movies', getMovies);
router.get('/showtimes/:movieId', getShowtimes);
router.post('/book', bookSeats);
router.get('/bookings', getMyBookings);

module.exports = router;