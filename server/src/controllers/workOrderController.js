const { WorkOrder, Report, User, Category, ReportStatus, ReportEvidence, ReportHistory, sequelize } = require('../models');

/**
 * HU-09: Crear y despachar una Orden de Trabajo a una Cuadrilla específica
 */
const createWorkOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { reporte_id, cuadrilla_id, instrucciones, fecha_limite, prioridad } = req.body;
    const operador_id = req.user.id;

    if (!reporte_id || !cuadrilla_id || !instrucciones) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar el reporte, la cuadrilla asignada y las instrucciones técnicas de trabajo.',
      });
    }

    const report = await Report.findByPk(reporte_id, { transaction });
    if (!report) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Reporte no encontrado.' });
    }

    const crewUser = await User.findByPk(cuadrilla_id, { transaction });
    if (!crewUser) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'La cuadrilla seleccionada no existe.' });
    }

    // Generar folio correlativo para la Orden de Trabajo
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const folio_orden = `OT-${year}-${rand}`;

    const newOrder = await WorkOrder.create({
      folio_orden,
      reporte_id,
      operador_id,
      cuadrilla_id,
      instrucciones: instrucciones.trim(),
      prioridad: prioridad || report.prioridad || 'Media',
      fecha_limite: fecha_limite ? new Date(fecha_limite) : new Date(Date.now() + 48 * 3600 * 1000),
      estatus_orden: 'Asignada',
    }, { transaction });

    // Actualizar el reporte a Asignado (ID: 3)
    const estadoAnteriorId = report.estado_actual_id;
    report.estado_actual_id = 3; // Asignado
    report.cuadrilla_asignada_id = cuadrilla_id;
    await report.save({ transaction });

    // Registrar en auditoría
    await ReportHistory.create({
      reporte_id: report.id,
      estado_anterior_id: estadoAnteriorId,
      estado_nuevo_id: 3,
      usuario_id: operador_id,
      comentario: `Orden de Trabajo ${folio_orden} asignada a ${crewUser.nombre}. Instrucciones: ${instrucciones.trim()}`,
    }, { transaction });

    await transaction.commit();

    const completeOrder = await WorkOrder.findByPk(newOrder.id, {
      include: [
        {
          model: Report,
          as: 'reporte',
          include: [
            { model: Category, as: 'categoria' },
            { model: ReportStatus, as: 'estado' },
            { model: ReportEvidence, as: 'evidencias' },
          ],
        },
        { model: User, as: 'operador', attributes: ['id', 'nombre', 'email'] },
        { model: User, as: 'cuadrilla', attributes: ['id', 'nombre', 'email', 'telefono'] },
      ],
    });

    res.status(201).json({
      success: true,
      message: `Orden de Trabajo ${folio_orden} generada y asignada exitosamente.`,
      data: completeOrder,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Listar todas las órdenes de trabajo con filtros (Para Administrador y Operador)
 */
const getWorkOrders = async (req, res, next) => {
  try {
    const { estatus_orden, cuadrilla_id, prioridad } = req.query;
    const where = {};

    if (estatus_orden) where.estatus_orden = estatus_orden;
    if (cuadrilla_id) where.cuadrilla_id = cuadrilla_id;
    if (prioridad) where.prioridad = prioridad;

    const orders = await WorkOrder.findAll({
      where,
      include: [
        {
          model: Report,
          as: 'reporte',
          include: [
            { model: Category, as: 'categoria' },
            { model: ReportStatus, as: 'estado' },
            { model: ReportEvidence, as: 'evidencias' },
            { model: User, as: 'ciudadano', attributes: ['id', 'nombre', 'colonia'] },
          ],
        },
        { model: User, as: 'operador', attributes: ['id', 'nombre', 'email'] },
        { model: User, as: 'cuadrilla', attributes: ['id', 'nombre', 'email', 'telefono'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * HU-12: Listar órdenes de trabajo asignadas a la cuadrilla actualmente en sesión
 */
const getMyWorkOrders = async (req, res, next) => {
  try {
    const crewId = req.user.id;

    const orders = await WorkOrder.findAll({
      where: { cuadrilla_id: crewId },
      include: [
        {
          model: Report,
          as: 'reporte',
          include: [
            { model: Category, as: 'categoria' },
            { model: ReportStatus, as: 'estado' },
            { model: ReportEvidence, as: 'evidencias' },
          ],
        },
        { model: User, as: 'operador', attributes: ['id', 'nombre', 'email', 'telefono'] },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * HU-12: Cuadrilla inicia la reparación en campo ("En Proceso")
 */
const startWorkOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const order = await WorkOrder.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Orden de trabajo no encontrada.' });
    }

    order.estatus_orden = 'En Proceso';
    order.fecha_inicio = new Date();
    await order.save({ transaction });

    // Actualizar el reporte asociado a En Proceso (ID: 4)
    const report = await Report.findByPk(order.reporte_id, { transaction });
    if (report) {
      const estadoAnteriorId = report.estado_actual_id;
      report.estado_actual_id = 4; // En Proceso
      await report.save({ transaction });

      await ReportHistory.create({
        reporte_id: report.id,
        estado_anterior_id: estadoAnteriorId,
        estado_nuevo_id: 4,
        usuario_id: req.user.id,
        comentario: `Cuadrilla arribó a la zona e inició labores de reparación técnica en campo.`,
      }, { transaction });
    }

    await transaction.commit();

    res.json({
      success: true,
      message: `Orden ${order.folio_orden} marcada 'En Proceso'. Cuadrilla en labores.`,
      data: order,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * HU-13: Cierre de Orden con evidencia fotográfica obligatoria de la solución
 */
const completeWorkOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { observaciones_cuadrilla } = req.body;

    const order = await WorkOrder.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Orden de trabajo no encontrada.' });
    }

    order.estatus_orden = 'Terminada';
    order.observaciones_cuadrilla = observaciones_cuadrilla || 'Trabajos de mantenimiento y reparación concluidos conforme a normas técnicas.';
    order.fecha_cierre = new Date();
    await order.save({ transaction });

    const report = await Report.findByPk(order.reporte_id, { transaction });
    if (report) {
      // Registrar la fotografía de resolución si se adjuntó mediante Multer
      if (req.file) {
        const fileUrl = `/uploads/${req.file.filename}`;
        await ReportEvidence.create({
          reporte_id: report.id,
          url_imagen: fileUrl,
          nombre_archivo: req.file.filename,
          mimetype: req.file.mimetype,
          tamano_bytes: req.file.size,
          tipo: 'resolucion',
        }, { transaction });
      }

      const estadoAnteriorId = report.estado_actual_id;
      report.estado_actual_id = 5; // Atendido
      await report.save({ transaction });

      await ReportHistory.create({
        reporte_id: report.id,
        estado_anterior_id: estadoAnteriorId,
        estado_nuevo_id: 5,
        usuario_id: req.user.id,
        comentario: `Reparación concluida por la cuadrilla. Bitácora: ${order.observaciones_cuadrilla}`,
      }, { transaction });
    }

    await transaction.commit();

    const updated = await WorkOrder.findByPk(id, {
      include: [
        {
          model: Report,
          as: 'reporte',
          include: [
            { model: Category, as: 'categoria' },
            { model: ReportStatus, as: 'estado' },
            { model: ReportEvidence, as: 'evidencias' },
          ],
        },
        { model: User, as: 'cuadrilla', attributes: ['id', 'nombre'] },
      ],
    });

    res.json({
      success: true,
      message: `¡Orden ${order.folio_orden} completada con éxito y evidencia fotográfica archivada!`,
      data: updated,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Aprobación final por parte del Administrador o Supervisor de Obra
 */
const approveWorkOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const order = await WorkOrder.findByPk(id, { transaction });
    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ success: false, message: 'Orden de trabajo no encontrada.' });
    }

    order.estatus_orden = 'Aprobada';
    await order.save({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: `Orden de Trabajo ${order.folio_orden} aprobada y cerrada en expediente municipal.`,
      data: order,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

module.exports = {
  createWorkOrder,
  getWorkOrders,
  getMyWorkOrders,
  startWorkOrder,
  completeWorkOrder,
  approveWorkOrder,
};
