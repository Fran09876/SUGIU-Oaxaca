const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  dependencia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  icono: {
    type: DataTypes.STRING(50),
    defaultValue: 'AlertTriangle',
  },
  color_hex: {
    type: DataTypes.STRING(20),
    defaultValue: '#3C507D',
  },
  dias_horas_atencion: {
    type: DataTypes.INTEGER,
    defaultValue: 72,
  },
  estatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'categorias_incidencia',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at',
});

module.exports = Category;
