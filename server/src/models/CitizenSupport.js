const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CitizenSupport = sequelize.define('CitizenSupport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  reporte_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  ciudadano_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'apoyos_ciudadanos',
  timestamps: true,
  updatedAt: false,
  createdAt: 'created_at',
  indexes: [
    {
      unique: true,
      fields: ['reporte_id', 'ciudadano_id'],
    },
  ],
});

module.exports = CitizenSupport;
