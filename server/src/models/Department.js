const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
  },
  siglas: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  titular: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  telefono: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  direccion: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
}, {
  tableName: 'dependencias',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at',
});

module.exports = Department;
