const app = require('./app');
const mongoose = require('mongoose');
const config = require('./config/config');

const PORT = config.port;

// Connect to MongoDB
mongoose
  .connect(config.mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server after successful database connection
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
