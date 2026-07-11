const express = require('express');
const router = express.Router();

const {
  getAllReservations,
  getReservationsByDate,
  updateReservation,
  deleteReservation,
} = require('../controllers/adminController');

const {
  protect,
  adminOnly,
} = require('../middleware/authMiddleware');

// Every admin route requires login + admin role
router.use(protect);
router.use(adminOnly);

// GET /api/admin/reservations
router.get('/reservations', getAllReservations);

// GET /api/admin/reservations?date=YYYY-MM-DD
router.get('/reservations/date', getReservationsByDate);

// PUT /api/admin/reservations/:id
router.put('/reservations/:id', updateReservation);

// DELETE /api/admin/reservations/:id
router.delete('/reservations/:id', deleteReservation);

module.exports = router;