-- MySQL Database Schema for FleetFlow
-- Fleet Management System

CREATE DATABASE IF NOT EXISTS fleetflow;
USE fleetflow;

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('MANAGER', 'DISPATCHER', 'MECHANIC', 'FINANCE', 'VIEWER') NOT NULL DEFAULT 'DISPATCHER',
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- ============================================================================
-- VEHICLES TABLE
-- ============================================================================
CREATE TABLE vehicles (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    model VARCHAR(100) NOT NULL,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type ENUM('TRUCK', 'VAN', 'CAR', 'TRAILER', 'CONTAINER') NOT NULL,
    max_capacity_kg DECIMAL(10, 2) NOT NULL,
    acquisition_cost DECIMAL(12, 2),
    odometer DECIMAL(10, 2) DEFAULT 0,
    status ENUM('AVAILABLE', 'IN_TRANSIT', 'IN_MAINTENANCE', 'INACTIVE') DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_license_plate (license_plate),
    INDEX idx_status (status)
);

-- ============================================================================
-- DRIVERS TABLE
-- ============================================================================
CREATE TABLE drivers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    phone_number VARCHAR(20),
    safety_score DECIMAL(5, 2) DEFAULT 100,
    hire_date DATE NOT NULL,
    status ENUM('ACTIVE', 'SUSPENDED', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_license_number (license_number),
    INDEX idx_license_expiry (license_expiry),
    CHECK (safety_score >= 0 AND safety_score <= 100)
);

-- ============================================================================
-- TRIPS TABLE
-- ============================================================================
CREATE TABLE trips (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vehicle_id CHAR(36) NOT NULL,
    driver_id CHAR(36) NOT NULL,
    trip_date DATE NOT NULL,
    start_location VARCHAR(255) NOT NULL,
    end_location VARCHAR(255) NOT NULL,
    start_odometer DECIMAL(10, 2) NOT NULL,
    end_odometer DECIMAL(10, 2),
    distance DECIMAL(10, 2),
    cargo_weight_kg DECIMAL(10, 2),
    expected_revenue DECIMAL(12, 2),
    revenue DECIMAL(12, 2),
    calculated_efficiency DECIMAL(10, 2),
    status ENUM('DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED') DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_trip_date (trip_date),
    INDEX idx_status (status)
);

-- ============================================================================
-- MAINTENANCE_LOGS TABLE
-- ============================================================================
CREATE TABLE maintenance_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vehicle_id CHAR(36) NOT NULL,
    maintenance_type ENUM('OIL_CHANGE', 'TIRE_REPLACEMENT', 'BRAKE_SERVICE', 'ENGINE_REPAIR', 'INSPECTION', 'OTHER') NOT NULL,
    maintenance_date DATE NOT NULL,
    odometer_reading DECIMAL(10, 2),
    description TEXT,
    cost DECIMAL(12, 2) DEFAULT 0,
    status ENUM('PENDING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_maintenance_date (maintenance_date),
    INDEX idx_status (status)
);

-- ============================================================================
-- FUEL_LOGS TABLE
-- ============================================================================
CREATE TABLE fuel_logs (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vehicle_id CHAR(36) NOT NULL,
    fuel_date DATE NOT NULL,
    liters DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    odometer_reading DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_fuel_date (fuel_date)
);

-- ============================================================================
-- EXPENSES TABLE
-- ============================================================================
CREATE TABLE expenses (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    vehicle_id CHAR(36) NOT NULL,
    trip_id CHAR(36),
    expense_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE RESTRICT,
    INDEX idx_vehicle_id (vehicle_id),
    INDEX idx_trip_id (trip_id),
    INDEX idx_expense_date (expense_date)
);

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert seed users
INSERT INTO users (username, email, password_hash, role, status) VALUES
('manager1', 'manager@fleetflow.local', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'MANAGER', 'ACTIVE'),
('dispatcher1', 'dispatcher@fleetflow.local', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'DISPATCHER', 'ACTIVE'),
('mechanic1', 'mechanic@fleetflow.local', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'MECHANIC', 'ACTIVE'),
('finance1', 'finance@fleetflow.local', '$2b$10$abcdefghijklmnopqrstuvwxyz', 'FINANCE', 'ACTIVE');

-- Insert seed vehicles
INSERT INTO vehicles (model, license_plate, vehicle_type, max_capacity_kg, acquisition_cost, odometer, status) VALUES
('Volvo FH16', 'AB-1001', 'TRUCK', 25000, 150000, 85000, 'AVAILABLE'),
('Mercedes Sprinter', 'CD-2001', 'VAN', 3500, 45000, 42000, 'AVAILABLE'),
('Toyota Hiace', 'EF-3001', 'VAN', 2000, 35000, 28000, 'IN_TRANSIT'),
('Scania R440', 'GH-4001', 'TRUCK', 30000, 180000, 125000, 'AVAILABLE'),
('MAN TGX', 'IJ-5001', 'TRUCK', 26000, 160000, 95000, 'IN_MAINTENANCE');

-- Insert seed drivers
INSERT INTO drivers (name, license_number, license_expiry, phone_number, safety_score, hire_date, status) VALUES
('John Smith', 'DL-001', '2027-12-31', '+1-555-0101', 95, '2020-01-15', 'ACTIVE'),
('Maria Garcia', 'DL-002', '2026-06-30', '+1-555-0102', 88, '2021-03-20', 'ACTIVE'),
('Ahmed Hassan', 'DL-003', '2025-09-15', '+1-555-0103', 92, '2019-06-10', 'ACTIVE'),
('Sarah Johnson', 'DL-004', '2024-11-20', '+1-555-0104', 85, '2022-02-14', 'SUSPENDED'),
('Robert Chen', 'DL-005', '2027-04-05', '+1-555-0105', 90, '2020-08-22', 'ACTIVE');

-- Insert seed trips
INSERT INTO trips (vehicle_id, driver_id, trip_date, start_location, end_location, start_odometer, end_odometer, distance, cargo_weight_kg, expected_revenue, revenue, calculated_efficiency, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', '650e8400-e29b-41d4-a716-446655440001', '2024-02-15', 'New York', 'Boston', 85000, 85320, 320, 12000, 1200, 1200, 18.5, 'COMPLETED'),
('550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', '2024-02-16', 'Boston', 'Philadelphia', 42000, 42280, 280, 2800, 800, 800, 28.3, 'COMPLETED');

-- Note: UUIDs above are examples. In practice, the database will generate real UUIDs.
