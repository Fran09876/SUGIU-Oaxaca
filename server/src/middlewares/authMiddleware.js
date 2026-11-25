const { verifyToken } = require('../config/jwt');
const { User, Role } = require('../models');

/**
 * Middleware para validar el token JWT en las cabeceras Authorization
 */
const authenticateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Acceso no autorizado: Se requiere un token Bearer válido.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.id, {
      include: [{ model: Role, as: 'rol', attributes: ['id', 'nombre'] }],
      attributes: { exclude: ['password_hash'] },
    });

    if (!user || !user.estatus) {
      return res.status(401).json({
        success: false,
        message: 'Sesión no válida o usuario inactivo.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token expirado o inválido.',
      error: error.message,
    });
  }
};

/**
 * Middleware para autorizar roles específicos (RBAC)
 * @param  {...string} allowedRoles Nombres de roles permitidos
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado: Rol no determinado.',
      });
    }

    const userRole = req.user.rol.nombre;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Acceso restringido: Se requiere rol [${allowedRoles.join(', ')}]. Tu rol actual es '${userRole}'.`,
      });
    }

    next();
  };
};

/**
 * Middleware de autenticación opcional (para endpoints públicos que enriquecen datos si el usuario está autenticado)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.id, {
        include: [{ model: Role, as: 'rol', attributes: ['id', 'nombre'] }],
        attributes: { exclude: ['password_hash'] },
      });
      if (user && user.estatus) {
        req.user = user;
      }
    }
  } catch (e) {
    // Silencioso, es opcional
  }
  next();
};

module.exports = {
  authenticateJWT,
  authorizeRoles,
  optionalAuth,
};
