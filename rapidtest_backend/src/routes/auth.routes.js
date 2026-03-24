const express = require('express');
const router = express.Router();

// Import controller
const authController = require('../controllers/auth.controller');

// Define routes
router.post('/login', authController.login);
router.post('/request-otp', authController.requestOTP);

module.exports = router;
