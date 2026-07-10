const Reservation = require('../models/Reservation');

/**
 * Creates a new reservation
 * POST /api/reservations
 */
const createReservation = async (req, res) => {
  try {
    const { date, timeSlot, guests } = req.body;
    
    // 1. Input Validation
    if (!date || !timeSlot || guests === undefined) {
      return res.status(400).json({ message: 'Please provide date, timeSlot, and guests.' });
    }

    const parsedGuests = Number(guests);
    if (isNaN(parsedGuests) || parsedGuests <= 0) {
      return res.status(400).json({ message: 'Number of guests must be greater than 0.' });
    }

    // 2. Validate against past dates
    const reservationDate = new Date(date);
    if (isNaN(reservationDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }
    
    // Compare dates ignoring the exact time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const requestedDate = new Date(reservationDate);
    requestedDate.setHours(0, 0, 0, 0);
    
    if (requestedDate < today) {
      return res.status(400).json({ message: 'Cannot make reservations for past dates.' });
    }

    // 3. Execution
    const customerId = req.user.id; 
    const reservation = await Reservation.makeReservation(customerId, reservationDate, timeSlot, parsedGuests);

    // 4. Response formatting
    await reservation.populate('customer', 'name email');
    await reservation.populate('table', 'tableNumber capacity');

    return res.status(201).json(reservation);
  } catch (error) {
    // Handle our domain-specific ReservationError cleanly
    if (error.name === 'ReservationError') {
      return res.status(error.statusCode || 400).json({ message: error.message });
    }
    
    console.error(`Error in createReservation: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves all reservations for the currently authenticated user
 * GET /api/reservations/my-reservations
 */
const getMyReservations = async (req, res) => {
  try {
    const customerId = req.user.id;

    const reservations = await Reservation.find({ customer: customerId })
      .populate('table', 'tableNumber capacity')
      .populate('customer', 'name email')
      .sort({ date: 1, timeSlot: 1 }); // Sorted chronologically

    return res.status(200).json(reservations);
  } catch (error) {
    console.error(`Error in getMyReservations: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Cancels a reservation by ID
 * PUT /api/reservations/:id/cancel
 */
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user.id;

    if (!id) {
      return res.status(400).json({ message: 'Reservation ID is required.' });
    }

    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // 1. Security Check: Ensure ownership
    if (reservation.customer.toString() !== customerId) {
      return res.status(403).json({ message: 'Not authorized to modify this reservation' });
    }
    
    // 2. Prevent redundant actions
    if (reservation.status === 'cancelled') {
      return res.status(400).json({ message: 'This reservation is already cancelled.' });
    }

    // 3. Execution
    reservation.status = 'cancelled';
    await reservation.save();

    return res.status(200).json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error) {
    console.error(`Error in cancelReservation: ${error.message}`);
    
    // Handle improperly formatted Mongoose ObjectIds
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ message: 'Invalid Reservation ID format' });
    }
    
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  cancelReservation,
};
