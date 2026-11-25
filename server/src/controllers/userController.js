const { User, Role, Department, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

/**
 * Listar usuarios del sistema con filtros de rol, dependencia y búsqueda
 */
const getUsers = async (req, res, next) => {
  try {
    const { rol_id, dependencia_id, estatus, search } = req.query;
    const where = {};

    if (rol_id) where.rol_id = parseInt(rol_id, 10);
    if (dependencia_id) where.dependencia_id = parseInt(dependencia_id, 10);
    if (estatus !== undefined) where.estatus = estatus === 'true';

    if (search) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { colonia: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const users = await User.findAll({
      where,
      include: [
        { model: Role, as: 'rol', attributes: ['id', 'nombre', 'descripcion'] },
        { model: Department, as: 'dependencia', attributes: ['id', 'nombre', 'siglas'] },
      ],
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener listado de cuadrillas activas (para selectores de despacho de órdenes)
 */
const getCrews = async (req, res, next) => {
  try {
    const crews = await User.findAll({
      where: {
        estatus: true,
      },
      include: [
        {
          model: Role,
          as: 'rol',
          where: { nombre: { [Op.in]: ['Cuadrilla', 'Operador'] } },
          attributes: ['id', 'nombre'],
        },
        { model: Department, as: 'dependencia', attributes: ['id', 'nombre', 'siglas'] },
      ],
      attributes: { exclude: ['password_hash'] },
      order: [['nombre', 'ASC']],
    });

    res.json({
      success: true,
      count: crews.length,
      data: crews,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear un nuevo usuario administrativo, operativo o cuadrilla
 */
const createUser = async (req, res, next) => {
  try {
    const { nombre, email, password, rol_id, dependencia_id, telefono, colonia } = req.body;

    if (!nombre || !email || !password || !rol_id) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email, contraseña y rol son obligatorios.',
      });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'El correo electrónico ya se encuentra registrado.',
      });
    }

    const newUser = await User.create({
      nombre,
      email,
      password_hash: password, // el hook beforeCreate aplica el hash bcrypt
      rol_id: parseInt(rol_id, 10),
      dependencia_id: dependencia_id ? parseInt(dependencia_id, 10) : null,
      telefono: telefono || null,
      colonia: colonia || 'Centro',
      estatus: true,
    });

    const userWithDetails = await User.findByPk(newUser.id, {
      include: [
        { model: Role, as: 'rol', attributes: ['id', 'nombre'] },
        { model: Department, as: 'dependencia', attributes: ['id', 'nombre', 'siglas'] },
      ],
      attributes: { exclude: ['password_hash'] },
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente en el catálogo municipal.',
      data: userWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar datos de un usuario
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol_id, dependencia_id, telefono, colonia, estatus } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    if (nombre) user.nombre = nombre;
    if (email) user.email = email;
    if (password && password.trim().length >= 6) {
      user.password_hash = password;
    }
    if (rol_id) user.rol_id = parseInt(rol_id, 10);
    if (dependencia_id !== undefined) {
      user.dependencia_id = dependencia_id ? parseInt(dependencia_id, 10) : null;
    }
    if (telefono !== undefined) user.telefono = telefono;
    if (colonia !== undefined) user.colonia = colonia;
    if (estatus !== undefined) user.estatus = estatus;

    await user.save();

    const updated = await User.findByPk(id, {
      include: [
        { model: Role, as: 'rol', attributes: ['id', 'nombre'] },
        { model: Department, as: 'dependencia', attributes: ['id', 'nombre', 'siglas'] },
      ],
      attributes: { exclude: ['password_hash'] },
    });

    res.json({
      success: true,
      message: 'Usuario actualizado correctamente.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activar o desactivar usuario
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado.' });
    }

    user.estatus = !user.estatus;
    await user.save();

    res.json({
      success: true,
      message: `Cuenta de ${user.nombre} ${user.estatus ? 'activada' : 'desactivada'} correctamente.`,
      estatus: user.estatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getCrews,
  createUser,
  updateUser,
  toggleUserStatus,
};
