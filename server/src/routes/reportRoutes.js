const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const upload = require('../config/multer');
const { validateReportCreation } = require('../middlewares/validateMiddleware');
const { authenticateJWT, authorizeRoles, optionalAuth } = require('../middlewares/authMiddleware');

/**
 * @route GET /api/v1/reportes/estadisticas
 * @route GET /api/v1/reportes/analitica
 * @desc Resumen estadístico y analítica para rendición de cuentas (HU-11)
 */
router.get('/estadisticas', reportController.getStatistics);
router.get('/analitica', reportController.getStatistics);

/**
 * @route GET /api/v1/reportes/gis/geojson
 * @desc GeoJSON FeatureCollection para visor Leaflet GIS y clústeres (HU-10, HU-11)
 */
router.get('/gis/geojson', reportController.getReportsGeoJson);

/**
 * @route GET /api/v1/reportes/mis-reportes
 * @desc Historial de reportes del ciudadano autenticado con trazabilidad (HU-10)
 */
router.get('/mis-reportes', authenticateJWT, reportController.getMyReports);

/**
 * @route GET /api/v1/reportes
 * @desc Listado general de reportes con filtros geoespaciales y categóricos
 */
router.get('/', reportController.getReports);

/**
 * @route GET /api/v1/reportes/:id
 * @desc Consulta detallada de una incidencia y su historial
 */
router.get('/:id', reportController.getReportById);

/**
 * @route POST /api/v1/reportes
 * @desc HU-06 y HU-07: Captura de reporte con coordenadas GPS y evidencia fotográfica (Multer)
 */
router.post(
  '/',
  upload.single('evidencia'), // Intercepta la fotografía en multipart/form-data
  optionalAuth,              // Permite vincular al ciudadano autenticado o registrar como ciudadano digital
  validateReportCreation,
  reportController.createReport
);

/**
 * @route POST /api/v1/reportes/:id/apoyo
 * @desc Apoyo ciudadano a una incidencia ("A mí también me afecta" - HU-10)
 */
router.post('/:id/apoyo', optionalAuth, reportController.supportReport);

/**
 * @route PATCH /api/v1/reportes/:id/estado
 * @desc Canalización y actualización de estatus (Operadores y Administradores)
 */
router.patch(
  '/:id/estado',
  authenticateJWT,
  authorizeRoles('Administrador', 'Operador'),
  reportController.updateReportStatus
);

module.exports = router;
