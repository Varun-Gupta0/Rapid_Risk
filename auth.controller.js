const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authService = require('../services/auth.service');

const login = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const { success, message } = await authService.login(phoneNumber);

    if (success) {
      // Generate JWT token
      const token = jwt.sign({ phoneNumber }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ success: true, token, message });
    } else {
      res.status(401).json({ success: false, message });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { login };
