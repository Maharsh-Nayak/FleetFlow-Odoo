const express = require('express');
const router = express.Router();
const { listTrips, getTrip, createTrip, dispatchTrip, completeTrip, cancelTrip } = require('../controllers/trip.controller');
const auth = require('../middleware/auth');

router.get('/', auth, listTrips);
router.get('/:id', auth, getTrip);
router.post('/', auth, createTrip);
router.patch('/:id/dispatch', auth, dispatchTrip);
router.patch('/:id/complete', auth, completeTrip);
router.patch('/:id/cancel', auth, cancelTrip);

module.exports = router;
