# INVENTARIO TÉCNICO INTEGRAL DEL PROYECTO SIGIU

**Proyecto:** Sistema Integral de Gestión de Incidencias Urbanas (SIGIU)  
**Institución Educativa:** Instituto Tecnológico de Oaxaca (TecNM)  
**Carrera:** Ingeniería en Sistemas Computacionales  
**Asignatura:** Desarrollo Web con Enfoque Ágil (Grupo 7SB)  
**Autor:** José Francisco Pérez Pérez (No. Control: 2211204)  
**Docente:** Cruz Hernández Bernardo Roberto  
**Fecha de Auditoría:** Noviembre 2026  
**Naturaleza del Sistema:** Plataforma Web Responsiva (Arquitectura Desacoplada Cliente-Servidor)

---

## 1. Estructura General del Repositorio

El proyecto se estructura como un monorepositorio con dos aplicaciones independientes (`client` y `server`), orquestadas a nivel raíz mediante un archivo `package.json`:

```
sigiu-oaxaca/
├── client/                     # Frontend: SPA React 19 + Vite + Tailwind CSS
│   ├── public/                 # Archivos estáticos (favicon, manifest.json)
│   ├── src/                    # Código fuente del cliente
│   │   ├── api/                # Clientes HTTP Axios organizados por dominio
│   │   ├── assets/             # Recursos multimedia e ilustraciones
│   │   ├── components/         # Componentes React clasificados por contexto
│   │   │   ├── auth/           # Modales de autenticación y registro
│   │   │   ├── common/         # Componentes comunes (Header, Layout)
│   │   │   ├── crew/           # Vistas operativas de campo para cuadrillas
│   │   │   ├── dashboard/      # Paneles de control (Admin y Operador)
│   │   │   ├── gis/            # Visor cartográfico y capas espaciales (Leaflet)
│   │   │   └── pwa/            # Vistas web responsivas para ciudadanos
│   │   ├── context/            # Context API de React (AuthContext)
│   │   ├── App.css / index.css # Estilos globales y reglas Tailwind
│   │   ├── App.jsx             # Componente raíz y enrutador condicional por rol
│   │   └── main.jsx            # Punto de entrada de React en el DOM
│   ├── index.html              # Plantilla HTML5 con viewport responsivo y Leaflet CSS
│   ├── package.json            # Manifiesto de dependencias del cliente
│   ├── postcss.config.js       # Configuración del procesador PostCSS
│   ├── tailwind.config.js      # Paleta de diseño y tokens de estilo Tailwind
│   └── vite.config.js          # Configuración del empaquetador Vite
├── server/                     # Backend: API RESTful en Node.js + Express
│   ├── src/                    # Código fuente del servidor
│   │   ├── config/             # Módulos de configuración (DB, JWT, Multer)
│   │   ├── controllers/        # Controladores de la lógica de negocio
│   │   ├── middlewares/        # Middlewares (Auth, ErrorHandler, Validación)
│   │   ├── models/             # Modelos relacionales ORM (Sequelize)
│   │   ├── routes/             # Enrutamiento modular de la API REST
│   │   ├── seeders/            # Semillas de datos iniciales
│   │   ├── sql/                # Script DDL SQL y definiciones de base de datos
│   │   ├── app.js              # Configuración de la aplicación Express
│   │   └── server.js           # Inicialización del servidor HTTP y sincronización DB
│   ├── tests/                  # Suite de pruebas automatizadas (Node.js Test Runner)
│   ├── uploads/                # Directorio local de almacenamiento de evidencias
│   ├── .env                    # Variables de entorno activas (ignorado en repositorios públicos)
│   ├── .env.example            # Plantilla de variables de entorno
│   └── package.json            # Manifiesto de dependencias del servidor
├── docs/                       # Documentos complementarios y wireframes generados
│   └── wireframes/             # Bocetos iniciales de interfaces (PNG)
├── documentacion/              # Carpeta de documentación formal académica y técnica
│   ├── auditoria/              # Evidencias y diagnósticos de auditoría
│   └── diagramas/              # Diagramas UML y de arquitectura
├── package.json                # Scripts npm para ejecución simultánea
└── README.md                   # Descripción general inicial del repositorio
```

