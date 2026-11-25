const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const app = require('./app');
const { testConnection, sequelize, isPostgres } = require('./config/database');
const runSeed = require('./seeders/seed');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('========================================================');
    console.log('   SIGIU: Sistema Integral de Gestión de Incidencias    ');
    console.log('       Municipio de Oaxaca de Juárez (v1.0 - XP)        ');
    console.log('========================================================');

    const connected = await testConnection();

    if (connected) {
      try {
        console.log('[DB] Sincronizando tablas y modelos con base de datos...');
        await sequelize.sync({ alter: false });
        console.log('[DB] Esquema sincronizado.');

        const { Role } = require('./models');
        const roleCount = await Role.count();
        if (roleCount === 0) {
          console.log('[DB] Base de datos limpia detectada. Ejecutando seeds iniciales...');
          await runSeed();
        }
      } catch (syncErr) {
        console.warn(`[DB Sync]: ${syncErr.message}`);
      }
    }

    if (!isPostgres) {
      console.info('ℹ️ Nota de Arquitectura: Base de datos en modo desarrollo.');
      console.info('   Para conectar con tu instancia de PostgreSQL + PostGIS,');
      console.info('   edita server/.env configurando USE_SQLITE=false y tus credenciales,');
      console.info('   y ejecuta el script DDL ubicado en server/src/sql/ddl_sigiu.sql');
    }

    app.listen(PORT, () => {
      console.log(`[API] Servidor activo escuchando en http://localhost:${PORT}`);
      console.log(`[API] Endpoint de salud: http://localhost:${PORT}/api/v1/health`);
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
