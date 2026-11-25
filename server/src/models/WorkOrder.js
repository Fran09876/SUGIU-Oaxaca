const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkOrder = sequelize.define('WorkOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  folio_orden: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true,
  },
  reporte_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  operador_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  cuadrilla_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  instrucciones: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  prioridad: {
    type: DataTypes.STRING(20),
    defaultValue: 'Media',
  },
  fecha_limite: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  estatus_orden: {
    type: DataTypes.STRING(30),
    defaultValue: 'Asignada', // Asignada | En Proceso | Terminada | Aprobada | Cancelada
  },
  observaciones_cuadrilla: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fecha_inicio: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  fecha_cierre: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'ordenes_trabajo',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeValidate: (order) => {
      if (!order.folio_orden) {
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        order.folio_orden = `OT-${year}-${rand}`;
      }
    },
  },
});

module.exports = WorkOrder;
