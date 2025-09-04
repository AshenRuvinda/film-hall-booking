const express = require('express');
const { addMovie, editMovie, deleteMovie, addHall, manageShowtimes, getBookings, getReports } = require('../controllers/adminController');

const router = express.Router();

router.post('/movies', addMovie);
router.put('/movies/:id', editMovie);
router.delete('/movies/:id', deleteMovie);
router.post('/halls', addHall);
router.post('/showtimes', manageShowtimes);
router.get('/bookings', getBookings);
router.get('/reports', getReports);

module.exports = router;