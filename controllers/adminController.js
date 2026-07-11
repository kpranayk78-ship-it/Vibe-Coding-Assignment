const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

/**
 * GET /api/admin/reservations
 * View all reservations
 */
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('customer', 'name email')
      .populate('table', 'tableNumber capacity')
      .sort({ date: 1, timeSlot: 1 });

    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
    });
  }
};

/**
 * GET /api/admin/reservations?date=YYYY-MM-DD
 * View reservations for a specific date
 */
const getReservationsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        message: 'Date query parameter is required',
      });
    }

    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);

    const reservations = await Reservation.find({
      date: {
        $gte: startDate,
        $lt: endDate,
      },
    })
      .populate('customer', 'name email')
      .populate('table', 'tableNumber capacity')
      .sort({ timeSlot: 1 });

    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
    });
  }
};

/**
 * PUT /api/admin/reservations/:id
 * Update a reservation
 */
const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found',
      });
    }

    // Use existing values if a field isn't being updated
    const newDate = req.body.date || reservation.date;
    const newTimeSlot = req.body.timeSlot || reservation.timeSlot;
    const newGuests = req.body.guests || reservation.guests;

    // Find the best available table, ignoring this reservation itself
    const availableTable = await Table.findAvailableTable(
      newDate,
      newTimeSlot,
      newGuests,
      reservation._id
    );

    if (!availableTable) {
      return res.status(400).json({
        message: 'No suitable table available for the updated reservation',
      });
    }

    // Update reservation
    reservation.date = newDate;
    reservation.timeSlot = newTimeSlot;
    reservation.guests = newGuests;
    reservation.table = availableTable._id;

    await reservation.save();

    await reservation.populate('customer', 'name email');
    await reservation.populate('table', 'tableNumber capacity');

    res.status(200).json({
      message: 'Reservation updated successfully',
      reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
    });
  }
};

/**
 * DELETE /api/admin/reservations/:id
 * Cancel any reservation
 */
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('customer', 'name email')
      .populate('table', 'tableNumber capacity');

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found',
      });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.status(200).json({
      message: 'Reservation cancelled successfully',
      reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
    });
  }
};

/**
 * GET /api/admin/dashboard
 * Dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const Table = require('../models/Table');

    const totalReservations = await Reservation.countDocuments();

    const activeReservations = await Reservation.countDocuments({
      status: 'booked',
    });

    const cancelledReservations = await Reservation.countDocuments({
      status: 'cancelled',
    });

    // Today's reservations
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const todayReservations = await Reservation.countDocuments({
      date: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    const totalTables = await Table.countDocuments();

    res.status(200).json({
      totalReservations,
      activeReservations,
      cancelledReservations,
      todayReservations,
      totalTables,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllReservations,
  getReservationsByDate,
  updateReservation,
  deleteReservation,
};