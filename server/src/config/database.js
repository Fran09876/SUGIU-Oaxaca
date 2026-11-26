const { Sequelize } = require('sequelize');
const path = require('path');
// Cargar .env de server si existe localmente
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Soporte para múltiples nombres de variables de entorno comunes en la nube
const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.DATABASE_URI;
const cleanDbUrl = rawDbUrl ? rawDbUrl.trim().replace(/^['"]|['"]$/g, '') : null;
const hasDatabaseUrl = Boolean(cleanDbUrl);

// Si existe DATABASE_URL, nunca usar SQLite
const USE_SQLITE = !hasDatabaseUrl && process.env.USE_SQLITE !== 'false';

let sequelize;
let isPostgres = false;
let dbHost = 'localhost';
let dbPort = 5432;
let dbName = 'sigiu_db';
let dbUser = 'postgres';

console.log('--------------------------------------------------------');
console.log('[DB Diagnostic] Inicializando conexión a base de datos...');
console.log(`[DB Diagnostic] Entorno NODE_ENV: ${process.env.NODE_ENV || 'development'}`);

if (!USE_SQLITE) {
  isPostgres = true;

  // SSL estricto con rejectUnauthorized: false para certificados de Neon, Supabase y Render
  const dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };

  if (hasDatabaseUrl) {
    const maskedUrl = cleanDbUrl.replace(/:([^:@]+)@/, ':****@');
    console.log(`[DB Diagnostic] DATABASE_URL detectada en process.env: ${maskedUrl}`);

    // Parsear componentes individuales de la URL para evitar que pg-connection-string sobreescriba ssl: { rejectUnauthorized: false }
    let parsedSuccessfully = false;
    try {
      const parsed = new URL(cleanDbUrl);
      dbHost = parsed.hostname;
      dbPort = parsed.port ? parseInt(parsed.port, 10) : 5432;
      dbName = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
      dbUser = decodeURIComponent(parsed.username);
      const dbPassword = decodeURIComponent(parsed.password);

      console.log(`[DB Diagnostic] Conectando a Host: ${dbHost}:${dbPort}, Base de datos: ${dbName}, Usuario: ${dbUser}`);

      sequelize = new Sequelize(dbName, dbUser, dbPassword, {
        host: dbHost,
        port: dbPort,
        dialect: 'postgres',
        dialectOptions,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      });
      parsedSuccessfully = true;
    } catch (parseErr) {
      console.warn('[DB Diagnostic] Falló el parseo de URL descompuesta, usando URL directa:', parseErr.message);
    }

    if (!parsedSuccessfully) {
      sequelize = new Sequelize(cleanDbUrl, {
        dialect: 'postgres',
        dialectOptions,
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },
      });
    }
  } else {
    dbName = process.env.DB_NAME || 'sigiu_db';
    dbUser = process.env.DB_USER || 'postgres';
    const dbPassword = process.env.DB_PASSWORD || 'postgres';
    dbHost = process.env.DB_HOST || 'localhost';
    dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

    const needsSsl = Boolean(process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production');

    console.log(`[DB Diagnostic] Conectando mediante variables individuales a ${dbHost}:${dbPort}/${dbName}`);

    sequelize = new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: 'postgres',
      dialectOptions: needsSsl ? dialectOptions : {},
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });
  }
} else {
  console.log('[DB Diagnostic] No se detectó PostgreSQL ni DATABASE_URL. Usando SQLite local.');
  const sqliteStorage = path.resolve(__dirname, '../../database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteStorage,
    logging: false,
  });
}
console.log('--------------------------------------------------------');

const testConnection = async () => {
  try {
    console.log('[DB] Probando autenticación con la base de datos...');
    await sequelize.authenticate();
    if (isPostgres) {
      const connTarget = hasDatabaseUrl
        ? `PostgreSQL Cloud (${dbHost}:${dbPort}/${dbName}) [SSL Activo]`
        : `${dbHost}:${dbPort}/${dbName}`;
      console.log(`✅ [DB] Conectado exitosamente a PostgreSQL: ${connTarget}`);
      try {
        const [results] = await sequelize.query('SELECT PostGIS_Version();');
        if (results && results.length > 0) {
          console.log(`✅ [PostGIS] Extensión espacial activa: ${JSON.stringify(results[0])}`);
        }
      } catch (gisErr) {
        console.warn('⚠️ [PostGIS] Advertencia: PostGIS aún no está activado en PostgreSQL. Recuerda ejecutar: CREATE EXTENSION IF NOT EXISTS postgis;');
      }
    } else {
      console.log(`ℹ️ [DB] Motor SQLite activo en modo desarrollo.`);
    }
    return true;
  } catch (error) {
    console.error('❌ ==================== [DB ERROR DETALLADO] ====================');
    console.error(`❌ Nombre del Error: ${error.name || 'Desconocido'}`);
    console.error(`❌ Mensaje: ${error.message || '(Mensaje vacío)'}`);
    if (error.original) {
      console.error(`❌ Detalle Original: ${error.original.message || JSON.stringify(error.original)}`);
      if (error.original.code) console.error(`❌ Código de Error: ${error.original.code}`);
      if (error.original.detail) console.error(`❌ Info Detallada: ${error.original.detail}`);
    }
    if (error.parent) {
      console.error(`❌ Error Padre: ${error.parent.message || JSON.stringify(error.parent)}`);
      if (error.parent.code) console.error(`❌ Código Padre: ${error.parent.code}`);
    }
    console.error('❌ =============================================================');
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  isPostgres,
};
