const Expense = require('../models/Expense');

// GET /api/expenses
const listExpenses = async (req, res) => {
    try {
        const { vehicle_id, trip_id, limit = 10, offset = 0 } = req.query;
        const where = {};

        if (vehicle_id) where.vehicle_id = vehicle_id;
        if (trip_id) where.trip_id = trip_id;

        const { count, rows } = await Expense.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['expense_date', 'DESC']],
        });

        res.json({
            data: rows,
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (error) {
        console.error('List expenses error:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/expenses
const createExpense = async (req, res) => {
    try {
        const { vehicle_id, trip_id, expense_date, description, amount, reference_number } = req.body;

        if (!vehicle_id || !expense_date || !description || !amount) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const expense = await Expense.create({
            vehicle_id,
            trip_id: trip_id || null,
            expense_date,
            description,
            amount,
            reference_number,
        });

        res.status(201).json(expense);
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { listExpenses, createExpense };
