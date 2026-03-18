// Placeholder for validation schemas
const Joi = require('joi');

const patientSchema = Joi.object({
  patientId: Joi.string().required(),
  category: Joi.string(),
  responses: Joi.object(),
  notes: Joi.string(),
  riskScore: Joi.number(),
  riskLevel: Joi.string(),
  location: Joi.string(),
});

module.exports = { patientSchema };
