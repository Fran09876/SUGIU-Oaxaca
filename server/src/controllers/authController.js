const { User, Role, Department } = require('../models');
const { generateToken } = require('../config/jwt');

/**
 * HU-05: Registro de nuevo ciudadano en la plataforma SIGIU
 */
const register = async (req, res, next) => {
  try {
    const { nombre, email, password, telefono, colonia, rol_id } = req.body;

    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'El correo electrónico ya está registrado en el sistema.',
      });
    }

    // Por defecto, auto-registro asigna rol Ciudadano (id: 4) a menos que se especifique en modo seed/admin
    const defaultRolId = rol_id || 4;

    const newUser = await User.create({
      nombre,
      email,
      password_hash: password, // El hook beforeCreate aplica bcrypt hash
      telefono: telefono || null,
      colonia: colonia || 'Centro',
      rol_id: defaultRolId,
      estatus: true,
    });

    // Cargar con rol para generar payload completo
    const userWithRole = await User.findByPk(newUser.id, {
      include: [{ model: Role, as: 'rol', attributes: ['id', 'nombre'] }],
    });

    const token = generateToken({
      id: userWithRole.id,
      email: userWithRole.email,
      nombre: userWithRole.nombre,
      rol: userWithRole.rol ? userWithRole.rol.nombre : 'Ciudadano',
      rol_id: userWithRole.rol_id,
    });

    res.status(201).json({
      success: true,
      message: 'Ciudadano registrado exitosamente en SIGIU Oaxaca de Juárez.',
      data: {
        user: userWithRole.toSafeJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * HU-05: Inicio de sesión con autenticación Stateless vía JWT
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        { model: Role, as: 'rol', attributes: ['id', 'nombre'] },
        { model: Department, as: 'dependencia', attributes: ['id', 'nombre', 'siglas'] },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas: Correo o contraseña incorrectos.',
      });
    }

    if (!user.estatus) {
      return res.status(403).json({
        success: false,
        message: 'Tu cuenta ha sido desactivada temporalmente por la administración municipal.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas: Correo o contraseña incorrectos.',
      });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol ? user.rol.nombre : 'Ciudadano',
      rol_id: user.rol_id,
      dependencia_id: user.dependencia_id,
    });

    res.json({
      success: true,
      message: `Bienvenido a SIGIU, ${user.nombre}.`,
      data: {
        user: user.toSafeJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * HU-05: Obtener perfil del usuario autenticado actual
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Role, as: 'rol', attributes: ['id', 'nombre'] },
        { model: Department, as: 'dependencia', attributes: ['id', 'nombre', 'siglas'] },
      ],
      attributes: { exclude: ['password_hash'] },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
