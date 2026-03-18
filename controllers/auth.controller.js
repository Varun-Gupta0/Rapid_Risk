const authService = require('../services/auth.service');

const login = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const { success, token, message } = await authService.login(phoneNumber);

    if (success) {
      res.status(200).json({ success: true, token, message });
    } else {
      res.status(401).json({ success: false, message });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// const register = async (req, res) => {
//   // Implement registration logic here
// };

module.exports = { login };
