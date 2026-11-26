const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');

const authRoutes = require('./authRoutes');
const reportRoutes = require('./reportRoutes');
const catalogRoutes = require('./catalogRoutes');
const workOrderRoutes = require('./workOrderRoutes');
const userRoutes = require('./userRoutes');

// Endpoint de diagnóstico y salud del sistema
router.get('/health', async (req, res) => {
  let dbStatus = 'connected';
  let dbError = null;

  try {
    await sequelize.authenticate();
  } catch (err) {
    dbStatus = 'disconnected';
    dbError = err.original?.message || err.message || String(err);
  }

  res.json({
    status: 'online',
    system: 'SIGIU - Sistema Integral de Gestión de Incidencias Urbanas',
    entity: 'Municipio de Oaxaca de Juárez',
    version: '2.0.0 (XP Iteración 6 - Producción)',
    database: {
      status: dbStatus,
      error: dbError,
    },
    timestamp: new Date().toISOString(),
    postgis_supported: true,
  });
});

// Enrutamiento modular por historias de usuario e iteraciones XP
router.use('/auth', authRoutes);
router.use('/reportes', reportRoutes);
router.use('/catalogos', catalogRoutes);
router.use('/ordenes', workOrderRoutes);
router.use('/usuarios', userRoutes);

module.exports = router;
