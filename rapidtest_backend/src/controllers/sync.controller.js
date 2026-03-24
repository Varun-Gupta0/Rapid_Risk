const syncService = require('../services/sync.service');

const syncRecords = async (req, res) => {
  try {
    const records = req.body;
    const result = await syncService.syncRecords(records);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Error syncing records:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { syncRecords };
