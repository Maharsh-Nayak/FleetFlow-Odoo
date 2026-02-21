const Vehicle = require('../models/Vehicle');
const { Op } = require('sequelize');

// GET /api/vehicles
const listVehicles = async (req, res) => {
    try {
        const { status, type, region, limit = 100, offset = 0 } = req.query;
        const where = {};

        if (status) where.status = status;
        if (type) where.vehicle_type = type;
        if (region) where.region = region;

        const { count, rows } = await Vehicle.findAndCountAll({
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
        console.error('List vehicles error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/vehicles/:id
const getVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        res.json(vehicle);
    } catch (error) {
        console.error('Get vehicle error:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/vehicles
const createVehicle = async (req, res) => {
    try {
        const { model, license_plate, vehicle_type, max_capacity_kg, acquisition_cost, odometer, region } = req.body;

        if (!model || !license_plate || !max_capacity_kg) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const vehicle = await Vehicle.create({
            model,
            license_plate,
            vehicle_type,
            max_capacity_kg,
            acquisition_cost,
            odometer: odometer || 0,
            region,
        });

        res.status(201).json(vehicle);
    } catch (error) {
        console.error('Create vehicle error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'License plate already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// PUT /api/vehicles/:id
const updateVehicle = async (req, res) => {
    try {
        const { odometer, status, region, acquisition_cost } = req.body;
        const vehicle = await Vehicle.findByPk(req.params.id);

        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        if (odometer !== undefined) vehicle.odometer = odometer;
        if (status) vehicle.status = status;
        if (region !== undefined) vehicle.region = region;
        if (acquisition_cost !== undefined) vehicle.acquisition_cost = acquisition_cost;

        await vehicle.save();
        res.json(vehicle);
    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({ message: error.message });
    }
};

// DELETE /api/vehicles/:id
const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findByPk(req.params.id);
        if (!vehicle) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }

        await vehicle.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { listVehicles, getVehicle, createVehicle, updateVehicle, deleteVehicle };
