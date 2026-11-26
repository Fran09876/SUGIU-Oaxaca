const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Lista de orígenes permitidos explícitos
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.CLIENT_URL,
].filter(Boolean);

// Middlewares globales de seguridad y utilidades con soporte dinámico para Vercel
app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como clientes REST, apps móviles o curl)
    if (!origin) return callback(null, true);

    // Permitir dominios explícitos configurados
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Permitir cualquier subdominio de Vercel (despliegue de producción o previews)
    if (origin.endsWith('.vercel.app')) return callback(null, true);

    // Permitir dominios de Render o localhost
    if (origin.includes('localhost') || origin.endsWith('.onrender.com')) return callback(null, true);

    // En desarrollo o fallback seguro
    if (process.env.NODE_ENV !== 'production') return callback(null, true);

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servidor estático para servir fotografías de evidencias (creación recursiva para entornos efímeros)
const uploadsPath = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Endpoints raíz y de salud para Cloud PaaS (Render / Uptime checkers)
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'SIGIU - Sistema Integral de Gestión de Incidencias Urbanas',
    entity: 'Municipio de Oaxaca de Juárez',
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0 (XP Iteración 6 - Producción)',
    endpoints: {
      health: '/health',
      api_health: '/api/v1/health',
      catalogos: '/api/v1/catalogos/categorias',
      reportes: '/api/v1/reportes',
    },
  });
});

app.get('/health', async (req, res) => {
  let dbStatus = 'connected';
  let dbError = null;
  try {
    const { sequelize } = require('./config/database');
    await sequelize.authenticate();
  } catch (err) {
    dbStatus = 'disconnected';
    dbError = err.original?.message || err.message || String(err);
  }

  res.json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      error: dbError,
    },
    timestamp: new Date().toISOString(),
  });
});

// Montaje de rutas de la API bajo /api/v1 (HU-04)
app.use('/api/v1', routes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Manejador global de excepciones (HU-01)
app.use(errorHandler);

module.exports = app;
