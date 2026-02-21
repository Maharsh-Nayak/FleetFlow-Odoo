const Trip = require('../models/Trip');
const FuelLog = require('../models/FuelLog');
const Expense = require('../models/Expense');
const MaintenanceLog = require('../models/MaintenanceLog');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const { sequelize } = require('../config/db');

// GET /api/reports/financial-summary
const getFinancialSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const where = {};

        if (startDate && endDate) {
            where.trip_date = {
                [sequelize.Sequelize.Op.between]: [new Date(startDate), new Date(endDate)],
            };
        }

        const completedTrips = await Trip.findAll({ where: { ...where, status: 'COMPLETED' } });
        const totalRevenue = completedTrips.reduce((sum, trip) => sum + (trip.revenue || 0), 0);

        const fuelLogs = await FuelLog.findAll();
        const totalFuelCost = fuelLogs.reduce((sum, fuel) => sum + (fuel.cost || 0), 0);

        const expenses = await Expense.findAll();
        const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        const maintenance = await MaintenanceLog.findAll({ where: { status: 'COMPLETED' } });
        const totalMaintenance = maintenance.reduce((sum, maint) => sum + (maint.cost || 0), 0);

        const netProfit = totalRevenue - (totalFuelCost + totalExpenses + totalMaintenance);

        res.json({
            totalRevenue,
            totalFuelCost,
            totalExpenses,
            totalMaintenance,
            netProfit,
            period: { startDate, endDate },
        });
    } catch (error) {
        console.error('Financial summary error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/fuel-efficiency
const getFuelEfficiency = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll({ attributes: ['id', 'model', 'license_plate'] });
        const efficiency = [];

        for (const vehicle of vehicles) {
            const trips = await Trip.findAll({ where: { vehicle_id: vehicle.id, status: 'COMPLETED' } });
            const fuelLogs = await FuelLog.findAll({ where: { vehicle_id: vehicle.id } });

            const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
            const totalFuel = fuelLogs.reduce((sum, fuel) => sum + (fuel.liters || 0), 0);

            const kmPerLiter = totalFuel > 0 ? totalDistance / totalFuel : 0;

            efficiency.push({
                vehicle_id: vehicle.id,
                model: vehicle.model,
                license_plate: vehicle.license_plate,
                km_per_liter: Math.round(kmPerLiter * 100) / 100,
                total_distance: totalDistance,
                total_fuel: totalFuel,
            });
        }

        res.json(efficiency);
    } catch (error) {
        console.error('Fuel efficiency error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/top-costliest
const getTopCostliestVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll();
        const costs = [];

        for (const vehicle of vehicles) {
            const maintenance = await MaintenanceLog.findAll({ where: { vehicle_id: vehicle.id } });
            const fuelLogs = await FuelLog.findAll({ where: { vehicle_id: vehicle.id } });
            const expenses = await Expense.findAll({ where: { vehicle_id: vehicle.id } });

            const maintenanceCost = maintenance.reduce((sum, m) => sum + (m.cost || 0), 0);
            const fuelCost = fuelLogs.reduce((sum, f) => sum + (f.cost || 0), 0);
            const expenseCost = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            const totalCost = maintenanceCost + fuelCost + expenseCost;

            costs.push({
                vehicle_id: vehicle.id,
                model: vehicle.model,
                license_plate: vehicle.license_plate,
                maintenance_cost: maintenanceCost,
                fuel_cost: fuelCost,
                other_expenses: expenseCost,
                total_cost: totalCost,
            });
        }

        costs.sort((a, b) => b.total_cost - a.total_cost);
        res.json(costs.slice(0, 10));
    } catch (error) {
        console.error('Top costliest vehicles error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/driver-performance
const getDriverPerformance = async (req, res) => {
    try {
        const drivers = await Driver.findAll();
        const performance = [];

        for (const driver of drivers) {
            const trips = await Trip.findAll({ where: { driver_id: driver.id } });
            const completedTrips = trips.filter(t => t.status === 'COMPLETED');
            const completionRate = trips.length > 0 ? (completedTrips.length / trips.length) * 100 : 0;

            performance.push({
                driver_id: driver.id,
                name: driver.name,
                total_trips: trips.length,
                completed_trips: completedTrips.length,
                completion_rate: Math.round(completionRate),
                safety_score: driver.safety_score,
                status: driver.status,
            });
        }

        res.json(performance);
    } catch (error) {
        console.error('Driver performance error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/fleet-utilization
const getFleetUtilization = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll();
        const today = new Date();

        let activeCount = 0;
        let inTransitCount = 0;
        let maintenanceCount = 0;

        for (const vehicle of vehicles) {
            if (vehicle.status === 'IN_TRANSIT') inTransitCount++;
            else if (vehicle.status === 'IN_MAINTENANCE') maintenanceCount++;
            else if (vehicle.status === 'AVAILABLE') activeCount++;
        }

        const utilizationRate = vehicles.length > 0 ? ((inTransitCount + activeCount) / vehicles.length) * 100 : 0;

        res.json({
            total_vehicles: vehicles.length,
            active_vehicles: activeCount,
            in_transit_vehicles: inTransitCount,
            in_maintenance_vehicles: maintenanceCount,
            utilization_rate: Math.round(utilizationRate),
        });
    } catch (error) {
        console.error('Fleet utilization error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/export-csv
const exportCSV = async (req, res) => {
    try {
        const trips = await Trip.findAll({ where: { status: 'COMPLETED' } });

        let csv = 'Trip ID,Vehicle ID,Driver ID,Date,Start,End,Distance,Cargo (kg),Revenue\n';
        trips.forEach(trip => {
            csv += `${trip.id},${trip.vehicle_id},${trip.driver_id},${trip.trip_date},${trip.start_location},${trip.end_location},${trip.distance},${trip.cargo_weight_kg},${trip.revenue}\n`;
        });

        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="fleetflow_trips.csv"');
        res.send(csv);
    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getFinancialSummary,
    getFuelEfficiency,
    getTopCostliestVehicles,
    getDriverPerformance,
    getFleetUtilization,
    exportCSV,
};
