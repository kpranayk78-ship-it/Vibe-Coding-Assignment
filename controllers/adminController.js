const Reservation = require('../models/Reservation');
require('../models/Table');

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
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    )
      .populate('customer', 'name email')
      .populate('table', 'tableNumber capacity');

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found',
      });
    }

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

module.exports = {
  getAllReservations,
  getReservationsByDate,
  updateReservation,
  deleteReservation,
};