const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Vehicle = sequelize.define('Vehicle', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    model: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    license_plate: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
    },
    vehicle_type: {
        type: DataTypes.ENUM('TRUCK', 'VAN', 'CAR', 'TRAILER', 'CONTAINER'),
        allowNull: false,
    },
    max_capacity_kg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    acquisition_cost: {
        type: DataTypes.DECIMAL(12, 2),
    },
    odometer: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('AVAILABLE', 'IN_TRANSIT', 'IN_MAINTENANCE', 'INACTIVE'),
        defaultValue: 'AVAILABLE',
    },
}, {
    tableName: 'vehicles',
    timestamps: true,
    underscored: true,
});

module.exports = Vehicle;
