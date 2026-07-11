const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema definition for the restaurant reservation system.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters long'],
      // Note: We don't use 'select: false' here because authController relies on 
      // the password field existing during registration and login queries.
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Mongoose Pre-Save Hook
 * Automatically hashes the user's password using bcrypt before saving it to the database.
 * This ensures plain-text passwords are never stored.
 */
userSchema.pre('save', async function () {
  // Skip hashing if password hasn't changed
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * Instance Method: matchPassword
 * Compares an entered plain-text password with the hashed password stored in the database.
 * 
 * @param {String} enteredPassword - The plain-text password from the login request
 * @returns {Promise<Boolean>} True if passwords match, false otherwise
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
