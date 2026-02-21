const express = require('express');
const router = express.Router();
const { listExpenses, createExpense } = require('../controllers/expense.controller');
const auth = require('../middleware/auth');

router.get('/', auth, listExpenses);
router.post('/', auth, createExpense);

module.exports = router;
