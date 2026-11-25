const { Category, Department, ReportStatus, Role } = require('../models');

/**
 * Obtener todas las categorías de incidencias urbanas
 */
const getCategories = async (req, res, next) => {
  try {
    const { includeInactive } = req.query;
    const where = {};
    if (!includeInactive) {
      where.estatus = true;
    }

    const categories = await Category.findAll({
      where,
      include: [{ model: Department, as: 'dependencia', attributes: ['id', 'nombre', 'siglas'] }],
      order: [['id', 'ASC']],
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nueva categoría de incidencia
 */
const createCategory = async (req, res, next) => {
  try {
    const { dependencia_id, nombre, descripcion, icono, color_hex, dias_horas_atencion } = req.body;
    if (!dependencia_id || !nombre) {
      return res.status(400).json({ success: false, message: 'La dependencia y el nombre son obligatorios.' });
    }

    const newCat = await Category.create({
      dependencia_id: parseInt(dependencia_id, 10),
      nombre,
      descripcion,
      icono: icono || 'AlertTriangle',
      color_hex: color_hex || '#3F4B48',
      dias_horas_atencion: dias_horas_atencion ? parseInt(dias_horas_atencion, 10) : 48,
      estatus: true,
    });

    const withDept = await Category.findByPk(newCat.id, {
      include: [{ model: Department, as: 'dependencia', attributes: ['id', 'nombre', 'siglas'] }],
    });

    res.status(201).json({ success: true, message: 'Categoría creada con éxito.', data: withDept });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar categoría existente
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { dependencia_id, nombre, descripcion, icono, color_hex, dias_horas_atencion, estatus } = req.body;

    const cat = await Category.findByPk(id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada.' });
    }

    if (dependencia_id) cat.dependencia_id = parseInt(dependencia_id, 10);
    if (nombre) cat.nombre = nombre;
    if (descripcion !== undefined) cat.descripcion = descripcion;
    if (icono) cat.icono = icono;
    if (color_hex) cat.color_hex = color_hex;
    if (dias_horas_atencion) cat.dias_horas_atencion = parseInt(dias_horas_atencion, 10);
    if (estatus !== undefined) cat.estatus = estatus;

    await cat.save();

    const withDept = await Category.findByPk(id, {
      include: [{ model: Department, as: 'dependencia', attributes: ['id', 'nombre', 'siglas'] }],
    });

    res.json({ success: true, message: 'Categoría actualizada.', data: withDept });
  } catch (error) {
    next(error);
  }
};

/**
 * Eliminar o desactivar categoría
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cat = await Category.findByPk(id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Categoría no encontrada.' });
    }

    cat.estatus = !cat.estatus;
    await cat.save();

    res.json({ success: true, message: `Categoría ${cat.estatus ? 'habilitada' : 'deshabilitada'} con éxito.` });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener todos los estados posibles de un reporte
 */
const getStatuses = async (req, res, next) => {
  try {
    const statuses = await ReportStatus.findAll({
      order: [['orden', 'ASC']],
    });

    res.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener catálogo de dependencias municipales
 */
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.findAll({
      include: [{ model: Category, as: 'categorias' }],
      order: [['id', 'ASC']],
    });

    res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear dependencia municipal
 */
const createDepartment = async (req, res, next) => {
  try {
    const { nombre, siglas, titular, telefono, direccion } = req.body;
    if (!nombre || !siglas) {
      return res.status(400).json({ success: false, message: 'Nombre y siglas son obligatorios.' });
    }

    const newDep = await Department.create({
      nombre,
      siglas,
      titular: titular || null,
      telefono: telefono || null,
      direccion: direccion || 'Oaxaca de Juárez, Oax.',
    });

    res.status(201).json({ success: true, message: 'Dependencia municipal creada exitosamente.', data: newDep });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar dependencia municipal
 */
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, siglas, titular, telefono, direccion } = req.body;

    const dep = await Department.findByPk(id);
    if (!dep) {
      return res.status(404).json({ success: false, message: 'Dependencia no encontrada.' });
    }

    if (nombre) dep.nombre = nombre;
    if (siglas) dep.siglas = siglas;
    if (titular !== undefined) dep.titular = titular;
    if (telefono !== undefined) dep.telefono = telefono;
    if (direccion !== undefined) dep.direccion = direccion;

    await dep.save();

    res.json({ success: true, message: 'Dependencia actualizada correctamente.', data: dep });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener catálogo de roles
 */
const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll({
      order: [['id', 'ASC']],
    });

    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getStatuses,
  getDepartments,
  createDepartment,
  updateDepartment,
  getRoles,
};
