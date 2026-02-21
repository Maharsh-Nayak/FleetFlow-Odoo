const express = require('express');
const router = express.Router();
const { listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicle.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/rbac');

router.get('/', auth, authorize('MANAGER', 'DISPATCHER', 'SAFETY', 'FINANCE'), listVehicles);
router.get('/:id', auth, authorize('MANAGER', 'DISPATCHER', 'SAFETY', 'FINANCE'), getVehicle);
router.post('/', auth, authorize('MANAGER'), createVehicle);
router.put('/:id', auth, authorize('MANAGER'), updateVehicle);
router.delete('/:id', auth, authorize('MANAGER'), deleteVehicle);

module.exports = router;
