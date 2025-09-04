const express = require('express');
const { scanTicket, checkIn } = require('../controllers/operatorController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/scan', authMiddleware, scanTicket);
router.post('/check-in', authMiddleware, checkIn);

module.exports = router;