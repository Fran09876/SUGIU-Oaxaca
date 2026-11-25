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
        console.log('[DB] Sincronizando modelos con la base de datos...');
        await sequelize.sync({ alter: false });
        console.log('[DB] Esquema sincronizado correctamente.');

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
