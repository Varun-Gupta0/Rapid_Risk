const express = require('express');
const router = express.Router();

// Import controller
const syncController = require('../controllers/sync.controller');

// Define routes
router.post('/', syncController.syncRecords);

module.exports = router;