---

## 2. Tecnologías y Versiones Verificadas

### 2.1. Entorno de Ejecución y Plataforma Base
- **Sistema Operativo del Host:** Microsoft Windows 11 Home Single Language (x64)
- **Node.js:** v18+ LTS / Compatible con especificaciones ES2022 y Node:test nativo
- **Gestor de Paquetes:** npm (v10+)
- **Python (Herramientas Auxiliares de Documentación):** v3.13.0 con `python-docx` v1.2.0

### 2.2. Backend (Servidor API REST)
| Tecnología / Librería | Versión Verificada | Propósito en el Sistema |
| :--- | :--- | :--- |
| **Node.js** | Entorno v18+ | Runtime de ejecución del servidor backend |
| **Express.js** | `^4.18.2` | Framework HTTP para el diseño de la API RESTful |
| **Sequelize** | `^6.37.1` | ORM para modelado relacional y mapeo de datos |
| **pg (node-postgres)** | `^8.11.3` | Driver cliente nativo para comunicación con PostgreSQL |
| **pg-hstore** | `^2.3.4` | Serializador de estructuras tipo hstore para PostgreSQL |
| **sqlite3** | `^5.1.7` | Driver SQLite embebido para modo de desarrollo desacoplado |
| **bcryptjs** | `^2.4.3` | Función hash criptográfica para almacenamiento seguro de contraseñas |
| **jsonwebtoken** | `^9.0.2` | Generación y verificación de tokens de autenticación JWT Stateless |
| **multer** | `^1.4.5-lts.1` | Middleware para gestión de formularios multipart/form-data y subida de imágenes |
| **cors** | `^2.8.5` | Control de acceso HTTP mediante Cross-Origin Resource Sharing |
| **dotenv** | `^16.4.5` | Carga de variables de entorno desde archivo `.env` |
| **morgan** | `^1.10.0` | Logger de solicitudes HTTP en consola para depuración |
| **uuid** | `^9.0.1` | Generación de identificadores únicos universales (UUID v4) |

### 2.3. Frontend (Cliente Web Responsivo)
| Tecnología / Librería | Versión Verificada | Propósito en el Sistema |
| :--- | :--- | :--- |
| **React.js** | `^19.2.8` | Biblioteca base para construcción de interfaces de usuario reactivas |
| **React DOM** | `^19.2.8` | Renderizador de componentes React sobre el DOM del navegador |
| **Vite.js** | `^8.3.0` (8.3.4 activo) | Herramienta de compilación rápida y servidor de desarrollo HMR |
| **Tailwind CSS** | `^3.4.19` | Framework CSS utilitario con tokens de diseño personalizados |
| **PostCSS** | `^8.5.31` | Procesador de estilos para autoprefijado y optimización CSS |
| **Autoprefixer** | `^10.6.1` | Inserción automática de prefijos de compatibilidad para navegadores |
| **Axios** | `^1.20.0` | Cliente HTTP basado en promesas con interceptores para JWT |
| **Leaflet** | `^1.9.4` | Biblioteca JavaScript para mapas interactivos y capas cartográficas |
| **Lucide React** | `^1.59.0` | Conjunto iconográfico consistente para las interfaces web |

### 2.4. Base de Datos
- **Motor Primario:** PostgreSQL (v15+) en puerto estándar `5432`.
- **Base de Datos Operativa:** `sigiu_db`.
- **Extensión Espacial:** Diseñada para PostGIS (v3+). La base de datos almacena coordenadas geográficas mediante columnas `latitud` (`DECIMAL(10,8)`) y `longitud` (`DECIMAL(11,8)`), junto con un campo `ubicacion_geografica` serializado en formato GeoJSON Point bajo el sistema de referencia espacial WGS84 (SRID 4326).
- **Motor Secundario (Fallback de Desarrollo):** SQLite 3 almacenado en `server/database.sqlite`.

