const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  category: { type: String },
  responses: { type: Object },
  notes: { type: String },
  riskScore: { type: Number },
  riskLevel: { type: String },
  location: { type: String },
  timestamp: { type: Date, default: Date.now },
  syncStatus: { type: String, default: 'pending' },
});

const Patient = mongoose.model('Patient', patientSchema);

module.exports = Patient;
