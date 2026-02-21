const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/report.controller');
const auth = require('../middleware/auth');

router.get('/financial-summary', auth, getFinancialSummary);
router.get('/fuel-efficiency', auth, getFuelEfficiency);
router.get('/top-costliest', auth, getTopCostliestVehicles);
router.get('/driver-performance', auth, getDriverPerformance);
router.get('/fleet-utilization', auth, getFleetUtilization);
router.get('/export-csv', auth, exportCSV);
router.get('/expense-breakdown', auth, getExpenseBreakdown);
router.get('/monthly-trends', auth, getMonthlyTrends);
router.get('/vehicle-performance', auth, getVehiclePerformance);
router.get('/trip-analysis', auth, getTripAnalysis);
router.get('/maintenance-analysis', auth, getMaintenanceAnalysis);

module.exports = router;
