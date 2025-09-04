const express = require('express');
const { addMovie, updateMovie, deleteMovie, manageHalls, manageShowtimes, getReports } = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/movies', authMiddleware, addMovie);
router.put('/movies/:id', authMiddleware, updateMovie);
router.delete('/movies/:id', authMiddleware, deleteMovie);
router.post('/halls', authMiddleware, manageHalls);
router.post('/showtimes', authMiddleware, manageShowtimes);
router.get('/reports', authMiddleware, getReports);

module.exports = router;