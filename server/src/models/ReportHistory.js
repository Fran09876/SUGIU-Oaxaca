const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReportHistory = sequelize.define('ReportHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reporte_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  estado_anterior_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  estado_nuevo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  usuario_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  comentario: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'historial_estados_reporte',
  timestamps: true,
  updatedAt: false,
  createdAt: 'fecha_cambio',
});

module.exports = ReportHistory;
