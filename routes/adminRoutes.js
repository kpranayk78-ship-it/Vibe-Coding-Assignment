const express = require('express');
const router = express.Router();

const {
  getDashboardStats,
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

// GET /api/admin/dashboard
router.get('/dashboard', getDashboardStats);

// GET /api/admin/reservations
// Optional query:
// /api/admin/reservations?date=2026-07-12
router.get('/reservations', getAllReservations);

// PUT /api/admin/reservations/:id
router.put('/reservations/:id', updateReservation);

// DELETE /api/admin/reservations/:id
router.delete('/reservations/:id', deleteReservation);

module.exports = router;