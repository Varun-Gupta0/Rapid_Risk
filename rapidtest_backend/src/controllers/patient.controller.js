const patientService = require('../services/patient.service');
const { evaluateRisk } = require('../services/riskEngine.service');

const createPatient = async (req, res) => {
  try {
    const patientData = req.body;
    const patient = await patientService.createPatient(patientData);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getAllPatients = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const patients = await patientService.getAllPatients(page, limit);
    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    console.error('Error getting patients:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await patientService.getPatientById(id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.status(200).json({ success: true, data: patient });
  } catch (error) {
    console.error('Error getting patient by ID:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const evaluatePatientRisk = async (req, res) => {
  try {
    const patientData = req.body;
    const evaluation = evaluateRisk(patientData, true); // Use ML in evaluation endpoint
    res.status(200).json({ success: true, data: evaluation });
  } catch (error) {
    console.error('Error in evaluatePatientRisk controller:', error);
    res.status(500).json({ success: false, message: 'Internal server error during risk evaluation' });
  }
};

module.exports = { createPatient, getAllPatients, getPatientById, evaluatePatientRisk };
