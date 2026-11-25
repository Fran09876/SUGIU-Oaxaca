const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validateMiddleware');
const { authenticateJWT } = require('../middlewares/authMiddleware');

/**
 * @route POST /api/v1/auth/register
 * @desc Registro de un nuevo ciudadano en SIGIU
 */
router.post('/register', validateRegister, authController.register);

/**
 * @route POST /api/v1/auth/login
 * @desc Inicio de sesión y emisión de JWT Stateless
 */
router.post('/login', validateLogin, authController.login);

/**
 * @route GET /api/v1/auth/me
 * @desc Obtener datos de perfil del usuario en sesión
 */
router.get('/me', authenticateJWT, authController.getMe);

module.exports = router;
