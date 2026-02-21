const express = require('express');
const router = express.Router();
const { listDrivers, getDriver, createDriver, updateDriver, getDriverTrips } = require('../controllers/driver.controller');
const auth = require('../middleware/auth');

router.get('/', auth, listDrivers);
router.get('/:id', auth, getDriver);
router.post('/', auth, createDriver);
router.put('/:id', auth, updateDriver);
router.get('/:id/trips', auth, getDriverTrips);

module.exports = router;
