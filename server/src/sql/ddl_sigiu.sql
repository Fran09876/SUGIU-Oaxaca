-- ============================================================================
-- SIGIU: Sistema Integral de Gestión de Incidencias Urbanas
-- Municipio de Oaxaca de Juárez - Dirección de Obras Públicas y Desarrollo Urbano
-- Script DDL: Inicialización de Base de Datos Espacial (PostgreSQL 15+)
-- Iteraciones 0 a 5 completas
-- ============================================================================

-- 1. EXTENSIONES Y FUNCIONES
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
    BEGIN
        CREATE EXTENSION IF NOT EXISTS postgis;
        RAISE NOTICE 'Extensión PostGIS habilitada exitosamente.';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Extensión PostGIS no compilada para esta versión; operando con GeoJSON y coordenadas WGS84 nativas.';
    END;
END $$;

-- 2. LIMPIEZA DE TABLAS PREVIAS
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

-- 4. CATÁLOGO DE DEPENDENCIAS MUNICIPALES DE OAXACA DE JUÁREZ
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

-- 6. CATÁLOGO DE CATEGORÍAS DE INCIDENCIA URBANA
CREATE TABLE categorias_incidencia (
    id SERIAL PRIMARY KEY,
    dependencia_id INT NOT NULL REFERENCES dependencias(id) ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'AlertTriangle',
    color_hex VARCHAR(20) DEFAULT '#3C507D',
    dias_horas_atencion INT DEFAULT 72,
    estatus BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CATÁLOGO DE ESTADOS DEL REPORTE
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
    
    -- Coordenadas Numéricas Decimales (WGS84)
    latitud NUMERIC(10, 8) NOT NULL,
    longitud NUMERIC(11, 8) NOT NULL,
    
    -- Representación Geoespacial (GeoJSON / PostGIS Point)
    ubicacion_geografica JSONB,
    
    -- Referencias descriptivas
    direccion_referencia TEXT,
    colonia VARCHAR(100) DEFAULT 'Centro Histórico',
    codigo_postal VARCHAR(10) DEFAULT '68000',
    
    -- Asignación para Operadores de Cuadrilla (Iteración 3 y 5)
    cuadrilla_asignada_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Sistema de apoyo ciudadano ("A mí también me afecta")
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

-- 12. TABLA DE ÓRDENES DE TRABAJO Y DESPACHO (ITERACIÓN 3 Y 5 - HU-09, HU-12, HU-13)
CREATE TABLE ordenes_trabajo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio_orden VARCHAR(30) NOT NULL UNIQUE,
    reporte_id UUID NOT NULL REFERENCES reportes(id) ON DELETE CASCADE,
    operador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    cuadrilla_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    instrucciones TEXT NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'Media',
    fecha_limite TIMESTAMP WITH TIME ZONE,
    estatus_orden VARCHAR(30) DEFAULT 'Asignada',
    observaciones_cuadrilla TEXT,
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_cierre TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================================
CREATE INDEX idx_reportes_folio ON reportes (folio);
CREATE INDEX idx_reportes_ciudadano ON reportes (ciudadano_id);
CREATE INDEX idx_reportes_categoria ON reportes (categoria_id);
CREATE INDEX idx_reportes_estado ON reportes (estado_actual_id);
CREATE INDEX idx_reportes_lat_lng ON reportes (latitud, longitud);
CREATE INDEX idx_reportes_created_at ON reportes (created_at DESC);
CREATE INDEX idx_imagenes_reporte ON imagenes_reporte (reporte_id);
CREATE INDEX idx_ordenes_folio ON ordenes_trabajo (folio_orden);
CREATE INDEX idx_ordenes_cuadrilla ON ordenes_trabajo (cuadrilla_id);
CREATE INDEX idx_ordenes_reporte ON ordenes_trabajo (reporte_id);

-- ============================================================================
-- DATOS INICIALES (SEEDS)
-- ============================================================================

-- Roles
INSERT INTO roles (id, nombre, descripcion) VALUES
(1, 'Administrador', 'Control total de la plataforma, estadísticas globales, configuración y catálogos.'),
(2, 'Operador', 'Enlace de dependencia responsable de atender incidencias asignadas en campo.'),
(3, 'Cuadrilla', 'Personal operativo en campo que ejecuta las reparaciones.'),
(4, 'Ciudadano', 'Habitante del Municipio de Oaxaca de Juárez que registra incidencias.')
ON CONFLICT (id) DO NOTHING;

-- Dependencias
INSERT INTO dependencias (id, nombre, siglas, titular, telefono) VALUES
(1, 'Dirección de Obras Públicas y Desarrollo Urbano', 'DOPDU', 'Arq. Facundo Alcocer', '951-501-5500'),
(2, 'Dirección de Servicios Municipales', 'DSM', 'Ing. Martín Bautista', '951-501-5520'),
(3, 'Sistema Operador de los Servicios de Agua Potable y Alcantarillado', 'SOAPA', 'Ing. Héctor Hernández', '951-501-5900'),
(4, 'Dirección de Movilidad y Tránsito Municipal', 'DMTM', 'Lic. Guadalupe Morales', '951-501-5540')
ON CONFLICT (id) DO NOTHING;

-- Categorías
INSERT INTO categorias_incidencia (id, dependencia_id, nombre, descripcion, icono, color_hex, dias_horas_atencion) VALUES
(1, 1, 'Bacheo y Pavimentación', 'Baches profundos, hundimientos, fracturas de pavimento o adoquín.', 'Wrench', '#3F4B48', 48),
(2, 2, 'Alumbrado Público', 'Luminarias apagadas, cables sueltos, postes dañados o intermitentes.', 'SunMedium', '#7D8181', 24),
(3, 3, 'Fugas de Agua y Drenaje', 'Fuga de agua potable en red pública, tapas de registro caídas o drenaje colapsado.', 'Droplets', '#151719', 12),
(4, 2, 'Recolección de Basura y Parques', 'Puntos clandestinos de basura, ramas caídas o mantenimiento de jardines públicos.', 'Trash2', '#3F4B48', 36),
(5, 4, 'Semáforos y Señalización', 'Semáforos apagados o desincronizados, señalamientos viales derribados.', 'TrafficCone', '#7D8181', 24)
ON CONFLICT (id) DO NOTHING;

-- Estados
INSERT INTO estados_reporte (id, nombre, descripcion, color_hex, orden) VALUES
(1, 'Recibido', 'El reporte ha sido levantado por el ciudadano y espera revisión técnica.', '#7D8181', 1),
(2, 'En Validación', 'El enlace de la dependencia analiza la procedencia y ubicación geográfica.', '#3F4B48', 2),
(3, 'Asignado', 'Se ha canalizado a una cuadrilla operativa con orden de trabajo generada.', '#151719', 3),
(4, 'En Proceso', 'La cuadrilla se encuentra en campo realizando las labores de reparación.', '#3F4B48', 4),
(5, 'Atendido', 'Trabajo concluido satisfactoriamente con evidencia fotográfica de resolución.', '#15803D', 5),
(6, 'Rechazado', 'No procede por falta de datos, duplicidad o competencia fuera del municipio.', '#B91C1C', 6)
ON CONFLICT (id) DO NOTHING;
