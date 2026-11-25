const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalogController');
const { authenticateJWT, authorizeRoles } = require('../middlewares/authMiddleware');

/**
 * Catálogos de consulta pública
 */
router.get('/categorias', catalogController.getCategories);
router.get('/estados', catalogController.getStatuses);
router.get('/dependencias', catalogController.getDepartments);
router.get('/roles', catalogController.getRoles);

/**
 * Gestión CRUD de Dependencias Municipales (Administrador)
 */
router.post(
  '/dependencias',
  authenticateJWT,
  authorizeRoles('Administrador'),
  catalogController.createDepartment
);

router.put(
  '/dependencias/:id',
  authenticateJWT,
  authorizeRoles('Administrador'),
  catalogController.updateDepartment
);

/**
 * Gestión CRUD de Categorías de Incidencia (Administrador)
 */
router.post(
  '/categorias',
  authenticateJWT,
  authorizeRoles('Administrador'),
  catalogController.createCategory
);

router.put(
  '/categorias/:id',
  authenticateJWT,
  authorizeRoles('Administrador'),
  catalogController.updateCategory
);

router.delete(
  '/categorias/:id',
  authenticateJWT,
  authorizeRoles('Administrador'),
  catalogController.deleteCategory
);

module.exports = router;
