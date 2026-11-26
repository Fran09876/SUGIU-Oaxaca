const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');
const { testConnection, sequelize, isPostgres } = require('./config/database');
const runSeed = require('./seeders/seed');

const PORT = process.env.PORT || 5000;

// Garantizar existencia del directorio de uploads en el arranque del servidor
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const startServer = async () => {
  try {
    console.log('========================================================');
    console.log('   SIGIU: Sistema Integral de Gestión de Incidencias    ');
    console.log('       Municipio de Oaxaca de Juárez (v2.0 - XP)        ');
    console.log('========================================================');

    const connected = await testConnection();

    if (connected) {
      try {
        console.log('[DB] Sincronizando modelos en orden relacional...');
        const {
          Role,
          Department,
          ReportStatus,
          User,
          Category,
          Report,
          ReportEvidence,
          ReportHistory,
          CitizenSupport,
          WorkOrder,
        } = require('./models');

        // 1. Tablas independientes de primer nivel (sin FK)
        await Role.sync();
        await Department.sync();
        await ReportStatus.sync();

        // 2. Tablas con claves foráneas hacia primer nivel
        await User.sync();
        await Category.sync();

        // 3. Tabla principal de reportes
        await Report.sync();

        // 4. Tablas dependientes de reportes y usuarios
        await ReportEvidence.sync();
        await ReportHistory.sync();
        await CitizenSupport.sync();
        await WorkOrder.sync();

        console.log('✅ [DB] Esquema relacional sincronizado en orden.');

        const roleCount = await Role.count();
        if (roleCount === 0) {
          console.log('[DB] Base de datos limpia detectada. Ejecutando seeds iniciales...');
          await runSeed();
        } else {
          console.log(`✅ [DB] Base de datos activa con catálogos verificados (${roleCount} roles).`);
        }
      } catch (syncErr) {
        console.warn(`[DB Sync Error]: ${syncErr.message}`);
        console.log('[DB Fallback] Intentando inicialización directa mediante deploy_init.sql...');
        try {
          const sqlPath = path.resolve(__dirname, 'sql/deploy_init.sql');
          if (fs.existsSync(sqlPath)) {
            const sqlContent = fs.readFileSync(sqlPath, 'utf8');
            await sequelize.query(sqlContent);
            console.log('✅ [DB Fallback] deploy_init.sql ejecutado exitosamente.');
          }
        } catch (sqlErr) {
          console.error('❌ [DB Fallback Error]:', sqlErr.message);
        }
      }
    }

    if (!isPostgres) {
      console.info('ℹ️ Nota de Arquitectura: Base de datos en modo desarrollo local (SQLite).');
      console.info('   Para producción o PostgreSQL + PostGIS, configura DATABASE_URL o USE_SQLITE=false.');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[API] Servidor activo escuchando en el puerto ${PORT}`);
      console.log(`[API] Endpoint de salud: http://localhost:${PORT}/health`);
      console.log(`[API] Endpoint API v1: http://localhost:${PORT}/api/v1/health`);
      console.log(`[API] Catálogos: http://localhost:${PORT}/api/v1/catalogos/categorias`);
      console.log(`[API] Reportes: http://localhost:${PORT}/api/v1/reportes`);
      console.log('========================================================');
    });
  } catch (error) {
    console.error('[Fatal Error] Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

startServer();
