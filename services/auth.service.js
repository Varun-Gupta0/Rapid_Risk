// Simulate OTP verification
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const login = async (phoneNumber) => {
  // In a real application, you would verify the OTP here.
  // For this example, we'll just simulate success.

  if (phoneNumber === '1234567890') { // Example phone number
    const token = 'dummy_jwt_token'; // Replace with actual JWT generation
    return { success: true, token, message: 'Login successful' };
  } else {
    return { success: false, message: 'Invalid phone number' };
  }
};

module.exports = { login };
