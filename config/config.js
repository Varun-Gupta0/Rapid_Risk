require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGO_URI || 'mongodb://localhost:27017/rakshaAI',
};

module.exports = config;
