const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/authMiddleware');

/**
 * @route GET /api/v1/usuarios/cuadrillas
 * @desc Listar personal de cuadrilla disponible para asignaciones
 */
router.get(
  '/cuadrillas',
  authenticateJWT,
  authorizeRoles('Administrador', 'Operador'),
  userController.getCrews
);

/**
 * @route GET /api/v1/usuarios
 * @desc Listado general de usuarios (Admin)
 */
router.get(
  '/',
  authenticateJWT,
  authorizeRoles('Administrador'),
  userController.getUsers
);

/**
 * @route POST /api/v1/usuarios
 * @desc Crear nuevo usuario administrativo, operativo o cuadrilla
 */
router.post(
  '/',
  authenticateJWT,
  authorizeRoles('Administrador'),
  userController.createUser
);

/**
 * @route PUT /api/v1/usuarios/:id
 * @desc Actualizar datos de un usuario
 */
router.put(
  '/:id',
  authenticateJWT,
  authorizeRoles('Administrador'),
  userController.updateUser
);

/**
 * @route PATCH /api/v1/usuarios/:id/status
 * @desc Alternar estatus activo/inactivo de un usuario
 */
router.patch(
  '/:id/status',
  authenticateJWT,
  authorizeRoles('Administrador'),
  userController.toggleUserStatus
);

module.exports = router;
