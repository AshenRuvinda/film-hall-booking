const express = require('express');
const { login, register, check, logout } = require('../controllers/authController');
const { check: validationCheck } = require('express-validator');

const router = express.Router();

router.post(
  '/register',
  [
    validationCheck('name', 'Name is required').not().isEmpty(),
    validationCheck('email', 'Please include a valid email').isEmail(),
    validationCheck('password', 'Password must be 6 or more characters').isLength({ min: 6 }),
    validationCheck('role', 'Role must be user, admin, or operator').optional().isIn(['user', 'admin', 'operator']),
  ],
  register
);

router.post(
  '/login',
  [
    validationCheck('email', 'Please include a valid email').isEmail(),
    validationCheck('password', 'Password is required').exists(),
  ],
  login
);

router.get('/check', check);
router.post('/logout', logout);

module.exports = router;