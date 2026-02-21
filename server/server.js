require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

// Import models
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const MaintenanceLog = require('./models/MaintenanceLog');
const FuelLog = require('./models/FuelLog');
const Expense = require('./models/Expense');

// Import routes
const authRoutes = require('./routes/auth.routes');
const vehicleRoutes = require('./routes/vehicle.routes');
const driverRoutes = require('./routes/driver.routes');
const tripRoutes = require('./routes/trip.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const fuelRoutes = require('./routes/fuel.routes');
const expenseRoutes = require('./routes/expense.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Dashboard KPIs
app.get('/api/dashboard/kpis', require('./middleware/auth'), async (req, res) => {
    try {
        const totalVehicles = await Vehicle.count();
        const availableVehicles = await Vehicle.count({ where: { status: 'AVAILABLE' } });
        const inTransitVehicles = await Vehicle.count({ where: { status: 'IN_TRANSIT' } });
        const completedTrips = await Trip.count({ where: { status: 'COMPLETED' } });

        const { Sequelize } = require('sequelize');
        const expenses = await Expense.sum('amount') || 0;
        const fuelLogs = await FuelLog.sum('liters') || 0;

        res.json({
            totalVehicles,
            availableVehicles,
            inTransitVehicles,
            completedTrips,
            totalExpenses: expenses,
            totalFuelConsumed: fuelLogs,
            utilizationRate: totalVehicles > 0 ? ((inTransitVehicles / totalVehicles) * 100).toFixed(2) : 0,
        });
    } catch (error) {
        console.error('Dashboard KPIs error:', error);
        res.status(500).json({ message: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Start server
const start = async () => {
    try {
        await sequelize.authenticate();
        console.log('✓ MySQL connected');

        // Set up associations
        Vehicle.hasMany(Trip, { foreignKey: 'vehicle_id' });
        Vehicle.hasMany(MaintenanceLog, { foreignKey: 'vehicle_id' });
        Vehicle.hasMany(FuelLog, { foreignKey: 'vehicle_id' });
        Vehicle.hasMany(Expense, { foreignKey: 'vehicle_id' });

        Driver.hasMany(Trip, { foreignKey: 'driver_id' });

        Trip.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });
        Trip.belongsTo(Driver, { foreignKey: 'driver_id' });
        Trip.hasMany(Expense, { foreignKey: 'trip_id' });

        MaintenanceLog.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });
        FuelLog.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });
        Expense.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });
        Expense.belongsTo(Trip, { foreignKey: 'trip_id' });

        await sequelize.sync({ alter: true });
        console.log('✓ Database synced');

        app.listen(PORT, () => {
            console.log(`✓ FleetFlow API running on http://localhost:${PORT}`);
            console.log(`✓ API documentation available at /api/health`);
        });
    } catch (error) {
        console.error('✗ Failed to start server:', error);
        process.exit(1);
    }
};

start();

module.exports = app;
