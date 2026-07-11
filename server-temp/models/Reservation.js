const mongoose = require('mongoose');

// Custom Error class for domain-specific reservation errors
class ReservationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'ReservationError';
    this.statusCode = statusCode;
  }
}

const reservationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Customer reference is required'],
      ref: 'User',
      index: true, // Speeds up customer-specific queries like getMyReservations
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Table reference is required'],
      ref: 'Table',
    },
    date: {
      type: Date,
      required: [true, 'Reservation date is required'],
    },
    timeSlot: {
      type: String,
      required: [true, 'Reservation time slot is required'],
      trim: true,
    },
    guests: {
      type: Number,
      required: [true, 'Number of guests is required'],
      min: [1, 'Number of guests must be at least 1'], // Validation: Must be > 0
    },
    status: {
      type: String,
      enum: {
        values: ['booked', 'cancelled'],
        message: '{VALUE} is not a supported reservation status'
      },
      default: 'booked',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to optimize the availability check algorithm in the Table model
reservationSchema.index({ table: 1, date: 1, timeSlot: 1 });

/**
 * Creates a new reservation by securing an available table.
 * 
 * @param {String|ObjectId} customer - The ID of the customer
 * @param {Date|String} date - The requested reservation date
 * @param {String} timeSlot - The requested time slot
 * @param {Number} guests - The number of guests
 * @returns {Promise<Object>} The created reservation document
 * @throws {ReservationError} When inputs are invalid or no tables are available
 */
reservationSchema.statics.makeReservation = async function (customer, date, timeSlot, guests) {
  // 1. Validate required fields before processing
  if (!customer || !date || !timeSlot || guests == null) {
    throw new ReservationError('Missing required fields: customer, date, timeSlot, and guests are mandatory.');
  }

  const parsedGuests = Number(guests);
  if (isNaN(parsedGuests) || parsedGuests <= 0) {
    throw new ReservationError('Number of guests must be a valid number greater than 0.');
  }

  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    throw new ReservationError('Invalid date format provided.');
  }

  // 2. Safely interact with the Table model
  const Table = require('./Table');
  const availableTable = await Table.findAvailableTable(parsedDate, timeSlot.toString(), parsedGuests);
  
  // 3. Meaningful error if the booking fails
  if (!availableTable) {
    // We retain the exact "No tables available" message so the controller can still match it,
    // but it is now wrapped in our custom, meaningful ReservationError class.
    throw new ReservationError('No tables available', 404);
  }
  
  try {
    // 4. Create and return the reservation
    const reservation = await this.create({
      customer,
      table: availableTable._id,
      date: parsedDate,
      timeSlot: timeSlot.toString(),
      guests: parsedGuests,
      status: 'booked'
    });
    
    return reservation;
  } catch (error) {
    // Catch Mongoose validation errors or database failures
    throw new ReservationError(`Failed to create reservation: ${error.message}`, 500);
  }
};

const Reservation = mongoose.model('Reservation', reservationSchema);

// Export the model and the custom error so controllers can use it
module.exports = Reservation;
module.exports.ReservationError = ReservationError;
