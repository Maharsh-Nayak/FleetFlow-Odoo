const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MaintenanceLog = sequelize.define('MaintenanceLog', {
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
    maintenance_type: {
        type: DataTypes.ENUM('OIL_CHANGE', 'TIRE_ROTATION', 'TIRE_REPLACEMENT', 'BRAKE_SERVICE', 'ENGINE_REPAIR', 'INSPECTION', 'OTHER'),
        allowNull: false,
    },
    maintenance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    odometer_reading: {
        type: DataTypes.DECIMAL(10, 2),
    },
    description: {
        type: DataTypes.TEXT,
    },
    cost: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'PENDING',
    },
}, {
    tableName: 'maintenance_logs',
    timestamps: true,
    underscored: true,
});

module.exports = MaintenanceLog;
