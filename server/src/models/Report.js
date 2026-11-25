const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  folio: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  ciudadano_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estado_actual_id: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
  },
  titulo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  prioridad: {
    type: DataTypes.STRING(20),
    defaultValue: 'Media',
  },
  latitud: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  longitud: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  // Columna espacial PostGIS Point WGS84 (SRID 4326)
  ubicacion_geografica: {
    type: DataTypes.JSON, // Compatible con GeoJSON y PostGIS
    allowNull: true,
  },
  direccion_referencia: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  colonia: {
    type: DataTypes.STRING(100),
    defaultValue: 'Centro Histórico',
  },
  codigo_postal: {
    type: DataTypes.STRING(10),
    defaultValue: '68000',
  },
  cuadrilla_asignada_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  votos_apoyo: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'reportes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeValidate: (report) => {
      if (!report.folio) {
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        report.folio = `OAX-${year}-${rand}`;
      }
    },
    beforeSave: (report) => {
      if (report.longitud && report.latitud) {
        report.ubicacion_geografica = {
          type: 'Point',
          coordinates: [parseFloat(report.longitud), parseFloat(report.latitud)],
          crs: { type: 'name', properties: { name: 'EPSG:4326' } },
        };
      }
    },
  },
});

module.exports = Report;
