const jwt = require('jsonwebtoken');

const login = async (phoneNumber) => {
  // In a real application, you would verify the OTP here.
  // For this example, we'll just simulate success for a test number.
  if (phoneNumber === '1234567890' || phoneNumber === '9999999999') {
    const token = jwt.sign(
      { phoneNumber },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
    return { success: true, token, message: 'Login successful' };
  } else {
    return { success: false, message: 'Invalid phone number or OTP' };
  }
};

module.exports = { login };
