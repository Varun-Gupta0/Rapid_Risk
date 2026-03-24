const authService = require('../services/auth.service');

/**
 * Controller to handle OTP request
 */
const requestOTP = async (req, res) => {
  try {
    const { phoneNumber, workerId } = req.body;
    const result = await authService.requestOTP(phoneNumber, workerId);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Error during OTP request controller:', error);
    res.status(500).json({ success: false, message: 'Internal server error during OTP request' });
  }
};

/**
 * Controller to handle Login verification
 */
const login = async (req, res) => {
  try {
    const { phoneNumber, healthWorkerId, otp } = req.body;
    // Map healthWorkerId to workerId as expected by authService
    const result = await authService.login(phoneNumber, healthWorkerId, otp);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Error during login controller:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login' });
  }
};

module.exports = { 
  requestOTP, 
  login 
};
