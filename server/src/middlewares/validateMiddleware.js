/**
 * Validaciones de entrada para controladores de SIGIU
 */

const validateRegister = (req, res, next) => {
  const { nombre, email, password } = req.body;

  if (!nombre || nombre.trim().length < 3) {
    return res.status(400).json({
      success: false,
      message: 'El nombre completo es obligatorio y debe tener al menos 3 caracteres.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Debe proporcionar una dirección de correo electrónico válida.',
    });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener una longitud mínima de 6 caracteres.',
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere correo electrónico y contraseña.',
    });
  }

  next();
};

const validateReportCreation = (req, res, next) => {
  const { titulo, descripcion, categoria_id, latitud, longitud } = req.body;

  if (!titulo || titulo.trim().length < 5) {
    return res.status(400).json({
      success: false,
      message: 'El título de la incidencia es obligatorio (mínimo 5 caracteres).',
    });
  }

  if (!descripcion || descripcion.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'La descripción del problema debe ser detallada (mínimo 10 caracteres).',
    });
  }

  if (!categoria_id) {
    return res.status(400).json({
      success: false,
      message: 'Debe seleccionar una categoría de incidencia válida.',
    });
  }

  const lat = parseFloat(latitud);
  const lng = parseFloat(longitud);

  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({
      success: false,
      message: 'Las coordenadas GPS (latitud y longitud) son obligatorias y deben ser numéricas.',
    });
  }

  // Validación de límites geográficos aproximados de Oaxaca de Juárez
  // Lat: ~16.8 a 17.3, Lng: ~-96.9 a -96.5
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({
      success: false,
      message: 'Las coordenadas geoespaciales se encuentran fuera de los rangos válidos del sistema WGS84.',
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateReportCreation,
};
