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

        const expenses = await Expense.findAll();
        const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

        const maintenance = await MaintenanceLog.findAll({ where: { status: 'COMPLETED' } });
        const totalMaintenance = maintenance.reduce((sum, maint) => sum + (maint.cost || 0), 0);

        const netProfit = totalRevenue - (totalExpenses + totalMaintenance);

        res.json({
            totalRevenue,
            totalFuelCost: 0,
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

            const totalDistance = trips.reduce((sum, trip) => sum + (trip.distance || 0), 0);
            const totalTrips = trips.length;

            efficiency.push({
                vehicle_id: vehicle.id,
                model: vehicle.model,
                license_plate: vehicle.license_plate,
                km_per_trip: totalTrips > 0 ? Math.round((totalDistance / totalTrips) * 100) / 100 : 0,
                total_distance: totalDistance,
                total_trips: totalTrips,
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

// GET /api/reports/expense-breakdown
const getExpenseBreakdown = async (req, res) => {
    try {
        const expenses = await Expense.findAll();
        
        const byCategory = {};
        const byVehicle = {};
        const byMonth = {};
        
        expenses.forEach(exp => {
            const category = exp.description || 'Other';
            byCategory[category] = (byCategory[category] || 0) + parseFloat(exp.amount || 0);
            
            if (exp.vehicle_id) {
                byVehicle[exp.vehicle_id] = (byVehicle[exp.vehicle_id] || 0) + parseFloat(exp.amount || 0);
            }
            
            if (exp.expense_date) {
                const month = exp.expense_date.substring(0, 7);
                byMonth[month] = (byMonth[month] || 0) + parseFloat(exp.amount || 0);
            }
        });

        const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

        const categoryData = Object.entries(byCategory).map(([name, value]) => ({
            name,
            value: Math.round(value),
            percentage: Math.round((value / totalExpenses) * 100) || 0
        })).sort((a, b) => b.value - a.value);

        res.json({
            total: totalExpenses,
            byCategory: categoryData,
            byMonth: Object.entries(byMonth).map(([month, amount]) => ({ month, amount })).sort((a, b) => a.month.localeCompare(b.month)),
            expenseCount: expenses.length,
        });
    } catch (error) {
        console.error('Expense breakdown error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/monthly-trends
const getMonthlyTrends = async (req, res) => {
    try {
        const trips = await Trip.findAll({ where: { status: 'COMPLETED' } });
        const maintenance = await MaintenanceLog.findAll({ where: { status: 'COMPLETED' } });
        
        const monthlyData = {};
        
        trips.forEach(trip => {
            if (trip.trip_date) {
                const month = trip.trip_date.substring(0, 7);
                if (!monthlyData[month]) {
                    monthlyData[month] = { revenue: 0, trips: 0, distance: 0 };
                }
                monthlyData[month].revenue += parseFloat(trip.revenue || 0);
                monthlyData[month].trips += 1;
                monthlyData[month].distance += parseFloat(trip.distance || 0);
            }
        });

        maintenance.forEach(m => {
            if (m.maintenance_date) {
                const month = m.maintenance_date.substring(0, 7);
                if (!monthlyData[month]) {
                    monthlyData[month] = { revenue: 0, trips: 0, distance: 0, maintenance: 0 };
                }
                monthlyData[month].maintenance = (monthlyData[month].maintenance || 0) + parseFloat(m.cost || 0);
            }
        });

        const trends = Object.entries(monthlyData)
            .map(([month, data]) => ({ month, ...data }))
            .sort((a, b) => a.month.localeCompare(b.month))
            .slice(-12);

        res.json(trends);
    } catch (error) {
        console.error('Monthly trends error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/vehicle-performance
const getVehiclePerformance = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll();
        const performance = [];

        for (const vehicle of vehicles) {
            const trips = await Trip.findAll({ where: { vehicle_id: vehicle.id, status: 'COMPLETED' } });
            const maintenance = await MaintenanceLog.findAll({ where: { vehicle_id: vehicle.id } });
            const fuelLogs = await FuelLog.findAll({ where: { vehicle_id: vehicle.id } });
            const expenses = await Expense.findAll({ where: { vehicle_id: vehicle.id } });

            const totalRevenue = trips.reduce((sum, t) => sum + (parseFloat(t.revenue) || 0), 0);
            const totalDistance = trips.reduce((sum, t) => sum + (parseFloat(t.distance) || 0), 0);
            const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0);
            const totalFuelCost = fuelLogs.reduce((sum, f) => sum + (parseFloat(f.cost) || 0), 0);
            const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
            const totalCost = totalMaintenanceCost + totalFuelCost + totalExpenses;

            performance.push({
                id: vehicle.id,
                model: vehicle.model,
                license_plate: vehicle.license_plate,
                status: vehicle.status,
                totalTrips: trips.length,
                totalRevenue,
                totalDistance,
                totalCost,
                netProfit: totalRevenue - totalCost,
                fuelEfficiency: totalDistance > 0 && totalFuelCost > 0 ? Math.round((totalDistance / totalFuelCost) * 100) / 100 : 0,
                avgRevenuePerTrip: trips.length > 0 ? Math.round(totalRevenue / trips.length) : 0,
            });
        }

        res.json(performance.sort((a, b) => b.netProfit - a.netProfit));
    } catch (error) {
        console.error('Vehicle performance error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/trip-analysis
const getTripAnalysis = async (req, res) => {
    try {
        const trips = await Trip.findAll();
        
        const statusBreakdown = {};
        const routeAnalysis = {};
        
        trips.forEach(trip => {
            statusBreakdown[trip.status] = (statusBreakdown[trip.status] || 0) + 1;
            
            if (trip.start_location && trip.end_location) {
                const route = `${trip.start_location} → ${trip.end_location}`;
                if (!routeAnalysis[route]) {
                    routeAnalysis[route] = { count: 0, revenue: 0, distance: 0 };
                }
                routeAnalysis[route].count += 1;
                routeAnalysis[route].revenue += parseFloat(trip.revenue || 0);
                routeAnalysis[route].distance += parseFloat(trip.distance || 0);
            }
        });

        const totalTrips = trips.length;
        const completedTrips = statusBreakdown.COMPLETED || 0;
        const completionRate = totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0;

        res.json({
            totalTrips,
            completedTrips,
            cancelledTrips: statusBreakdown.CANCELLED || 0,
            inTransitTrips: statusBreakdown.IN_TRANSIT || 0,
            draftTrips: statusBreakdown.DRAFT || 0,
            dispatchedTrips: statusBreakdown.DISPATCHED || 0,
            completionRate,
            topRoutes: Object.entries(routeAnalysis)
                .map(([route, data]) => ({ route, ...data }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10),
        });
    } catch (error) {
        console.error('Trip analysis error:', error);
        res.status(500).json({ message: error.message });
    }
};

// GET /api/reports/maintenance-analysis
const getMaintenanceAnalysis = async (req, res) => {
    try {
        const maintenance = await MaintenanceLog.findAll();
        const vehicles = await Vehicle.findAll();
        
        const byType = {};
        const byMonth = {};
        const totalCost = maintenance.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0);
        
        maintenance.forEach(m => {
            byType[m.maintenance_type] = (byType[m.maintenance_type] || 0) + 1;
            
            if (m.maintenance_date) {
                const month = m.maintenance_date.substring(0, 7);
                byMonth[month] = (byMonth[month] || 0) + parseFloat(m.cost || 0);
            }
        });

        const pendingCount = maintenance.filter(m => m.status === 'PENDING').length;
        const completedCount = maintenance.filter(m => m.status === 'COMPLETED').length;

        res.json({
            totalRecords: maintenance.length,
            totalCost,
            pendingCount,
            completedCount,
            byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
            byMonth: Object.entries(byMonth).map(([month, cost]) => ({ month, cost })).sort((a, b) => a.month.localeCompare(b.month)),
            avgCostPerService: maintenance.length > 0 ? Math.round(totalCost / maintenance.length) : 0,
        });
    } catch (error) {
        console.error('Maintenance analysis error:', error);
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
    getExpenseBreakdown,
    getMonthlyTrends,
    getVehiclePerformance,
    getTripAnalysis,
    getMaintenanceAnalysis,
};
