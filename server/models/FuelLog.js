const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const FuelLog = sequelize.define('FuelLog', {
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
    fuel_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    liters: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    cost: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    odometer_reading: {
        type: DataTypes.DECIMAL(10, 2),
    },
}, {
    tableName: 'fuel_logs',
    timestamps: true,
    underscored: true,
});

module.exports = FuelLog;
