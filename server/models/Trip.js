const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Trip = sequelize.define('Trip', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    vehicle_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'vehicles',
            key: 'id',
        },
    },
    driver_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'drivers',
            key: 'id',
        },
    },
    trip_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    start_location: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    end_location: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    start_odometer: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    end_odometer: {
        type: DataTypes.DECIMAL(10, 2),
    },
    distance: {
        type: DataTypes.DECIMAL(10, 2),
    },
    cargo_weight_kg: {
        type: DataTypes.DECIMAL(10, 2),
    },
    expected_revenue: {
        type: DataTypes.DECIMAL(12, 2),
    },
    revenue: {
        type: DataTypes.DECIMAL(12, 2),
    },
    calculated_efficiency: {
        type: DataTypes.DECIMAL(10, 2),
    },
    status: {
        type: DataTypes.ENUM('DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'DRAFT',
    },
}, {
    tableName: 'trips',
    timestamps: true,
    underscored: true,
});

module.exports = Trip;
