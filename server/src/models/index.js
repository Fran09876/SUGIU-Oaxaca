const { sequelize } = require('../config/database');
const Role = require('./Role');
const Department = require('./Department');
const User = require('./User');
const Category = require('./Category');
const ReportStatus = require('./ReportStatus');
const Report = require('./Report');
const ReportEvidence = require('./ReportEvidence');
const ReportHistory = require('./ReportHistory');
const CitizenSupport = require('./CitizenSupport');
const WorkOrder = require('./WorkOrder');

// Relaciones Role <-> User
Role.hasMany(User, { foreignKey: 'rol_id', as: 'usuarios' });
User.belongsTo(Role, { foreignKey: 'rol_id', as: 'rol' });

// Relaciones Department <-> User
Department.hasMany(User, { foreignKey: 'dependencia_id', as: 'personal' });
User.belongsTo(Department, { foreignKey: 'dependencia_id', as: 'dependencia' });

// Relaciones Department <-> Category
Department.hasMany(Category, { foreignKey: 'dependencia_id', as: 'categorias' });
Category.belongsTo(Department, { foreignKey: 'dependencia_id', as: 'dependencia' });

// Relaciones User (Ciudadano) <-> Report
User.hasMany(Report, { foreignKey: 'ciudadano_id', as: 'mis_reportes' });
Report.belongsTo(User, { foreignKey: 'ciudadano_id', as: 'ciudadano' });

// Relaciones User (Cuadrilla) <-> Report
User.hasMany(Report, { foreignKey: 'cuadrilla_asignada_id', as: 'reportes_asignados' });
Report.belongsTo(User, { foreignKey: 'cuadrilla_asignada_id', as: 'cuadrilla' });

// Relaciones Category <-> Report
Category.hasMany(Report, { foreignKey: 'categoria_id', as: 'reportes' });
Report.belongsTo(Category, { foreignKey: 'categoria_id', as: 'categoria' });

// Relaciones ReportStatus <-> Report
ReportStatus.hasMany(Report, { foreignKey: 'estado_actual_id', as: 'reportes' });
Report.belongsTo(ReportStatus, { foreignKey: 'estado_actual_id', as: 'estado' });

// Relaciones Report <-> ReportEvidence
Report.hasMany(ReportEvidence, { foreignKey: 'reporte_id', as: 'evidencias' });
ReportEvidence.belongsTo(Report, { foreignKey: 'reporte_id', as: 'reporte' });

// Relaciones Report <-> ReportHistory
Report.hasMany(ReportHistory, { foreignKey: 'reporte_id', as: 'historial' });
ReportHistory.belongsTo(Report, { foreignKey: 'reporte_id', as: 'reporte' });
ReportHistory.belongsTo(ReportStatus, { foreignKey: 'estado_nuevo_id', as: 'estadoNuevo' });
ReportHistory.belongsTo(ReportStatus, { foreignKey: 'estado_anterior_id', as: 'estadoAnterior' });
ReportHistory.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });

// Relaciones Report <-> CitizenSupport
Report.hasMany(CitizenSupport, { foreignKey: 'reporte_id', as: 'apoyos' });
CitizenSupport.belongsTo(Report, { foreignKey: 'reporte_id', as: 'reporte' });
CitizenSupport.belongsTo(User, { foreignKey: 'ciudadano_id', as: 'ciudadano' });

// Relaciones Report <-> WorkOrder (Órdenes de Trabajo)
Report.hasOne(WorkOrder, { foreignKey: 'reporte_id', as: 'ordenTrabajo' });
WorkOrder.belongsTo(Report, { foreignKey: 'reporte_id', as: 'reporte' });

// Relaciones User <-> WorkOrder
User.hasMany(WorkOrder, { foreignKey: 'operador_id', as: 'ordenes_despachadas' });
WorkOrder.belongsTo(User, { foreignKey: 'operador_id', as: 'operador' });

User.hasMany(WorkOrder, { foreignKey: 'cuadrilla_id', as: 'ordenes_asignadas' });
WorkOrder.belongsTo(User, { foreignKey: 'cuadrilla_id', as: 'cuadrilla' });

module.exports = {
  sequelize,
  Role,
  Department,
  User,
  Category,
  ReportStatus,
  Report,
  ReportEvidence,
  ReportHistory,
  CitizenSupport,
  WorkOrder,
};
