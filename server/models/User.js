const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password_hash: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('MANAGER', 'DISPATCHER', 'SAFETY', 'FINANCE'),
        allowNull: false,
        defaultValue: 'DISPATCHER',
    },
    status: {
        type: DataTypes.STRING(20),
        defaultValue: 'ACTIVE',
    },
}, {
    tableName: 'users',
    timestamps: false,
});

module.exports = User;
