const FuelLog = require('../models/FuelLog');

// GET /api/fuel
const listFuel = async (req, res) => {
    try {
        const { vehicle_id, limit = 10, offset = 0 } = req.query;
        const where = {};

        if (vehicle_id) where.vehicle_id = vehicle_id;

        const { count, rows } = await FuelLog.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['fuel_date', 'DESC']],
        });

        res.json({
            data: rows,
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (error) {
        console.error('List fuel error:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/fuel
const createFuel = async (req, res) => {
    try {
        const { vehicle_id, fuel_date, liters, cost, odometer_reading } = req.body;

        if (!vehicle_id || !fuel_date || !liters || !cost) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const fuel = await FuelLog.create({
            vehicle_id,
            fuel_date,
            liters,
            cost,
            odometer_reading,
        });

        res.status(201).json(fuel);
    } catch (error) {
        console.error('Create fuel error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { listFuel, createFuel };
