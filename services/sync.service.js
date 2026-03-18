const Patient = require('../models/patient.model');

const syncRecords = async (records) => {
  const results = {
    synced: 0,
    errors: [],
  };

  for (const record of records) {
    try {
      // Logic to either create or update the record based on patientId
      await Patient.findOneAndUpdate(
        { patientId: record.patientId },
        { ...record, syncStatus: 'synced' },
        { upsert: true, new: true }
      );
      results.synced++;
    } catch (error) {
      console.error(`Error syncing record for patient ${record.patientId || 'unknown'}:`, error);
      results.errors.push({
        patientId: record.patientId,
        error: error.message,
      });
    }
  }

  return results;
};

module.exports = { syncRecords };
