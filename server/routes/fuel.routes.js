const express = require('express');
const router = express.Router();
const { listFuel, createFuel } = require('../controllers/fuel.controller');
const auth = require('../middleware/auth');

router.get('/', auth, listFuel);
router.post('/', auth, createFuel);

module.exports = router;
