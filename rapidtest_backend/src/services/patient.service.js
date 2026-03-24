const Patient = require('../models/patient.model');
const { evaluateRisk } = require('./riskEngine.service');

const createPatient = async (patientData) => {
  const { riskScore, riskLevel, explanation } = evaluateRisk(patientData);
  const patient = new Patient({
    ...patientData,
    riskScore,
    riskLevel,
    explanation,
  });
  return await patient.save();
};

const getAllPatients = async (page, limit) => {
  const skip = (page - 1) * limit;
  const patients = await Patient.find()
    .skip(skip)
    .limit(limit);
  const total = await Patient.countDocuments();
  return {
    data: patients,
    total,
    page,
    limit,
  };
};

const getPatientById = async (id) => {
  return await Patient.findById(id);
};

module.exports = { createPatient, getAllPatients, getPatientById };
