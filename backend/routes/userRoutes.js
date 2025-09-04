const express = require('express');
const { getMovies, bookTicket, getBookings } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/movies', getMovies);
router.post('/book', authMiddleware, bookTicket);
router.get('/bookings', authMiddleware, getBookings);

module.exports = router;