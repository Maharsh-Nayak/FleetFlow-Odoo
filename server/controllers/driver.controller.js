const Driver = require('../models/Driver');
const Trip = require('../models/Trip');

// GET /api/drivers
const listDrivers = async (req, res) => {
    try {
        const { status, limit = 10, offset = 0 } = req.query;
        const where = {};

        if (status) where.status = status;

        const { count, rows } = await Driver.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
        });

        res.json({
            data: rows,
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (error) {
        console.error('List drivers error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/drivers/:id
const getDriver = async (req, res) => {
    try {
        const driver = await Driver.findByPk(req.params.id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }
        res.json(driver);
    } catch (error) {
        console.error('Get driver error:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/drivers
const createDriver = async (req, res) => {
    try {
        const { name, license_number, license_expiry, phone_number, safety_score = 100, hire_date } = req.body;

        if (!name || !license_number || !license_expiry) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const driver = await Driver.create({
            name,
            license_number,
            license_expiry,
            phone_number,
            safety_score,
            hire_date: hire_date || new Date(),
        });

        res.status(201).json(driver);
    } catch (error) {
        console.error('Create driver error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'License number already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/drivers/:id
const updateDriver = async (req, res) => {
    try {
        const { safety_score, status } = req.body;
        const driver = await Driver.findByPk(req.params.id);

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        if (safety_score !== undefined) {
            if (safety_score < 0 || safety_score > 100) {
                return res.status(400).json({ message: 'Safety score must be between 0-100' });
            }
            driver.safety_score = safety_score;
        }
        if (status) driver.status = status;

        await driver.save();
        res.json(driver);
    } catch (error) {
        console.error('Update driver error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/drivers/:id/trips
const getDriverTrips = async (req, res) => {
    try {
        const trips = await Trip.findAll({
            where: { driver_id: req.params.id },
            order: [['trip_date', 'DESC']],
        });

        res.json({
            driver_id: req.params.id,
            trips,
        });
    } catch (error) {
        console.error('Get driver trips error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { listDrivers, getDriver, createDriver, updateDriver, getDriverTrips };
