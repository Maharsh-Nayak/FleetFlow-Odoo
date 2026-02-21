const Trip = require('../models/Trip');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { sequelize } = require('../config/db');

// GET /api/trips
const listTrips = async (req, res) => {
    try {
        const { status, vehicle_id, driver_id, limit = 10, offset = 0 } = req.query;
        const where = {};

        if (status) where.status = status;
        if (vehicle_id) where.vehicle_id = vehicle_id;
        if (driver_id) where.driver_id = driver_id;

        const { count, rows } = await Trip.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['trip_date', 'DESC']],
        });

        res.json({
            data: rows,
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (error) {
        console.error('List trips error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/trips/:id
const getTrip = async (req, res) => {
    try {
        const trip = await Trip.findByPk(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }
        res.json(trip);
    } catch (error) {
        console.error('Get trip error:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/trips
const createTrip = async (req, res) => {
    try {
        const {
            vehicle_id,
            driver_id,
            start_location,
            end_location,
            start_odometer,
            cargo_weight_kg,
            expected_revenue,
        } = req.body;

        if (!vehicle_id || !driver_id || !start_location || !end_location) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Validate vehicle availability
        const vehicle = await Vehicle.findByPk(vehicle_id);
        if (!vehicle || vehicle.status !== 'AVAILABLE') {
            return res.status(400).json({ message: 'Vehicle not available' });
        }

        // Validate driver license not expired
        const driver = await Driver.findByPk(driver_id);
        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        const today = new Date();
        if (new Date(driver.license_expiry) < today) {
            return res.status(400).json({ message: 'Driver license expired' });
        }

        const trip = await Trip.create({
            vehicle_id,
            driver_id,
            trip_date: new Date(),
            start_location,
            end_location,
            start_odometer,
            cargo_weight_kg,
            expected_revenue,
            status: 'DRAFT',
        });

        res.status(201).json(trip);
    } catch (error) {
        console.error('Create trip error:', error);
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/trips/:id/dispatch
const dispatchTrip = async (req, res) => {
    try {
        const trip = await Trip.findByPk(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.status !== 'DRAFT') {
            return res.status(400).json({ message: 'Trip cannot be dispatched' });
        }

        // Update vehicle status
        await Vehicle.update({ status: 'IN_TRANSIT' }, { where: { id: trip.vehicle_id } });

        trip.status = 'DISPATCHED';
        await trip.save();

        res.json(trip);
    } catch (error) {
        console.error('Dispatch trip error:', error);
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/trips/:id/complete
const completeTrip = async (req, res) => {
    try {
        const { end_odometer, actual_revenue } = req.body;

        if (!end_odometer) {
            return res.status(400).json({ message: 'End odometer required' });
        }

        const trip = await Trip.findByPk(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.status !== 'DISPATCHED') {
            return res.status(400).json({ message: 'Trip cannot be completed' });
        }

        const distance = end_odometer - trip.start_odometer;
        if (distance <= 0) {
            return res.status(400).json({ message: 'End odometer must be greater than start odometer' });
        }

        // Update vehicle status and odometer
        await Vehicle.update(
            { status: 'AVAILABLE', odometer: end_odometer },
            { where: { id: trip.vehicle_id } }
        );

        trip.status = 'COMPLETED';
        trip.end_odometer = end_odometer;
        trip.distance = distance;
        trip.revenue = actual_revenue || trip.expected_revenue;
        trip.calculated_efficiency = trip.cargo_weight_kg ? (distance / (trip.cargo_weight_kg / 1000)) : 0;

        await trip.save();

        res.json(trip);
    } catch (error) {
        console.error('Complete trip error:', error);
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/trips/:id/cancel
const cancelTrip = async (req, res) => {
    try {
        const trip = await Trip.findByPk(req.params.id);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
            return res.status(400).json({ message: 'Trip cannot be cancelled' });
        }

        // Reset vehicle status if it was in transit
        if (trip.status === 'DISPATCHED') {
            await Vehicle.update({ status: 'AVAILABLE' }, { where: { id: trip.vehicle_id } });
        }

        trip.status = 'CANCELLED';
        await trip.save();

        res.json(trip);
    } catch (error) {
        console.error('Cancel trip error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { listTrips, getTrip, createTrip, dispatchTrip, completeTrip, cancelTrip };
