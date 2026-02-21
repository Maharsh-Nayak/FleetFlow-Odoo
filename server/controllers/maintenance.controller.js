const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');

// GET /api/maintenance
const listMaintenance = async (req, res) => {
    try {
        const { vehicle_id, status, limit = 10, offset = 0 } = req.query;
        const where = {};

        if (vehicle_id) where.vehicle_id = vehicle_id;
        if (status) where.status = status;

        const { count, rows } = await MaintenanceLog.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['maintenance_date', 'DESC']],
        });

        res.json({
            data: rows,
            total: count,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (error) {
        console.error('List maintenance error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/maintenance/:id
const getMaintenance = async (req, res) => {
    try {
        const maintenance = await MaintenanceLog.findByPk(req.params.id);
        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance log not found' });
        }
        res.json(maintenance);
    } catch (error) {
        console.error('Get maintenance error:', error);
        res.status(500).json({ message: error.message });
    }
};

// POST /api/maintenance
const createMaintenance = async (req, res) => {
    try {
        const {
            vehicle_id,
            maintenance_type,
            maintenance_date,
            odometer_reading,
            description,
            cost,
        } = req.body;

        if (!vehicle_id || !maintenance_type || !maintenance_date) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Update vehicle status to IN_MAINTENANCE
        await Vehicle.update({ status: 'IN_MAINTENANCE' }, { where: { id: vehicle_id } });

        const maintenance = await MaintenanceLog.create({
            vehicle_id,
            maintenance_type,
            maintenance_date,
            odometer_reading,
            description,
            cost: cost || 0,
            status: 'PENDING',
        });

        res.status(201).json(maintenance);
    } catch (error) {
        console.error('Create maintenance error:', error);
        res.status(500).json({ message: error.message });
    }
};

// PATCH /api/maintenance/:id/complete
const completeMaintenance = async (req, res) => {
    try {
        const maintenance = await MaintenanceLog.findByPk(req.params.id);
        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance log not found' });
        }

        if (maintenance.status !== 'PENDING') {
            return res.status(400).json({ message: 'Maintenance cannot be completed' });
        }

        // Update vehicle status back to AVAILABLE
        await Vehicle.update({ status: 'AVAILABLE' }, { where: { id: maintenance.vehicle_id } });

        maintenance.status = 'COMPLETED';
        await maintenance.save();

        res.json(maintenance);
    } catch (error) {
        console.error('Complete maintenance error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { listMaintenance, getMaintenance, createMaintenance, completeMaintenance };
