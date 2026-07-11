require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);

/**
 * 404 Route Not Found Handler
 * Catches all requests to endpoints that do not exist.
 */
app.use((req, res) => {
  res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
});

/**
 * Global Error Handler Middleware
 * Intercepts any errors thrown synchronously or passed via next(error) 
 * so the server never crashes and always returns a clean JSON response.
 */
app.use((err, req, res, next) => {
  // If the error doesn't have a status code, default to 500
  const statusCode = err.statusCode ?? (res.statusCode === 200 ? 500 : res.statusCode);
  
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    // Only leak stack traces in development mode for security
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

module.exports = app;
