const express = require('express');
const router = express.Router();
const { listMaintenance, getMaintenance, createMaintenance, completeMaintenance } = require('../controllers/maintenance.controller');
const auth = require('../middleware/auth');

router.get('/', auth, listMaintenance);
router.get('/:id', auth, getMaintenance);
router.post('/', auth, createMaintenance);
router.patch('/:id/complete', auth, completeMaintenance);

module.exports = router;
