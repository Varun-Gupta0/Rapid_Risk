const express = require('express');
const router = express.Router();

// Import controller
const patientController = require('../controllers/patient.controller');

// Define routes
router.post('/', patientController.createPatient);
router.post('/evaluate', patientController.evaluatePatientRisk);
router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatientById);

module.exports = router;
