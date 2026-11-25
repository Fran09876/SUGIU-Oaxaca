const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReportEvidence = sequelize.define('ReportEvidence', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reporte_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  url_imagen: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  nombre_archivo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  mimetype: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  tamano_bytes: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  tipo: {
    type: DataTypes.ENUM('inicial', 'inspeccion', 'resolucion'),
    defaultValue: 'inicial',
  },
}, {
  tableName: 'imagenes_reporte',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at',
});

module.exports = ReportEvidence;
