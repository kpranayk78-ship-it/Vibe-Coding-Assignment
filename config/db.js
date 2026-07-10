const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the URI from environment variables.
 * Also configures Mongoose settings and global event listeners for database resilience.
 */
const connectDB = async () => {
  try {
    // Mongoose 7+ best practice: explicitly set strictQuery
    mongoose.set('strictQuery', false);

    // Initial connection attempt
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Listen for unexpected disconnects after the initial connection
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected! Attempting to reconnect...');
    });

  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit process with failure (1) so the container orchestrator (e.g. Docker, PM2) knows to restart it
    process.exit(1);
  }
};

module.exports = connectDB;
