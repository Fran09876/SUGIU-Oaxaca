/**
 * Middleware centralizado de manejo global de excepciones
 * Cumple con HU-01 (Manejo de errores consistente y estandarizado)
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[SIGIU Error] ${req.method} ${req.url} - ${err.message}`, err.stack);

  // Error de carga de archivo de Multer
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo excede el tamaño máximo permitido de 5MB.',
        code: err.code,
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error en la carga del archivo: ${err.message}`,
      code: err.code,
    });
  }

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const messages = err.errors.map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Error de validación de datos.',
      errors: messages,
    });
  }

  // Error de base de datos o sintaxis SQL
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      success: false,
      message: 'Error en la base de datos geoespacial.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }

  // Error general no capturado
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor en SIGIU.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
