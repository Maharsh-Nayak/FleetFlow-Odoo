const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Driver = sequelize.define('Driver', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    license_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    license_expiry: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    license_category: {
        type: DataTypes.ENUM('LMV', 'CMV', 'HCV', 'ALL'),
        defaultValue: 'ALL',
    },
    phone_number: {
        type: DataTypes.STRING(20),
    },
    safety_score: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 100,
        validate: {
            min: 0,
            max: 100,
        },
    },
    hire_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'SUSPENDED'),
        defaultValue: 'AVAILABLE',
    },
}, {
    tableName: 'drivers',
    timestamps: true,
    underscored: true,
});

module.exports = Driver;
