const jwt = require('jsonwebtoken');
const Worker = require('../models/worker.model');

// In a real application, you'd store OTPs in a database or Redis with an expiration time.
// For simulation, we'll store them in memory.
const simulatedOTPs = new Map();

const requestOTP = async (phoneNumber, workerId) => {
  // Validate worker exists with this phone number and ID
  const worker = await Worker.findOne({ phoneNumber, workerId, status: 'active' });
  
  if (!worker) {
    // For demo purposes, we'll allow a specific test number/ID
    if (phoneNumber !== '1234567890' || workerId !== 'ID-123456') {
      return { success: false, message: 'Invalid worker ID or phone number' };
    }
  }

  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  simulatedOTPs.set(phoneNumber, otp);

  // In a real app, send the OTP via SMS. Here we just log it.
  console.log(`[SIMULATED OTP] For ${phoneNumber}: ${otp}`);

  return { 
    success: true, 
    message: 'OTP sent successfully',
    // For simulation clarity during development, we'll return it, 
    // though in production you'd NEVER do this.
    otp: process.env.NODE_ENV === 'development' ? otp : undefined 
  };
};

const login = async (phoneNumber, workerId, otp) => {
  // Verify OTP
  const storedOTP = simulatedOTPs.get(phoneNumber);
  
  if (!storedOTP || storedOTP !== otp) {
    // Special test OTP for easier testing
    if (otp !== '000000') {
      return { success: false, message: 'Invalid OTP' };
    }
  }

  // Find worker
  let worker = await Worker.findOne({ phoneNumber, workerId, status: 'active' });
  
  // Create dummy worker if it's the test worker
  if (!worker && phoneNumber === '1234567890' && workerId === 'ID-123456') {
    worker = {
      phoneNumber,
      workerId,
      name: 'Test Health Worker',
      role: 'Health Worker'
    };
  }

  if (!worker) {
    return { success: false, message: 'Worker not found or inactive' };
  }

  const token = jwt.sign(
    { 
      phoneNumber: worker.phoneNumber, 
      workerId: worker.workerId,
      name: worker.name,
      role: worker.role 
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );

  // Clear OTP after successful login
  simulatedOTPs.delete(phoneNumber);

  return { 
    success: true, 
    token, 
    message: 'Login successful',
    user: {
      name: worker.name,
      workerId: worker.workerId,
      role: worker.role
    }
  };
};

module.exports = { requestOTP, login };

