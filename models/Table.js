const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      unique: true,
      index: true, // Best practice: index unique fields
    },
    capacity: {
      type: Number,
      required: [true, 'Table capacity is required'],
      min: [1, 'Capacity must be greater than 0'], // Validation: Capacity must be > 0
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Finds the most suitable available table for a given reservation request.
 * Algorithm:
 * 1. Find all tables with capacity >= requested guests
 * 2. Sort by capacity (smallest suitable table first to maximize seating efficiency)
 * 3. Iterate through tables and check if they are already booked for the given date/time
 * 4. Return the first free table, or null if none are available.
 * 
 * @param {Date|String} date - The date of the reservation
 * @param {String} timeSlot - The time slot of the reservation (e.g., '18:00')
 * @param {Number} guests - The number of guests
 * @returns {Promise<Object|null>} The available table document, or null if no tables are available
 */
tableSchema.statics.findAvailableTable = async function (
  date,
  timeSlot,
  guests,
  excludeReservationId = null
) {
  // 1. Safely handle invalid date/time or guest inputs
  if (!date || !timeSlot || guests == null || isNaN(guests) || guests <= 0) {
    console.warn('Invalid reservation input parameters provided to findAvailableTable');
    return null;
  }

  // Ensure the date is a valid format
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    console.warn('Invalid date provided to findAvailableTable');
    return null;
  }

  // Dynamically load the Reservation model to avoid circular dependency issues
  const Reservation = require('./Reservation');
  
  try {
    // 2. Find tables with sufficient capacity, sorted smallest to largest
    const suitableTables = await this.find({ capacity: { $gte: guests } })
      .sort({ capacity: 1 })
      .exec(); // Explicitly execute the query
    
    // 3. For each table, check for existing overlapping bookings
    for (const table of suitableTables) {
      const query = {
  table: table._id,
  date: parsedDate,
  timeSlot: timeSlot.toString(),
  status: 'booked',
};

if (excludeReservationId) {
  query._id = { $ne: excludeReservationId };
}

const existingReservation = await Reservation.findOne(query).lean(); // lean() improves performance for read-only checks
      
      // 4. If no booking exists, we found our table
      if (!existingReservation) {
        return table;
      }
    }
    
    // 5. If all suitable tables are booked, return null
    return null;
  } catch (error) {
    // Catch database errors safely instead of throwing unhandled exceptions
    console.error(`Error in findAvailableTable: ${error.message}`);
    return null;
  }
};

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