---

## 3. Arquitectura del Sistema

El sistema implementa una **Arquitectura Cliente-Servidor Desacoplada**:

```
┌────────────────────────────────────────────────────────┐
│            CLIENTE: SPA REACT 19 (RESPONSIVE)          │
│  - Vistas: Ciudadano / Operador / Cuadrilla / Admin    │
│  - Estado Global: AuthContext (JWT en localStorage)    │
│  - Mapas: Leaflet 1.9 + OpenStreetMap Tiles            │
│  - Estilos: Tailwind CSS (Paleta Oficial Charcoal)     │
└───────────────────────────┬────────────────────────────┘
                            │ Solicitudes HTTP (JSON / Multipart)
                            │ Cabecera: Authorization: Bearer <token>
                            ▼
┌────────────────────────────────────────────────────────┐
│              BACKEND: API REST (EXPRESS.JS)            │
│  - Middlewares: CORS, Morgan, ErrorHandler, Multer     │
│  - Seguridad: JWT Stateless + Bcrypt (10 salt rounds)  │
│  - Validación: Coordenadas WGS84, Roles RBAC           │
│  - Endpoints: /auth, /reportes, /catalogos, /ordenes   │
└───────────────────────────┬────────────────────────────┘
                            │ Conexión ORM (Sequelize)
                            ▼
┌────────────────────────────────────────────────────────┐
│             BASE DE DATOS: POSTGRESQL 15+              │
│  - 8 Tablas Principales + Índices de Rendimiento       │
│  - Datos de Catálogos (Dependencias, Categorías, Roles)│
│  - Almacenamiento WGS84 (Latitud/Longitud Decimal)     │
└────────────────────────────────────────────────────────┘
```

---

## 4. Endpoints Expuestos por la API RESTful (`/api/v1`)

### 4.1. Diagnóstico del Sistema
- `GET /api/v1/health`: Estado operativo del servicio, versión de la API y metadatos municipales.

### 4.2. Módulo de Autenticación (`/api/v1/auth`)
- `POST /api/v1/auth/register`: Registro de nuevos ciudadanos con validación de contraseña y colonia.
- `POST /api/v1/auth/login`: Autenticación con credenciales y emisión de token JWT Stateless.
- `GET /api/v1/auth/me`: Obtención de datos del perfil del usuario autenticado (requiere JWT).

### 4.3. Módulo de Reportes de Incidencias (`/api/v1/reportes`)
- `GET /api/v1/reportes`: Listado de reportes con filtros por categoría, estatus y búsqueda por texto.
- `POST /api/v1/reportes`: Creación de un reporte ciudadano con coordenadas GPS y evidencia fotográfica (`multipart/form-data`).
- `GET /api/v1/reportes/:id`: Detalle completo de un reporte por ID (UUID) o folio oficial (`OAX-YYYY-XXXX`).
- `GET /api/v1/reportes/gis/geojson`: Exportación en formato GeoJSON (RFC 7946) para visualizadores cartográficos.
- `GET /api/v1/reportes/mis-reportes`: Historial de incidencias registradas por el ciudadano autenticado.
- `POST /api/v1/reportes/:id/apoyo`: Registro de apoyo ciudadano a una incidencia ("A mí también me afecta").
- `PATCH /api/v1/reportes/:id/estado`: Actualización administrativa del estado del reporte (requiere rol Admin u Operador).
- `GET /api/v1/reportes/analitica` y `/estadisticas`: Resumen de métricas, KPIs, top de colonias y tiempos de respuesta.

