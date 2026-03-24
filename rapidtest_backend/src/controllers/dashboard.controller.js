const dashboardService = require('../services/dashboard.service');

/**
 * Controller to handle dashboard data requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDashboardData = async (req, res) => {
  try {
    const { sortBy = 'timestamp', order = 'desc' } = req.query;
    
    const dashboardData = await dashboardService.getDashboardData({ sortBy, order });
    
    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching dashboard data'
    });
  }
};

module.exports = {
  getDashboardData
};
