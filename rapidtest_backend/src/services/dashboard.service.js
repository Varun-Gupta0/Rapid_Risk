const Patient = require('../models/patient.model');

/**
 * Get aggregated data for the hospital dashboard
 * @param {Object} query - Sorting parameters
 * @returns {Object} - Dashboard statistics and grouped data
 */
const getDashboardData = async (query = {}) => {
  const { sortBy = 'timestamp', order = 'desc' } = query;

  // 1. Total counts and risk statistics
  const [totalPatients, riskStats] = await Promise.all([
    Patient.countDocuments(),
    Patient.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const dashboardStats = {
    totalPatients,
    highRiskPatients: 0,
    mediumRiskPatients: 0,
    lowRiskPatients: 0,
  };

  riskStats.forEach(stat => {
    if (stat._id === 'HIGH') dashboardStats.highRiskPatients = stat.count;
    else if (stat._id === 'MEDIUM') dashboardStats.mediumRiskPatients = stat.count;
    else if (stat._id === 'LOW') dashboardStats.lowRiskPatients = stat.count;
  });

  // 2. Region-wise grouping
  const regionWiseData = await Patient.aggregate([
    {
      $group: {
        _id: { $ifNull: ['$location', 'Unknown'] },
        count: { $sum: 1 },
        highRisk: {
          $sum: { $cond: [{ $eq: ['$riskLevel', 'HIGH'] }, 1, 0] }
        },
        mediumRisk: {
          $sum: { $cond: [{ $eq: ['$riskLevel', 'MEDIUM'] }, 1, 0] }
        },
        lowRisk: {
          $sum: { $cond: [{ $eq: ['$riskLevel', 'LOW'] }, 1, 0] }
        }
      }
    },
    { $sort: { count: -1 } },
    {
      $project: {
        region: '$_id',
        count: 1,
        highRisk: 1,
        mediumRisk: 1,
        lowRisk: 1,
        _id: 0
      }
    }
  ]);

  // 3. Sorting for recent patients list
  const sortOptions = {};
  if (sortBy === 'riskLevel') {
    // For risk level, we sort by riskScore as it's numeric and matches risk level
    sortOptions['riskScore'] = order === 'asc' ? 1 : -1;
  } else if (sortBy === 'time' || sortBy === 'timestamp') {
    sortOptions['timestamp'] = order === 'asc' ? 1 : -1;
  } else if (sortBy === 'location') {
    sortOptions['location'] = order === 'asc' ? 1 : -1;
  } else {
    // Default fallback
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;
  }

  const recentPatients = await Patient.find()
    .sort(sortOptions)
    .limit(10);

  return {
    ...dashboardStats,
    regionWiseData,
    recentPatients
  };
};

module.exports = {
  getDashboardData
};
