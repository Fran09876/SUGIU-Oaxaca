-- ============================================================================
-- SIGIU: Sistema Integral de Gestión de Incidencias Urbanas
-- Municipio de Oaxaca de Juárez - Dirección de Obras Públicas y Desarrollo Urbano
-- SCRIPT CONSOLIDADO DE INICIALIZACIÓN Y DESPLIEGUE EN PRODUCCIÓN (deploy_init.sql)
-- Arquitectura Cloud: PostgreSQL + PostGIS (Neon / Supabase / Render)
-- Iteración 6: Despliegue en Entorno de Producción
-- ============================================================================

-- 1. EXTENSIONES ESPACIALES Y CRIPTOGRÁFICAS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    BEGIN
        CREATE EXTENSION IF NOT EXISTS postgis;
        RAISE NOTICE 'Extensión espacial PostGIS activada con éxito.';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'PostGIS no disponible en el runtime; operando con GeoJSON y WGS84 nativo.';
    END;
END $$;

-- 2. REINICIALIZACIÓN LIMPIA DE TABLAS
DROP TABLE IF EXISTS ordenes_trabajo CASCADE;
DROP TABLE IF EXISTS apoyos_ciudadanos CASCADE;
DROP TABLE IF EXISTS historial_estados_reporte CASCADE;
DROP TABLE IF EXISTS imagenes_reporte CASCADE;
DROP TABLE IF EXISTS reportes CASCADE;
DROP TABLE IF EXISTS estados_reporte CASCADE;
DROP TABLE IF EXISTS categorias_incidencia CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS dependencias CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 3. CATÁLOGO DE ROLES DEL SISTEMA
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CATÁLOGO DE DEPENDENCIAS MUNICIPALES
CREATE TABLE dependencias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    siglas VARCHAR(20) NOT NULL,
    titular VARCHAR(100),
    telefono VARCHAR(50),
    direccion VARCHAR(200) DEFAULT 'Palacio Municipal / Plaza de la Danza S/N, Oaxaca de Juárez',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA DE USUARIOS Y AUTENTICACIÓN
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rol_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    dependencia_id INT REFERENCES dependencias(id) ON DELETE SET NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    colonia VARCHAR(100),
    estatus BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CATÁLOGO DE CATEGORÍAS DE INCIDENCIA
