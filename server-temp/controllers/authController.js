const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Strict Input Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // 2. Check if user email already exists
    // We use .lean() because we only need to know if the document exists (faster query)
    const userExists = await User.findOne({ email }).lean();

    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // 3. Create and save the user
    // Note: The pre('save') hook in User.js handles the password hashing
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      return res.status(400).json({ message: 'Invalid user data received' });
    }
  } catch (error) {
    // Check for Mongoose Duplicate Key Error (Race condition fallback)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    console.error(`Error in registerUser: ${error.message}`);
    // Pass to global error handler
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Strict Input Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // 2. Find user by email
    const user = await User.findOne({ email });

    // 3. Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      // 4. Generate JWT
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(`Error in loginUser: ${error.message}`);
    // Pass to global error handler
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
