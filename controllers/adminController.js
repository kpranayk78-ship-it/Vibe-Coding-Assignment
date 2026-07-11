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
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * GET /api/admin/reservations?date=YYYY-MM-DD
 */
const getReservationsByDate = async (req, res) => {
  try {
    const { date } = req.query;

    const reservations = await Reservation.find({
      date: new Date(date),
    })
      .populate('customer', 'name email')
      .populate('table', 'tableNumber capacity');

    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * PUT /api/admin/reservations/:id
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
    );

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found',
      });
    }

    res.status(200).json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Server Error',
    });
  }
};

/**
 * DELETE /api/admin/reservations/:id
 */
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        message: 'Reservation not found',
      });
    }

    reservation.status = 'cancelled';

    await reservation.save();

    res.status(200).json({
      message: 'Reservation cancelled',
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