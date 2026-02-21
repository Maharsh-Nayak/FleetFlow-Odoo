const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Expense = sequelize.define('Expense', {
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
    trip_id: {
        type: DataTypes.UUID,
        references: {
            model: 'trips',
            key: 'id',
        },
    },
    expense_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    reference_number: {
        type: DataTypes.STRING(100),
    },
}, {
    tableName: 'expenses',
    timestamps: true,
    underscored: true,
});

module.exports = Expense;
