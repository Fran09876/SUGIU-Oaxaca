const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const USE_SQLITE = process.env.USE_SQLITE !== 'false'; // Default to true unless explicitly configured to use PostgreSQL
const DB_NAME = process.env.DB_NAME || 'sigiu_db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

let sequelize;
let isPostgres = false;

if (!USE_SQLITE) {
  isPostgres = true;
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 10000,
      idle: 10000,
    },
  });
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
      console.log(`[DB] Conectado exitosamente a PostgreSQL (${DB_HOST}:${DB_PORT}/${DB_NAME})`);
      try {
        const [results] = await sequelize.query('SELECT PostGIS_Version();');
        if (results && results.length > 0) {
          console.log(`[PostGIS] Extensión espacial activa: ${JSON.stringify(results[0])}`);
        }
      } catch (gisErr) {
        console.warn('[PostGIS] Advertencia: PostGIS aún no está activado en PostgreSQL. Recuerda ejecutar: CREATE EXTENSION postgis;');
      }
    } else {
      console.log(`[DB] Motor SQLite activo en modo desarrollo.`);
    }
    return true;
  } catch (error) {
    console.error(`[DB Error]: ${error.message}`);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  isPostgres,
};
