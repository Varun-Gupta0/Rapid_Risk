const express = require('express');
const router = express.Router();

// Import controller
const authController = require('../controllers/auth.controller');

// Define routes
router.post('/login', authController.login);
// router.post('/register', authController.register); // Placeholder for registration

module.exports = router;
