const {
  sequelize,
  Role,
  Department,
  User,
  Category,
  ReportStatus,
  Report,
  ReportEvidence,
  ReportHistory,
  WorkOrder,
} = require('../models');
const bcrypt = require('bcryptjs');

const runSeed = async () => {
  try {
    console.log('[Seed] Sincronizando catálogos y modelos en PostgreSQL (sigiu_db)...');
    await sequelize.sync();

    console.log('[Seed] Insertando roles oficiales...');
    const rolesData = [
      { id: 1, nombre: 'Administrador', descripcion: 'Control total de la plataforma, estadísticas globales, configuración y catálogos.' },
      { id: 2, nombre: 'Operador', descripcion: 'Enlace de dependencia responsable de atender incidencias asignadas en campo.' },
      { id: 3, nombre: 'Cuadrilla', descripcion: 'Personal operativo en campo que atiende las fallas y sube evidencia de resolución.' },
      { id: 4, nombre: 'Ciudadano', descripcion: 'Habitante del Municipio de Oaxaca de Juárez que registra y da seguimiento a incidencias.' },
    ];

    for (const r of rolesData) {
      await Role.findOrCreate({ where: { id: r.id }, defaults: r });
    }

    console.log('[Seed] Insertando dependencias municipales...');
    const depsData = [
      { id: 1, nombre: 'Dirección de Obras Públicas y Desarrollo Urbano', siglas: 'DOPDU', titular: 'Arq. Facundo Alcocer', telefono: '951-501-5500', direccion: 'Plaza de la Danza S/N, Col. Centro, Oaxaca de Juárez' },
      { id: 2, nombre: 'Dirección de Servicios Municipales', siglas: 'DSM', titular: 'Ing. Martín Bautista', telefono: '951-501-5520', direccion: 'Av. Ferrocarril 100, Col. Cinco Señores, Oaxaca de Juárez' },
      { id: 3, nombre: 'Sistema Operador de los Servicios de Agua Potable y Alcantarillado', siglas: 'SOAPA', titular: 'Ing. Héctor Hernández', telefono: '951-501-5900', direccion: 'Manuel Bravo 417, Centro, Oaxaca de Juárez' },
      { id: 4, nombre: 'Dirección de Movilidad y Tránsito Municipal', siglas: 'DMTM', titular: 'Lic. Guadalupe Morales', telefono: '951-501-5540', direccion: 'Hidalgo 120, Centro, Oaxaca de Juárez' },
    ];

    for (const d of depsData) {
      await Department.findOrCreate({ where: { id: d.id }, defaults: d });
    }

    console.log('[Seed] Insertando estados de reporte...');
    const statusData = [
      { id: 1, nombre: 'Recibido', descripcion: 'El reporte ha sido levantado por el ciudadano y espera revisión técnica.', color_hex: '#7D8181', orden: 1 },
      { id: 2, nombre: 'En Validación', descripcion: 'El enlace de la dependencia analiza la procedencia y ubicación geográfica.', color_hex: '#3F4B48', orden: 2 },
      { id: 3, nombre: 'Asignado', descripcion: 'Se ha canalizado a una cuadrilla operativa con orden de trabajo generada.', color_hex: '#151719', orden: 3 },
      { id: 4, nombre: 'En Proceso', descripcion: 'La cuadrilla se encuentra en campo realizando las labores de reparación.', color_hex: '#3F4B48', orden: 4 },
      { id: 5, nombre: 'Atendido', descripcion: 'Trabajo concluido satisfactoriamente con evidencia fotográfica de resolución.', color_hex: '#15803D', orden: 5 },
      { id: 6, nombre: 'Rechazado', descripcion: 'No procede por falta de datos, duplicidad o competencia fuera del municipio.', color_hex: '#B91C1C', orden: 6 },
    ];

    for (const s of statusData) {
      await ReportStatus.findOrCreate({ where: { id: s.id }, defaults: s });
    }

    console.log('[Seed] Insertando categorías de incidencia...');
    const catData = [
      { id: 1, dependencia_id: 1, nombre: 'Bacheo y Pavimentación', descripcion: 'Baches profundos, hundimientos, fracturas de pavimento o adoquín.', icono: 'Wrench', color_hex: '#151719', dias_horas_atencion: 48 },
      { id: 2, dependencia_id: 2, nombre: 'Alumbrado Público', descripcion: 'Luminarias apagadas, cables sueltos, postes dañados o intermitentes.', icono: 'SunMedium', color_hex: '#7D8181', dias_horas_atencion: 24 },
      { id: 3, dependencia_id: 3, nombre: 'Fugas de Agua y Drenaje', descripcion: 'Fuga de agua potable en red pública, tapas de registro caídas o drenaje colapsado.', icono: 'Droplets', color_hex: '#3F4B48', dias_horas_atencion: 12 },
      { id: 4, dependencia_id: 2, nombre: 'Recolección de Basura y Parques', descripcion: 'Puntos clandestinos de basura, ramas caídas o mantenimiento de jardines públicos.', icono: 'Trash2', color_hex: '#686C6C', dias_horas_atencion: 36 },
      { id: 5, dependencia_id: 4, nombre: 'Semáforos y Señalización', descripcion: 'Semáforos apagados o desincronizados, señalamientos viales derribados.', icono: 'TrafficCone', color_hex: '#3F4B48', dias_horas_atencion: 24 },
    ];

    for (const c of catData) {
      await Category.findOrCreate({ where: { id: c.id }, defaults: c });
    }

    console.log('[Seed] Insertando usuarios del sistema (Admin, Operador, Cuadrilla, Ciudadano)...');
    const passwordHash = await bcrypt.hash('JOse2002', 10);

    const [adminUser] = await User.findOrCreate({
      where: { email: 'admin@oaxaca.gob.mx' },
      defaults: {
        nombre: 'Ing. José Francisco Pérez',
        email: 'admin@oaxaca.gob.mx',
        password_hash: passwordHash,
        rol_id: 1, // Administrador
        colonia: 'Centro Histórico',
        telefono: '951-123-4567',
        estatus: true,
      },
    });
    adminUser.password_hash = passwordHash;
    await adminUser.save();

    const [operadorUser] = await User.findOrCreate({
      where: { email: 'operador@oaxaca.gob.mx' },
      defaults: {
        nombre: 'Arq. María Elena Vásquez',
        email: 'operador@oaxaca.gob.mx',
        password_hash: passwordHash,
        rol_id: 2, // Operador
        dependencia_id: 1, // DOPDU
        colonia: 'Barrio de Jalatlaco',
        telefono: '951-234-5678',
        estatus: true,
      },
    });
    operadorUser.password_hash = passwordHash;
    await operadorUser.save();

    const [cuadrillaUser] = await User.findOrCreate({
      where: { email: 'cuadrilla@oaxaca.gob.mx' },
      defaults: {
        nombre: 'Cuadrilla 01 - Obras Viales DOPDU',
        email: 'cuadrilla@oaxaca.gob.mx',
        password_hash: passwordHash,
        rol_id: 3, // Cuadrilla
        dependencia_id: 1, // DOPDU
        colonia: 'San Felipe del Agua',
        telefono: '951-888-1122',
        estatus: true,
      },
    });
    cuadrillaUser.password_hash = passwordHash;
    await cuadrillaUser.save();

    const [cuadrilla2User] = await User.findOrCreate({
      where: { email: 'cuadrilla2@oaxaca.gob.mx' },
      defaults: {
        nombre: 'Cuadrilla 02 - Alumbrado y Redes',
        email: 'cuadrilla2@oaxaca.gob.mx',
        password_hash: passwordHash,
        rol_id: 3, // Cuadrilla
        dependencia_id: 2, // Servicios Municipales
        colonia: 'Cinco Señores',
        telefono: '951-777-3344',
        estatus: true,
      },
    });
    cuadrilla2User.password_hash = passwordHash;
    await cuadrilla2User.save();

    const [ciudadanoUser] = await User.findOrCreate({
      where: { email: 'ciudadano@oaxaca.gob.mx' },
      defaults: {
        nombre: 'Carlos Jiménez Mendoza',
        email: 'ciudadano@oaxaca.gob.mx',
        password_hash: passwordHash,
        rol_id: 4, // Ciudadano
        colonia: 'Colonia Reforma',
        telefono: '951-345-6789',
        estatus: true,
      },
    });
    ciudadanoUser.password_hash = passwordHash;
    await ciudadanoUser.save();

    console.log('[Seed] Insertando reportes reales de muestra en Oaxaca de Juárez...');
    const reportesMuestra = [
      {
        folio: 'OAX-2026-1001',
        ciudadano_id: ciudadanoUser.id,
        categoria_id: 1, // Bacheo
        estado_actual_id: 1, // Recibido
        titulo: 'Bache profundo sobre calle Macedonio Alcalá',
        descripcion: 'Bache que daña el paso peatonal y vehículos turísticos a la altura del andador turístico, frente al Museo Textil.',
        prioridad: 'Alta',
        latitud: 17.0629,
        longitud: -96.7231,
        ubicacion_geografica: { type: 'Point', coordinates: [-96.7231, 17.0629], crs: { type: 'name', properties: { name: 'EPSG:4326' } } },
        direccion_referencia: 'Andador Macedonio Alcalá esquina con Av. Independencia',
        colonia: 'Centro Histórico',
        votos_apoyo: 14,
      },
      {
        folio: 'OAX-2026-1002',
        ciudadano_id: ciudadanoUser.id,
        cuadrilla_asignada_id: cuadrilla2User.id,
        categoria_id: 2, // Alumbrado
        estado_actual_id: 3, // Asignado
        titulo: 'Luminarias apagadas en Plaza de la Danza',
        descripcion: 'Tres farolas coloniales no encienden desde hace dos días, generando oscuridad en las escalinatas de la Plaza de la Danza.',
        prioridad: 'Media',
        latitud: 17.0612,
        longitud: -96.7275,
        ubicacion_geografica: { type: 'Point', coordinates: [-96.7275, 17.0612], crs: { type: 'name', properties: { name: 'EPSG:4326' } } },
        direccion_referencia: 'Frente al Palacio Municipal y Basílica de la Soledad',
        colonia: 'Centro Histórico',
        votos_apoyo: 8,
      },
      {
        folio: 'OAX-2026-1003',
        ciudadano_id: ciudadanoUser.id,
        cuadrilla_asignada_id: cuadrillaUser.id,
        categoria_id: 3, // Fugas
        estado_actual_id: 4, // En Proceso
        titulo: 'Fuga de agua potable considerable en Calzada Porfirio Díaz',
        descripcion: 'Brote constante de agua limpia en el pavimento, escurriendo hacia el crucero del Parque El Llano.',
        prioridad: 'Urgente',
        latitud: 17.0735,
        longitud: -96.7198,
        ubicacion_geografica: { type: 'Point', coordinates: [-96.7198, 17.0735], crs: { type: 'name', properties: { name: 'EPSG:4326' } } },
        direccion_referencia: 'Calzada Porfirio Díaz casi esquina con Escuela Naval Militar',
        colonia: 'Colonia Reforma',
        votos_apoyo: 29,
      },
      {
        folio: 'OAX-2026-1004',
        ciudadano_id: ciudadanoUser.id,
        cuadrilla_asignada_id: cuadrillaUser.id,
        categoria_id: 4, // Parques y Basura
        estado_actual_id: 5, // Atendido
        titulo: 'Ramas de laurel derribadas en Parque El Llano',
        descripcion: 'Ramas de laurel obstruyendo la trotapista poniente del parque. Retiro y limpieza requerida.',
        prioridad: 'Media',
        latitud: 17.0682,
        longitud: -96.7208,
        ubicacion_geografica: { type: 'Point', coordinates: [-96.7208, 17.0682], crs: { type: 'name', properties: { name: 'EPSG:4326' } } },
        direccion_referencia: 'Paseo Juárez El Llano, cerca del monumento a Juárez',
        colonia: 'Centro Histórico',
        votos_apoyo: 11,
      },
    ];

    for (const rep of reportesMuestra) {
      const [createdRep, isNew] = await Report.findOrCreate({
        where: { folio: rep.folio },
        defaults: rep,
      });

      if (isNew) {
        await ReportEvidence.create({
          reporte_id: createdRep.id,
          url_imagen: '/uploads/evidencia-oaxaca-default.jpg',
          nombre_archivo: 'evidencia-oaxaca-default.jpg',
          mimetype: 'image/jpeg',
          tamano_bytes: 350000,
          tipo: 'inicial',
        });

        await ReportHistory.create({
          reporte_id: createdRep.id,
          estado_anterior_id: null,
          estado_nuevo_id: createdRep.estado_actual_id,
          usuario_id: ciudadanoUser.id,
          comentario: 'Reporte registrado y validado en sistema SIGIU.',
        });
      }
    }

    console.log('[Seed] Insertando órdenes de trabajo de muestra (HU-09, HU-12)...');
    const rep2 = await Report.findOne({ where: { folio: 'OAX-2026-1002' } });
    if (rep2) {
      await WorkOrder.findOrCreate({
        where: { reporte_id: rep2.id },
        defaults: {
          folio_orden: 'OT-2026-8001',
          reporte_id: rep2.id,
          operador_id: operadorUser.id,
          cuadrilla_id: cuadrilla2User.id,
          instrucciones: 'Revisión urgente del circuito de balastros y sustitución de luminarias coloniales en Plaza de la Danza.',
          prioridad: 'Media',
          fecha_limite: new Date(Date.now() + 24 * 3600 * 1000),
          estatus_orden: 'Asignada',
        },
      });
    }

    const rep3 = await Report.findOne({ where: { folio: 'OAX-2026-1003' } });
    if (rep3) {
      await WorkOrder.findOrCreate({
        where: { reporte_id: rep3.id },
        defaults: {
          folio_orden: 'OT-2026-8002',
          reporte_id: rep3.id,
          operador_id: operadorUser.id,
          cuadrilla_id: cuadrillaUser.id,
          instrucciones: 'Reparación de fuga en tubería de 4 pulgadas con maquinaria ligera y corte de pavimento.',
          prioridad: 'Urgente',
          fecha_limite: new Date(Date.now() + 12 * 3600 * 1000),
          estatus_orden: 'En Proceso',
          fecha_inicio: new Date(Date.now() - 2 * 3600 * 1000),
          observaciones_cuadrilla: 'Se detectó fisura en codo de conexión de red potable. En trabajos de sustitución.',
        },
      });
    }

    console.log('----------------------------------------------------');
    console.log('[Seed] ¡Datos iniciales e Iteraciones 3-5 cargados con éxito!');
    console.log('Credenciales oficiales:');
    console.log(' - Admin:      admin@oaxaca.gob.mx      | Clave: JOse2002');
    console.log(' - Operador:   operador@oaxaca.gob.mx   | Clave: JOse2002');
    console.log(' - Cuadrilla:  cuadrilla@oaxaca.gob.mx  | Clave: JOse2002');
    console.log(' - Ciudadano:  ciudadano@oaxaca.gob.mx | Clave: JOse2002');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('[Seed Error]:', error);
  }
};

if (require.main === module) {
  runSeed().then(() => process.exit(0));
}

module.exports = runSeed;