### 4.4. Módulo de Catálogos (`/api/v1/catalogos`)
- `GET /api/v1/catalogos/categorias`: Catálogo de categorías de incidencia con dependencias asociadas y SLA.
- `POST /api/v1/catalogos/categorias`: Creación de una categoría (exclusivo Administrador).
- `PUT /api/v1/catalogos/categorias/:id`: Edición de categoría (exclusivo Administrador).
- `DELETE /api/v1/catalogos/categorias/:id`: Eliminación lógica de categoría (exclusivo Administrador).
- `GET /api/v1/catalogos/estados`: Catálogo de estados de ciclo de vida del reporte.
- `GET /api/v1/catalogos/dependencias`: Catálogo de dependencias municipales de Oaxaca de Juárez.
- `POST /api/v1/catalogos/dependencias`: Registro de nueva dependencia (exclusivo Administrador).
- `PUT /api/v1/catalogos/dependencias/:id`: Edición de dependencia (exclusivo Administrador).
- `GET /api/v1/catalogos/roles`: Catálogo de roles del sistema.

### 4.5. Módulo de Órdenes de Trabajo (`/api/v1/ordenes`)
- `GET /api/v1/ordenes`: Listado general de órdenes de trabajo generadas (Admin y Operadores).
- `GET /api/v1/ordenes/mis-ordenes`: Órdenes asignadas específicamente a la cuadrilla autenticada.
- `POST /api/v1/ordenes`: Despacho y asignación de orden a una cuadrilla con fecha límite e instrucciones técnicas.
- `PATCH /api/v1/ordenes/:id/iniciar`: Transición operativa a "En Proceso" por la cuadrilla en campo.
- `POST /api/v1/ordenes/:id/finalizar`: Cierre de orden en campo con bitácora técnica y foto de resolución obligatoria.
- `PATCH /api/v1/ordenes/:id/aprobar`: Aprobación definitiva del cierre por parte del Administrador.

### 4.6. Módulo de Gestión de Usuarios (`/api/v1/usuarios`)
- `GET /api/v1/usuarios`: Directorio general de usuarios con filtros de rol (exclusivo Administrador).
- `GET /api/v1/usuarios/cuadrillas`: Listado de personal operativo de cuadrillas disponible para asignación.
- `POST /api/v1/usuarios`: Creación de cuentas administrativas u operativas (exclusivo Administrador).
- `PUT /api/v1/usuarios/:id`: Actualización de datos de un usuario (exclusivo Administrador).
- `PATCH /api/v1/usuarios/:id/status`: Alternancia de estado activo/inactivo (exclusivo Administrador).

---

## 5. Esquema de Base de Datos Verificado

El sistema cuenta con 10 entidades modeladas en Sequelize y definidas en `server/src/sql/ddl_sigiu.sql`:

1. **`roles`**: Catálogo de perfiles (1: Administrador, 2: Operador, 3: Cuadrilla, 4: Ciudadano).
2. **`dependencias`**: Direcciones del Ayuntamiento (DOPDU, DSM, SOAPA, DMTM).
3. **`usuarios`**: Cuentas de usuario con hash de contraseña bcrypt, rol y dependencia opcional.
4. **`categorias_incidencia`**: Tipos de falla (Bacheo, Alumbrado, Fugas de Agua, etc.) con SLA en horas.
5. **`estados_reporte`**: Estados del flujo (Recibido, En Validación, Asignado, En Proceso, Atendido, Rechazado).
6. **`reportes`**: Tabla núcleo con folio único, coordenadas WGS84, colonia, prioridad y votos de apoyo.
7. **`imagenes_reporte`**: Evidencias fotográficas vinculadas a reportes con tipo (`inicial`, `resolucion`).
8. **`historial_estados_reporte`**: Bitácora de auditoría de transiciones de estado con usuario responsable.
9. **`apoyos_ciudadanos`**: Registro de votos "A mí también me afecta" con restricción de unicidad `(reporte_id, ciudadano_id)`.
10. **`ordenes_trabajo`**: Órdenes de despacho con cuadrilla asignada, instrucciones, fecha límite y bitácora técnica.
