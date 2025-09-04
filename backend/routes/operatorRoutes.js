const express = require('express');
const { scanTicket, checkIn } = require('../controllers/operatorController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/scan', authMiddleware, scanTicket);
router.put('/check-in/:bookingId', authMiddleware, checkIn);

module.exports = router;