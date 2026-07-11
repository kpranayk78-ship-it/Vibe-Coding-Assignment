const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes that require authentication.
 * Checks for a Bearer token, verifies it, and attaches the user to req.user.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Check if the Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Extract the token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token signature and expiration
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user in the database
      // We use .select('-password') to ensure we don't attach the hashed password to the request object
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user no longer exists' });
      }

      // 5. Authentication successful, proceed to the next middleware/controller
      return next();
    } catch (error) {
      console.error(`Authentication error: ${error.message}`);
      return res.status(401).json({ message: 'Not authorized, token is invalid or expired' });
    }
  }

  // 6. If no token was found in the header
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Not authenticated',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required',
    });
  }

  next();
};

module.exports = {
  protect,
  adminOnly,
};
