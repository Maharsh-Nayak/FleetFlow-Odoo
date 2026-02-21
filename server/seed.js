const { Sequelize } = require('sequelize');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: process.env.DB_DIALECT || 'mysql',
        logging: false,
    }
);

const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const Trip = require('./models/Trip');
const MaintenanceLog = require('./models/MaintenanceLog');
const Expense = require('./models/Expense');

async function seedDatabase() {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected!');

        // Use sync with alter to update schema without losing data
        await sequelize.sync({ alter: true });
        console.log('✅ Database synced/updated!');

        // Hash passwords
        const hashedPassword = await bcrypt.hash('password123', 10);

        // Create Users
        console.log('🔄 Creating users...');
        const users = await User.bulkCreate([
            { name: 'Admin User', email: 'admin@fleetflow.com', password_hash: await bcrypt.hash('admin123', 10), role: 'MANAGER', status: 'ACTIVE' },
            { name: 'John Dispatcher', email: 'dispatcher@fleetflow.com', password_hash: hashedPassword, role: 'DISPATCHER', status: 'ACTIVE' },
            { name: 'Sarah Safety', email: 'safety@fleetflow.com', password_hash: hashedPassword, role: 'SAFETY', status: 'ACTIVE' },
            { name: 'Mike Finance', email: 'finance@fleetflow.com', password_hash: hashedPassword, role: 'FINANCE', status: 'ACTIVE' },
        ], { individualHooks: false });
        console.log(`✅ Created ${users.length} users`);

        // Create Vehicles
        console.log('🔄 Creating vehicles...');
        const vehicles = await Vehicle.bulkCreate([
            { model: 'Volvo FH16', license_plate: 'ABC-1234', vehicle_type: 'TRUCK', max_capacity_kg: 25000, acquisition_cost: 120000, odometer: 125000, status: 'AVAILABLE' },
            { model: 'Mercedes Actros', license_plate: 'DEF-5678', vehicle_type: 'TRUCK', max_capacity_kg: 20000, acquisition_cost: 110000, odometer: 98000, status: 'AVAILABLE' },
            { model: 'Ford Transit', license_plate: 'GHI-9012', vehicle_type: 'VAN', max_capacity_kg: 1500, acquisition_cost: 45000, odometer: 45000, status: 'AVAILABLE' },
            { model: 'Iveco Daily', license_plate: 'JKL-3456', vehicle_type: 'VAN', max_capacity_kg: 2000, acquisition_cost: 55000, odometer: 32000, status: 'AVAILABLE' },
            { model: 'Toyota Hilux', license_plate: 'MNO-7890', vehicle_type: 'CAR', max_capacity_kg: 800, acquisition_cost: 35000, odometer: 28000, status: 'AVAILABLE' },
            { model: 'Scania R500', license_plate: 'PQR-1111', vehicle_type: 'TRUCK', max_capacity_kg: 30000, acquisition_cost: 140000, odometer: 65000, status: 'IN_TRANSIT' },
            { model: 'MAN TGS', license_plate: 'STU-2222', vehicle_type: 'TRUCK', max_capacity_kg: 28000, acquisition_cost: 130000, odometer: 78000, status: 'IN_MAINTENANCE' },
            { model: 'Renault Master', license_plate: 'VWX-3333', vehicle_type: 'VAN', max_capacity_kg: 1800, acquisition_cost: 42000, odometer: 55000, status: 'AVAILABLE' },
        ]);
        console.log(`✅ Created ${vehicles.length} vehicles`);

        // Create Drivers
        console.log('🔄 Creating drivers...');
        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        
        const drivers = await Driver.bulkCreate([
            { name: 'James Wilson', license_number: 'DL-001234', license_expiry: nextYear.toISOString().split('T')[0], phone_number: '+1-555-0101', safety_score: 98, hire_date: '2022-03-15', status: 'AVAILABLE' },
            { name: 'Maria Garcia', license_number: 'DL-002345', license_expiry: nextYear.toISOString().split('T')[0], phone_number: '+1-555-0102', safety_score: 95, hire_date: '2021-08-20', status: 'AVAILABLE' },
            { name: 'Robert Chen', license_number: 'DL-003456', license_expiry: nextYear.toISOString().split('T')[0], phone_number: '+1-555-0103', safety_score: 92, hire_date: '2023-01-10', status: 'AVAILABLE' },
            { name: 'Lisa Thompson', license_number: 'DL-004567', license_expiry: lastMonth.toISOString().split('T')[0], phone_number: '+1-555-0104', safety_score: 88, hire_date: '2022-06-05', status: 'AVAILABLE' },
            { name: 'David Brown', license_number: 'DL-005678', license_expiry: nextYear.toISOString().split('T')[0], phone_number: '+1-555-0105', safety_score: 100, hire_date: '2020-11-20', status: 'AVAILABLE' },
            { name: 'Sarah Johnson', license_number: 'DL-006789', license_expiry: nextYear.toISOString().split('T')[0], phone_number: '+1-555-0106', safety_score: 97, hire_date: '2021-04-12', status: 'AVAILABLE' },
        ]);
        console.log(`✅ Created ${drivers.length} drivers`);

        // Create Trips
        console.log('🔄 Creating trips...');
        const trips = await Trip.bulkCreate([
            { vehicle_id: vehicles[5].id, driver_id: drivers[0].id, trip_date: new Date(), start_location: 'Warehouse A', end_location: 'Distribution Center B', start_odometer: 65000, cargo_weight_kg: 18000, expected_revenue: 2500, status: 'DISPATCHED' },
            { vehicle_id: vehicles[0].id, driver_id: drivers[1].id, trip_date: new Date(today - 2), start_location: 'Port Terminal', end_location: 'Warehouse C', start_odometer: 124000, cargo_weight_kg: 22000, expected_revenue: 3200, status: 'COMPLETED', end_odometer: 124850, distance: 850, revenue: 3200 },
            { vehicle_id: vehicles[1].id, driver_id: drivers[2].id, trip_date: new Date(today - 1), start_location: 'Factory X', end_location: 'Retail Store Y', start_odometer: 97700, cargo_weight_kg: 15000, expected_revenue: 1800, status: 'COMPLETED', end_odometer: 98400, distance: 700, revenue: 1800 },
            { vehicle_id: vehicles[2].id, driver_id: drivers[3].id, trip_date: new Date(today - 3), start_location: 'Hotel Central', end_location: 'Airport', start_odometer: 44900, cargo_weight_kg: 400, expected_revenue: 450, status: 'COMPLETED', end_odometer: 45100, distance: 200, revenue: 450 },
            { vehicle_id: vehicles[0].id, driver_id: drivers[4].id, trip_date: new Date(today - 5), start_location: 'Warehouse A', end_location: 'Warehouse B', start_odometer: 123000, cargo_weight_kg: 24000, expected_revenue: 2800, status: 'COMPLETED', end_odometer: 124000, distance: 1000, revenue: 2800 },
            { vehicle_id: vehicles[3].id, driver_id: drivers[5].id, trip_date: new Date(today - 1), start_location: 'City Center', end_location: 'Suburbs', start_odometer: 31800, cargo_weight_kg: 1200, expected_revenue: 650, status: 'COMPLETED', end_odometer: 32200, distance: 400, revenue: 650 },
            { vehicle_id: vehicles[4].id, driver_id: drivers[0].id, trip_date: new Date(), start_location: 'Office HQ', end_location: 'Client Site', start_odometer: 27800, cargo_weight_kg: 0, expected_revenue: 0, status: 'DRAFT' },
        ]);
        console.log(`✅ Created ${trips.length} trips`);

        // Create Maintenance Logs
        console.log('🔄 Creating maintenance logs...');
        const maintenanceLogs = await MaintenanceLog.bulkCreate([
            { vehicle_id: vehicles[6].id, maintenance_type: 'OIL_CHANGE', maintenance_date: new Date(), odometer_reading: 78000, description: 'Regular oil change and filter replacement', cost: 350, status: 'PENDING' },
            { vehicle_id: vehicles[2].id, maintenance_type: 'TIRE_ROTATION', maintenance_date: new Date(today - 7), odometer_reading: 44000, description: 'Tire rotation and balance', cost: 150, status: 'COMPLETED' },
            { vehicle_id: vehicles[0].id, maintenance_type: 'BRAKE_SERVICE', maintenance_date: new Date(today - 14), odometer_reading: 122000, description: 'Brake pad replacement', cost: 800, status: 'COMPLETED' },
            { vehicle_id: vehicles[1].id, maintenance_type: 'INSPECTION', maintenance_date: new Date(today - 30), odometer_reading: 95000, description: 'Annual inspection', cost: 200, status: 'COMPLETED' },
        ]);
        console.log(`✅ Created ${maintenanceLogs.length} maintenance logs`);

        // Create Expenses
        console.log('🔄 Creating expenses...');
        const expenses = await Expense.bulkCreate([
            { vehicle_id: vehicles[0].id, trip_id: trips[1].id, expense_date: new Date(today - 2), description: 'Fuel', amount: 450, reference_number: 'F-001' },
            { vehicle_id: vehicles[1].id, trip_id: trips[2].id, expense_date: new Date(today - 1), description: 'Fuel', amount: 380, reference_number: 'F-002' },
            { vehicle_id: vehicles[2].id, trip_id: trips[3].id, expense_date: new Date(today - 3), description: 'Fuel', amount: 120, reference_number: 'F-003' },
            { vehicle_id: vehicles[0].id, trip_id: trips[4].id, expense_date: new Date(today - 5), description: 'Fuel', amount: 520, reference_number: 'F-004' },
            { vehicle_id: vehicles[3].id, trip_id: trips[5].id, expense_date: new Date(today - 1), description: 'Fuel', amount: 180, reference_number: 'F-005' },
            { vehicle_id: vehicles[0].id, expense_date: new Date(today - 10), description: 'Toll', amount: 85, reference_number: 'T-001' },
            { vehicle_id: vehicles[1].id, expense_date: new Date(today - 15), description: 'Parking', amount: 45, reference_number: 'P-001' },
            { vehicle_id: vehicles[2].id, expense_date: new Date(today - 8), description: 'Toll', amount: 60, reference_number: 'T-002' },
        ]);
        console.log(`✅ Created ${expenses.length} expenses`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Login credentials:');
        console.log('   Manager: admin@fleetflow.com / admin123');
        console.log('   Dispatcher: dispatcher@fleetflow.com / dispatch123');
        console.log('   Safety: safety@fleetflow.com / safety123');
        console.log('   Finance: finance@fleetflow.com / finance123');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await sequelize.close();
    }
}

seedDatabase();
