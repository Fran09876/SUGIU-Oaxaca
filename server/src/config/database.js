const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const USE_SQLITE = !hasDatabaseUrl && process.env.USE_SQLITE !== 'false';

let sequelize;
let isPostgres = false;

if (!USE_SQLITE) {
  isPostgres = true;

  // SSL es obligatorio en PostgreSQL en entornos Cloud (Neon, Supabase, Render)
  const needsSsl = Boolean(
    process.env.DATABASE_URL ||
    process.env.DB_SSL === 'true' ||
    process.env.NODE_ENV === 'production'
  );

  const dialectOptions = needsSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {};

  if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
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
  } else {
    const DB_NAME = process.env.DB_NAME || 'sigiu_db';
    const DB_USER = process.env.DB_USER || 'postgres';
    const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
    const DB_HOST = process.env.DB_HOST || 'localhost';
    const DB_PORT = process.env.DB_PORT || 5432;

    sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
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
  const sqliteStorage = path.resolve(__dirname, '../../database.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteStorage,
    logging: false,
  });
}

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    if (isPostgres) {
      const connTarget = process.env.DATABASE_URL
        ? 'Cloud PostgreSQL (DATABASE_URL con SSL)'
        : `${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'sigiu_db'}`;
      console.log(`[DB] Conectado exitosamente a PostgreSQL (${connTarget})`);
      try {
        const [results] = await sequelize.query('SELECT PostGIS_Version();');
        if (results && results.length > 0) {
          console.log(`[PostGIS] Extensión espacial activa: ${JSON.stringify(results[0])}`);
        }
      } catch (gisErr) {
        console.warn('[PostGIS] Advertencia: PostGIS aún no está activado en PostgreSQL. Recuerda ejecutar: CREATE EXTENSION IF NOT EXISTS postgis;');
      }
    } else {
      console.log(`[DB] Motor SQLite activo en modo desarrollo.`);
    }
    return true;
  } catch (error) {
    const errorMsg = error.original?.message || error.parent?.message || error.message || String(error);
    console.error(`[DB Error]: ${errorMsg}`);
    if (error.original?.code || error.parent?.code) {
      console.error(`[DB Error Code]: ${error.original?.code || error.parent?.code}`);
    }
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  isPostgres,
};
