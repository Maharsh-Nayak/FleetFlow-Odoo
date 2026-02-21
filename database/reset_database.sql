-- FleetFlow Database Reset Script
-- WARNING: This will delete ALL data and recreate tables from scratch

USE fleetflow;

-- Drop all tables in correct order (respecting foreign key constraints)
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS fuel_logs;
DROP TABLE IF EXISTS maintenance_logs;
DROP TABLE IF EXISTS trips;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS users;

-- Now the database is clean and ready for Sequelize to create tables
-- Just restart the server with: npm run dev
