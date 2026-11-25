const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');
const upload = require('../config/multer');
const { authenticateJWT, authorizeRoles } = require('../middlewares/authMiddleware');

/**
 * @route GET /api/v1/ordenes
 * @desc Listar todas las órdenes de trabajo (Admin y Operadores)
 */
router.get(
  '/',
  authenticateJWT,
  authorizeRoles('Administrador', 'Operador'),
  workOrderController.getWorkOrders
);

/**
 * @route GET /api/v1/ordenes/mis-ordenes
 * @desc Listar órdenes asignadas a la cuadrilla logueada (HU-12)
 */
router.get(
  '/mis-ordenes',
  authenticateJWT,
  authorizeRoles('Cuadrilla', 'Operador', 'Administrador'),
  workOrderController.getMyWorkOrders
);

/**
 * @route POST /api/v1/ordenes
 * @desc Generar y despachar una nueva Orden de Trabajo (HU-09)
 */
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('Administrador', 'Operador'),
  workOrderController.createWorkOrder
);

/**
 * @route PATCH /api/v1/ordenes/:id/iniciar
 * @desc Cuadrilla inicia la reparación en campo ("En Proceso" - HU-12)
 */
router.patch(
  '/:id/iniciar',
  authenticateJWT,
  authorizeRoles('Cuadrilla', 'Operador', 'Administrador'),
  workOrderController.startWorkOrder
);

/**
 * @route POST /api/v1/ordenes/:id/finalizar
 * @desc Cuadrilla concluye trabajo y adjunta evidencia fotográfica de resolución obligatoria (HU-13)
 */
router.post(
  '/:id/finalizar',
  authenticateJWT,
  authorizeRoles('Cuadrilla', 'Operador', 'Administrador'),
  upload.single('evidencia_resolucion'),
  workOrderController.completeWorkOrder
);

/**
 * @route PATCH /api/v1/ordenes/:id/aprobar
 * @desc Aprobación de cierre definitivo por Administrador
 */
router.patch(
  '/:id/aprobar',
  authenticateJWT,
  authorizeRoles('Administrador'),
  workOrderController.approveWorkOrder
);

module.exports = router;
