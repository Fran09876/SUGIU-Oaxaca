const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sigiu_oaxaca_jwt_super_secret_key_2026_secure';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Genera un token JWT stateless para el usuario autenticado
 * @param {Object} payload - Datos esenciales del usuario (id, email, rol)
 * @returns {string} Token firmado
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Valida y decodifica un token JWT
 * @param {string} token
 * @returns {Object} Payload decodificado
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
};
