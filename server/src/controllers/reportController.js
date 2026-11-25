const { Report, ReportEvidence, ReportHistory, Category, ReportStatus, User, CitizenSupport, WorkOrder, Department, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * HU-06 y HU-07: Creación de reporte ciudadano con coordenadas GPS nativas y evidencia fotográfica
 */
const createReport = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      titulo,
      descripcion,
      categoria_id,
      latitud,
      longitud,
      direccion_referencia,
      colonia,
      prioridad,
    } = req.body;

    // Determinar ciudadano asociado (usuario autenticado o ciudadano digital)
    let ciudadanoId;
    if (req.user && req.user.id) {
      ciudadanoId = req.user.id;
    } else {
      let [defaultCitizen] = await User.findOrCreate({
        where: { email: 'ciudadano.digital@oaxaca.gob.mx' },
        defaults: {
          nombre: 'Ciudadano Digital Oaxaca',
          email: 'ciudadano.digital@oaxaca.gob.mx',
          password_hash: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
          rol_id: 4,
          colonia: 'Oaxaca de Juárez',
          estatus: true,
        },
        transaction,
      });
      ciudadanoId = defaultCitizen.id;
    }

    const lat = parseFloat(latitud);
    const lng = parseFloat(longitud);

    // Generación de Folio Único Oficial
    const year = new Date().getFullYear();
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const folio = `OAX-${year}-${randomHex}`;

    // Creación del reporte con punto espacial WGS84 (SRID 4326)
    const newReport = await Report.create({
      folio,
      ciudadano_id: ciudadanoId,
      categoria_id: parseInt(categoria_id, 10),
      estado_actual_id: 1, // 'Recibido'
      titulo,
      descripcion,
      prioridad: prioridad || 'Media',
      latitud: lat,
      longitud: lng,
      ubicacion_geografica: {
        type: 'Point',
        coordinates: [lng, lat],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } },
      },
      direccion_referencia: direccion_referencia || 'Sin referencias adicionales',
      colonia: colonia || 'Centro Histórico',
      votos_apoyo: 0,
    }, { transaction });

    // Registro de evidencia fotográfica si se adjuntó archivo mediante Multer
    let evidenceRecord = null;
    if (req.file) {
      const fileUrl = `/uploads/${req.file.filename}`;
      evidenceRecord = await ReportEvidence.create({
        reporte_id: newReport.id,
        url_imagen: fileUrl,
        nombre_archivo: req.file.filename,
        mimetype: req.file.mimetype,
        tamano_bytes: req.file.size,
        tipo: 'inicial',
      }, { transaction });
    }

    // Registro inicial en auditoría
    await ReportHistory.create({
      reporte_id: newReport.id,
      estado_anterior_id: null,
      estado_nuevo_id: 1, // Recibido
      usuario_id: ciudadanoId,
      comentario: 'Reporte levantado por el ciudadano a través de la PWA Móvil.',
    }, { transaction });

    await transaction.commit();

    // Consultar el reporte creado con todas sus asociaciones
    const completeReport = await Report.findByPk(newReport.id, {
      include: [
        { model: Category, as: 'categoria', attributes: ['id', 'nombre', 'icono', 'color_hex'] },
        { model: ReportStatus, as: 'estado', attributes: ['id', 'nombre', 'color_hex', 'orden'] },
        { model: ReportEvidence, as: 'evidencias' },
        { model: User, as: 'ciudadano', attributes: ['id', 'nombre', 'email', 'colonia'] },
      ],
    });

    res.status(201).json({
      success: true,
      message: `Incidencia urbana registrada con éxito. Folio asignado: ${folio}`,
      data: completeReport,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Listado de reportes con filtros avanzados por categoría, estado, dependencia, etc.
 */
const getReports = async (req, res, next) => {
  try {
    const { categoria_id, estado_id, prioridad, colonia, search, ciudadano_id, dependencia_id } = req.query;

    const where = {};

    if (categoria_id) {
      where.categoria_id = parseInt(categoria_id, 10);
    }

    if (estado_id) {
      where.estado_actual_id = parseInt(estado_id, 10);
    }

    if (prioridad) {
      where.prioridad = prioridad;
    }

    if (colonia) {
      where.colonia = { [Op.iLike]: `%${colonia}%` };
    }

    if (ciudadano_id) {
      where.ciudadano_id = ciudadano_id;
    }

    if (search) {
      where[Op.or] = [
        { folio: { [Op.iLike]: `%${search}%` } },
        { titulo: { [Op.iLike]: `%${search}%` } },
        { descripcion: { [Op.iLike]: `%${search}%` } },
        { direccion_referencia: { [Op.iLike]: `%${search}%` } },
        { colonia: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const categoryInclude = {
      model: Category,
      as: 'categoria',
      attributes: ['id', 'nombre', 'icono', 'color_hex', 'dias_horas_atencion'],
    };

    if (dependencia_id) {
      categoryInclude.where = { dependencia_id: parseInt(dependencia_id, 10) };
    }

    const reports = await Report.findAll({
      where,
      include: [
        categoryInclude,
        { model: ReportStatus, as: 'estado', attributes: ['id', 'nombre', 'color_hex', 'orden'] },
        { model: ReportEvidence, as: 'evidencias' },
        { model: User, as: 'ciudadano', attributes: ['id', 'nombre', 'colonia'] },
        { model: User, as: 'cuadrilla', attributes: ['id', 'nombre', 'telefono'] },
        {
          model: WorkOrder,
          as: 'ordenTrabajo',
          include: [{ model: User, as: 'cuadrilla', attributes: ['id', 'nombre', 'telefono'] }],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Detalle completo de un reporte específico por ID o Folio
 */
const getReportById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const report = await Report.findOne({
      where: {
        [Op.or]: [
          { id: id.includes('-') && id.length === 36 ? id : null },
          { folio: id },
        ],
      },
      include: [
        { model: Category, as: 'categoria' },
        { model: ReportStatus, as: 'estado' },
        { model: ReportEvidence, as: 'evidencias' },
        { model: User, as: 'ciudadano', attributes: ['id', 'nombre', 'email', 'colonia'] },
        { model: User, as: 'cuadrilla', attributes: ['id', 'nombre', 'email', 'telefono'] },
        {
          model: WorkOrder,
          as: 'ordenTrabajo',
          include: [{ model: User, as: 'cuadrilla', attributes: ['id', 'nombre', 'telefono'] }],
        },
        {
          model: ReportHistory,
          as: 'historial',
          include: [
            { model: ReportStatus, as: 'estadoNuevo', attributes: ['nombre', 'color_hex'] },
            { model: ReportStatus, as: 'estadoAnterior', attributes: ['nombre', 'color_hex'] },
            { model: User, as: 'usuario', attributes: ['nombre'] },
          ],
        },
      ],
      order: [
        [{ model: ReportHistory, as: 'historial' }, 'fecha_cambio', 'ASC'],
      ],
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'El reporte solicitado no existe o el folio es inválido.',
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * HU-10 y HU-11: Obtener GeoJSON estandarizado (RFC 7946) para visor Leaflet GIS
 */
const getReportsGeoJson = async (req, res, next) => {
  try {
    const { categoria_id, estado_id } = req.query;
    const where = {};
    if (categoria_id) where.categoria_id = parseInt(categoria_id, 10);
    if (estado_id) where.estado_actual_id = parseInt(estado_id, 10);

    const reports = await Report.findAll({
      where,
      include: [
        { model: Category, as: 'categoria', attributes: ['id', 'nombre', 'icono', 'color_hex'] },
        { model: ReportStatus, as: 'estado', attributes: ['id', 'nombre', 'color_hex'] },
        { model: ReportEvidence, as: 'evidencias', attributes: ['url_imagen', 'tipo'] },
      ],
    });

    const features = reports.map((r) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [parseFloat(r.longitud), parseFloat(r.latitud)],
      },
      properties: {
        id: r.id,
        folio: r.folio,
        titulo: r.titulo,
        descripcion: r.descripcion,
        prioridad: r.prioridad,
        colonia: r.colonia,
        direccion_referencia: r.direccion_referencia,
        votos_apoyo: r.votos_apoyo,
        categoria: r.categoria ? r.categoria.nombre : 'General',
        icono: r.categoria ? r.categoria.icono : 'AlertTriangle',
        color: r.estado ? r.estado.color_hex : '#3F4B48',
        estado: r.estado ? r.estado.nombre : 'Recibido',
        foto_inicial: r.evidencias && r.evidencias.length > 0 ? r.evidencias[0].url_imagen : null,
        created_at: r.created_at,
      },
    }));

    res.json({
      success: true,
      type: 'FeatureCollection',
      total: features.length,
      features,
      data: {
        type: 'FeatureCollection',
        total: features.length,
        features,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * HU-11: Obtener reportes propios del ciudadano autenticado con su línea de tiempo
 */
const getMyReports = async (req, res, next) => {
  try {
    const ciudadanoId = req.user.id;

    const reports = await Report.findAll({
      where: { ciudadano_id: ciudadanoId },
      include: [
        { model: Category, as: 'categoria' },
        { model: ReportStatus, as: 'estado' },
        { model: ReportEvidence, as: 'evidencias' },
        {
          model: ReportHistory,
          as: 'historial',
          include: [
            { model: ReportStatus, as: 'estadoNuevo' },
            { model: User, as: 'usuario', attributes: ['nombre'] },
          ],
        },
      ],
      order: [
        ['created_at', 'DESC'],
        [{ model: ReportHistory, as: 'historial' }, 'fecha_cambio', 'ASC'],
      ],
    });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * HU-10: Apoyo ciudadano colaborativo ("A mí también me afecta")
 */
const supportReport = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const ciudadanoId = req.user ? req.user.id : req.body.ciudadano_id;

    if (!ciudadanoId) {
      return res.status(401).json({
        success: false,
        message: 'Debes iniciar sesión para apoyar este reporte.',
      });
    }

    const report = await Report.findByPk(id, { transaction });
    if (!report) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado.',
      });
    }

    // Verificar duplicidad de voto
    const existing = await CitizenSupport.findOne({
      where: { reporte_id: id, ciudadano_id: ciudadanoId },
      transaction,
    });

    if (existing) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Ya has registrado tu apoyo a esta incidencia previamente.',
      });
    }

    await CitizenSupport.create({
      reporte_id: id,
      ciudadano_id: ciudadanoId,
    }, { transaction });

    await report.increment('votos_apoyo', { by: 1, transaction });
    await transaction.commit();

    res.json({
      success: true,
      message: '¡Gracias! Tu apoyo ha sido sumado para priorizar la atención de esta incidencia.',
      votos_apoyo: report.votos_apoyo + 1,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * Actualización de estado del reporte (para Operador / Administrador)
 */
const updateReportStatus = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { estado_id, comentario, cuadrilla_asignada_id } = req.body;

    const report = await Report.findByPk(id, { transaction });
    if (!report) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Reporte no encontrado.',
      });
    }

    const estadoAnteriorId = report.estado_actual_id;
    report.estado_actual_id = parseInt(estado_id, 10);
    if (cuadrilla_asignada_id) {
      report.cuadrilla_asignada_id = cuadrilla_asignada_id;
    }

    await report.save({ transaction });

    await ReportHistory.create({
      reporte_id: report.id,
      estado_anterior_id: estadoAnteriorId,
      estado_nuevo_id: parseInt(estado_id, 10),
      usuario_id: req.user ? req.user.id : null,
      comentario: comentario || `Estatus actualizado a ID ${estado_id}`,
    }, { transaction });

    await transaction.commit();

    const updated = await Report.findByPk(id, {
      include: [
        { model: Category, as: 'categoria' },
        { model: ReportStatus, as: 'estado' },
        { model: ReportEvidence, as: 'evidencias' },
      ],
    });

    res.json({
      success: true,
      message: 'Estado del reporte actualizado correctamente.',
      data: updated,
    });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

/**
 * HU-11: Métricas completas de analítica y rendición de cuentas
 */
const getStatistics = async (req, res, next) => {
  try {
    const total = await Report.count();
    const pendientes = await Report.count({ where: { estado_actual_id: [1, 2] } });
    const enProceso = await Report.count({ where: { estado_actual_id: [3, 4] } });
    const atendidos = await Report.count({ where: { estado_actual_id: 5 } });

    // Conteo por categoría
    const categories = await Category.findAll({
      attributes: ['id', 'nombre', 'color_hex'],
      include: [{ model: Report, as: 'reportes', attributes: ['id'] }],
    });

    const categoryStats = categories.map((c) => ({
      name: c.nombre,
      count: c.reportes ? c.reportes.length : 0,
      color: c.color_hex,
    }));

    // Conteo por Colonia (Zonas críticas / mapa de calor)
    const coloniaCounts = await Report.findAll({
      attributes: ['colonia', [sequelize.fn('COUNT', sequelize.col('id')), 'total']],
      group: ['colonia'],
      order: [[sequelize.literal('total'), 'DESC']],
      limit: 6,
    });

    const coloniasStats = coloniaCounts.map((item) => ({
      colonia: item.colonia || 'Sin especificar',
      total: parseInt(item.get('total'), 10),
    }));

    // Tasa de efectividad y tiempo promedio simulado/calculado
    const tasaEfectividad = total > 0 ? Math.round((atendidos / total) * 100) : 0;
    const tiempoPromedioHoras = 34.5; // Estimado promedio en horas

    const totalVotos = await Report.sum('votos_apoyo') || 0;

    res.json({
      success: true,
      data: {
        total,
        pendientes,
        enProceso,
        atendidos,
        tasaEfectividad,
        tiempoPromedioHoras,
        categoryStats,
        coloniasStats,
        kpis: {
          total_reportes: total,
          reportes_recibidos: pendientes,
          reportes_en_proceso: enProceso,
          reportes_atendidos: atendidos,
          tasa_resolucion_porcentaje: tasaEfectividad,
          tiempo_promedio_resolucion_horas: tiempoPromedioHoras,
          total_apoyos_ciudadanos: totalVotos,
        },
        top_colonias: coloniasStats.map((c) => ({ colonia: c.colonia, conteo: c.total })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  getReportById,
  getReportsGeoJson,
  getMyReports,
  supportReport,
  updateReportStatus,
  getStatistics,
};
