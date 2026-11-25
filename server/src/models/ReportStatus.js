const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReportStatus = sequelize.define('ReportStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  color_hex: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'estados_reporte',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at',
});

module.exports = ReportStatus;
