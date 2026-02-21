const express = require('express');
const router = express.Router();
const { listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicle.controller');
const auth = require('../middleware/auth');

router.get('/', auth, listVehicles);
router.get('/:id', auth, getVehicle);
router.post('/', auth, createVehicle);
router.put('/:id', auth, updateVehicle);
router.delete('/:id', auth, deleteVehicle);

module.exports = router;