CREATE TABLE categorias_incidencia (
    id SERIAL PRIMARY KEY,
    dependencia_id INT NOT NULL REFERENCES dependencias(id) ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'AlertTriangle',
    color_hex VARCHAR(20) DEFAULT '#3F4B48',
    dias_horas_atencion INT DEFAULT 48,
    estatus BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CATÁLOGO DE ESTADOS DE REPORTE
CREATE TABLE estados_reporte (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    color_hex VARCHAR(20) NOT NULL,
    orden INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABLA PRINCIPAL DE REPORTES CIUDADANOS
CREATE TABLE reportes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio VARCHAR(30) NOT NULL UNIQUE,
    ciudadano_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    categoria_id INT NOT NULL REFERENCES categorias_incidencia(id) ON DELETE RESTRICT,
    estado_actual_id INT NOT NULL REFERENCES estados_reporte(id) DEFAULT 1,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'Media' CHECK (prioridad IN ('Baja', 'Media', 'Alta', 'Urgente')),
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    ubicacion_geografica JSONB,
    direccion_referencia TEXT,
    colonia VARCHAR(100) DEFAULT 'Centro Histórico',
    codigo_postal VARCHAR(10) DEFAULT '68000',
    cuadrilla_asignada_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    votos_apoyo INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABLA DE EVIDENCIAS FOTOGRÁFICAS
CREATE TABLE imagenes_reporte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    url_imagen VARCHAR(255) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    mimetype VARCHAR(100),
    tamano_bytes BIGINT,
    tipo VARCHAR(30) DEFAULT 'inicial' CHECK (tipo IN ('inicial', 'inspeccion', 'resolucion')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABLA DE HISTORIAL DE ESTADOS (TRAZABILIDAD Y AUDITORÍA)
CREATE TABLE historial_estados_reporte (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    estado_anterior_id INT REFERENCES estados_reporte(id),
    estado_nuevo_id INT NOT NULL REFERENCES estados_reporte(id),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    comentario TEXT,
    fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. TABLA DE APOYOS CIUDADANOS ("A MÍ TAMBIÉN ME AFECTA")
CREATE TABLE apoyos_ciudadanos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    ciudadano_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(reporte_id, ciudadano_id)
);

-- 12. TABLA DE ÓRDENES DE TRABAJO (DESPACHO DE CUADRILLAS)
CREATE TABLE ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio_orden VARCHAR(30) NOT NULL UNIQUE,
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    operador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    cuadrilla_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    instrucciones TEXT NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'Media',
    fecha_limite TIMESTAMP WITH TIME ZONE,
    estatus_orden VARCHAR(30) DEFAULT 'Asignada' CHECK (estatus_orden IN ('Asignada', 'En Proceso', 'Atendida', 'Cancelada')),
    observaciones_cuadrilla TEXT,
    foto_resolucion VARCHAR(255),
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES DE RENDIMIENTO Y CONSULTA ESPACIAL
-- ============================================================================
CREATE INDEX idx_reportes_folio ON reportes (folio);
CREATE INDEX idx_reportes_ciudadano ON reportes (ciudadano_id);
CREATE INDEX idx_reportes_categoria ON reportes (categoria_id);
CREATE INDEX idx_reportes_estado ON reportes (estado_actual_id);
CREATE INDEX idx_reportes_lat_lng ON reportes (latitud, longitud);
CREATE INDEX idx_reportes_created_at ON reportes (created_at DESC);
CREATE INDEX idx_imagenes_reporte ON imagenes_reporte (reporte_id);
CREATE INDEX idx_historial_reporte ON historial_estados_reporte (reporte_id);
CREATE INDEX idx_ordenes_folio ON ordenes_trabajo (folio_orden);
CREATE INDEX idx_ordenes_cuadrilla ON ordenes_trabajo (cuadrilla_id);
CREATE INDEX idx_ordenes_reporte ON ordenes_trabajo (reporte_id);

-- ============================================================================
-- DATOS SEMILLA INICIALES (CATÁLOGOS Y USUARIOS DEMO)
-- ============================================================================

-- Roles
INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'Administrador', 'Control total de la plataforma, estadísticas globales, configuración y catálogos.'),
(2, 'Operador', 'Enlace de dependencia responsable de atender y despachar incidencias asignadas.'),
(3, 'Cuadrilla', 'Personal operativo en campo que ejecuta las reparaciones y sube evidencia.'),
(4, 'Ciudadano', 'Habitante del Municipio de Oaxaca de Juárez que registra y consulta reportes.')
ON CONFLICT (id) DO NOTHING;

-- Dependencias
INSERT INTO dependencias (id, nombre, siglas, titular, telefono) VALUES
(1, 'Dirección de Obras Públicas y Desarrollo Urbano', 'DOPDU', 'Arq. Facundo Alcocer', '951-501-5500'),
(2, 'Dirección de Servicios Municipales', 'DSM', 'Ing. Martín Bautista', '951-501-5520'),
(3, 'Sistema Operador de los Servicios de Agua Potable y Alcantarillado', 'SOAPA', 'Ing. Héctor Hernández', '951-501-5900'),
(4, 'Dirección de Movilidad y Tránsito Municipal', 'DMTM', 'Lic. Guadalupe Morales', '951-501-5540')
ON CONFLICT (id) DO NOTHING;

-- Categorías de Incidencia con SLA
INSERT INTO categorias_incidencia (id, dependencia_id, nombre, descripcion, icono, color_hex, dias_horas_atencion) VALUES
(1, 1, 'Bacheo y Pavimentación', 'Baches profundos, hundimientos, fracturas de pavimento o adoquín.', 'Wrench', '#151719', 48),
(2, 2, 'Alumbrado Público', 'Luminarias apagadas, cables sueltos, postes dañados o intermitentes.', 'SunMedium', '#7D8181', 24),
(3, 3, 'Fugas de Agua y Drenaje', 'Fuga de agua potable en red pública, tapas de registro caídas o drenaje colapsado.', 'Droplets', '#3F4B48', 12),
(4, 2, 'Recolección de Basura y Parques', 'Puntos clandestinos de basura, ramas caídas o mantenimiento de jardines públicos.', 'Trash2', '#686C6C', 36),
(5, 4, 'Semáforos y Señalización', 'Semáforos apagados o desincronizados, señalamientos viales derribados.', 'TrafficCone', '#3F4B48', 24)
ON CONFLICT (id) DO NOTHING;

-- Estados Oficiales de Reporte
INSERT INTO estados_reporte (id, nombre, descripcion, color_hex, orden) VALUES
(1, 'Recibido', 'El reporte ha sido levantado por el ciudadano y espera revisión técnica.', '#7D8181', 1),
(2, 'En Validación', 'El enlace de la dependencia analiza la procedencia y ubicación geográfica.', '#3F4B48', 2),
(3, 'Asignado', 'Se ha canalizado a una cuadrilla operativa con orden de trabajo generada.', '#151719', 3),
(4, 'En Proceso', 'La cuadrilla se encuentra en campo realizando las labores de reparación.', '#3F4B48', 4),
(5, 'Atendido', 'Trabajo concluido satisfactoriamente con evidencia fotográfica de resolución.', '#15803D', 5),
(6, 'Rechazado', 'No procede por falta de datos, duplicidad o competencia fuera del municipio.', '#B91C1C', 6)
ON CONFLICT (id) DO NOTHING;

-- Usuarios Iniciales del Sistema (Contraseña para todos: JOse2002)
-- Hasheada con bcrypt 10 rounds vía pgcrypto
INSERT INTO usuarios (id, rol_id, dependencia_id, nombre, email, password_hash, telefono, colonia, estatus) VALUES
('11111111-1111-1111-1111-111111111111', 1, NULL, 'Ing. José Francisco Pérez', 'admin@oaxaca.gob.mx', crypt('JOse2002', gen_salt('bf', 10)), '951-123-4567', 'Centro Histórico', TRUE),
('22222222-2222-2222-2222-222222222222', 2, 1, 'Arq. María Elena Vásquez', 'operador@oaxaca.gob.mx', crypt('JOse2002', gen_salt('bf', 10)), '951-234-5678', 'Barrio de Jalatlaco', TRUE),
('33333333-3333-3333-3333-333333333333', 3, 1, 'Cuadrilla 01 - Obras Viales DOPDU', 'cuadrilla@oaxaca.gob.mx', crypt('JOse2002', gen_salt('bf', 10)), '951-888-1122', 'San Felipe del Agua', TRUE),
('44444444-4444-4444-4444-444444444444', 3, 2, 'Cuadrilla 02 - Alumbrado y Redes', 'cuadrilla2@oaxaca.gob.mx', crypt('JOse2002', gen_salt('bf', 10)), '951-777-3344', 'Cinco Señores', TRUE),
('55555555-5555-5555-5555-555555555555', 4, NULL, 'Carlos Jiménez Mendoza', 'ciudadano@oaxaca.gob.mx', crypt('JOse2002', gen_salt('bf', 10)), '951-555-0199', 'Colonia Reforma', TRUE)
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Reportes Iniciales de Prueba en Oaxaca de Juárez (Coordenadas Reales WGS84)
INSERT INTO reportes (id, folio, ciudadano_id, categoria_id, estado_actual_id, titulo, descripcion, prioridad, latitud, longitud, ubicacion_geografica, direccion_referencia, colonia, codigo_postal, cuadrilla_asignada_id, votos_apoyo) VALUES
('aa111111-1111-1111-1111-111111111111', 'REP-202611-001', '55555555-5555-5555-5555-555555555555', 1, 3, 'Bache profundo frente al Mercado 20 de Noviembre', 'Bache de aproximadamente 1 metro de diámetro con exposición de adoquín dañado, afecta el tránsito del carril derecho.', 'Alta', 17.06012400, -96.72635100, '{"type":"Point","coordinates":[-96.726351,17.060124]}', 'Calle 20 de Noviembre esq. Aldama', 'Centro Histórico', '68000', '33333333-3333-3333-3333-333333333333', 14),
('bb222222-2222-2222-2222-222222222222', 'REP-202611-002', '55555555-5555-5555-5555-555555555555', 2, 1, 'Luminarias apagadas en Andador Turístico Macedonio Alcalá', 'Tramo completamente a oscuras entre Murguía y Morelos, genera sensación de inseguridad nocturna en zona peatonal.', 'Media', 17.06584200, -96.72412800, '{"type":"Point","coordinates":[-96.724128,17.065842]}', 'Andador Turístico frente al IAGO', 'Centro Histórico', '68000', NULL, 8),
('cc333333-3333-3333-3333-333333333333', 'REP-202611-003', '55555555-5555-5555-5555-555555555555', 3, 4, 'Fuga de agua potable abundante en banqueta', 'Brote continuo de agua limpia desde la toma domiciliaria hacia la cinta asfáltica desde hace 24 horas.', 'Urgente', 17.07845000, -96.71982000, '{"type":"Point","coordinates":[-96.719820,17.078450]}', 'Calzada Porfirio Díaz No. 340', 'Colonia Reforma', '68050', '33333333-3333-3333-3333-333333333333', 21),
('dd444444-4444-4444-4444-444444444444', 'REP-202611-004', '55555555-5555-5555-5555-555555555555', 4, 1, 'Acumulación de residuos sólidos en esquina del templo', 'Bolsas de basura acumuladas fuera del horario establecido provocando dispersión por fauna canina.', 'Baja', 17.06711000, -96.71542000, '{"type":"Point","coordinates":[-96.715420,17.067110]}', 'Calle Curtidurías esq. 5 de Mayo', 'Barrio de Jalatlaco', '68080', NULL, 5),
('ee555555-5555-5555-5555-555555555555', 'REP-202611-005', '55555555-5555-5555-5555-555555555555', 5, 5, 'Semáforo desincronizado en crucero vehicular', 'El semáforo parpadea en ámbar en ambos sentidos generando congestionamiento en horas pico.', 'Alta', 17.07231000, -96.71189000, '{"type":"Point","coordinates":[-96.711890,17.072310]}', 'Av. Héroes de Chapultepec esq. Blvd. Eduardo Vasconcelos', 'Colonia Díaz Ordaz', '68040', '33333333-3333-3333-3333-333333333333', 19)
ON CONFLICT (folio) DO NOTHING;

-- Orden de Trabajo para el reporte 001
INSERT INTO ordenes_trabajo (id, folio_orden, reporte_id, operador_id, cuadrilla_id, instrucciones, prioridad, fecha_limite, estatus_orden) VALUES
('f1f1f1f1-1111-1111-1111-111111111111', 'OT-202611-001', 'aa111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'Reparar socavón y nivelar carpeta asfáltica. Cierre parcial nocturno coordinado con Policía Vial.', 'Alta', NOW() + INTERVAL '2 days', 'Asignada')
ON CONFLICT (folio_orden) DO NOTHING;

-- Historial inicial de estados
INSERT INTO historial_estados_reporte (reporte_id, estado_anterior_id, estado_nuevo_id, usuario_id, comentario) VALUES
('aa111111-1111-1111-1111-111111111111', NULL, 1, '55555555-5555-5555-5555-555555555555', 'Reporte levantado por ciudadano en plataforma SIGIU.'),
('aa111111-1111-1111-1111-111111111111', 1, 2, '22222222-2222-2222-2222-222222222222', 'Inspección técnica validada por operador DOPDU.'),
('aa111111-1111-1111-1111-111111111111', 2, 3, '22222222-2222-2222-2222-222222222222', 'Generada Orden de Trabajo OT-202611-001 y asignada a Cuadrilla 01.');

-- Ajustar secuencias de ID
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('dependencias_id_seq', (SELECT MAX(id) FROM dependencias));
SELECT setval('categorias_incidencia_id_seq', (SELECT MAX(id) FROM categorias_incidencia));
SELECT setval('estados_reporte_id_seq', (SELECT MAX(id) FROM estados_reporte));

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================
SELECT 'SIGIU Inicializado Correctamente' AS status,
       (SELECT COUNT(*) FROM roles) AS total_roles,
       (SELECT COUNT(*) FROM dependencias) AS total_dependencias,
       (SELECT COUNT(*) FROM categorias_incidencia) AS total_categorias,
       (SELECT COUNT(*) FROM estados_reporte) AS total_estados,
       (SELECT COUNT(*) FROM usuarios) AS total_usuarios,
       (SELECT COUNT(*) FROM reportes) AS total_reportes;
