const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

// Apply the authentication middleware to all routes in this router
router.use(protect);

/**
 * Note: Assuming this router is mounted in app.js at '/api/reservations', 
 * the routes defined here are relative to that path.
 */

// POST /api/reservations - Create a new reservation
// GET /api/reservations  - Get all reservations for the logged-in user
router
  .route('/')
  .post(createReservation)
  .get(getMyReservations);

// DELETE /api/reservations/:id - Cancel a reservation
router
  .route('/:id')
  .delete(cancelReservation); 

module.exports = router;
