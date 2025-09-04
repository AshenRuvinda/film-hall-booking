const express = require('express');
const { scanTicket, checkIn } = require('../controllers/operatorController');

const router = express.Router();

router.post('/scan', scanTicket);
router.put('/checkin/:bookingId', checkIn);

module.exports = router;