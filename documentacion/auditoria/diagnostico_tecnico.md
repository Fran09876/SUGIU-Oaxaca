# DIAGNÓSTICO TÉCNICO Y EVALUACIÓN DE ARQUITECTURA

**Proyecto:** Sistema Integral de Gestión de Incidencias Urbanas (SIGIU)  
**Fecha de Auditoría:** Noviembre 2026  
**Responsable de Auditoría:** Equipo de Auditoría y Arquitectura de Software

---

## 1. Evaluación de Seguridad

### 1.1. Autenticación y Gestión de Sesiones
- **Mecanismo:** JSON Web Tokens (JWT) Stateless implementado en `server/src/config/jwt.js`.
- **Firma Criptográfica:** Algoritmo HMAC SHA-256 (HS256) con clave secreta cargada desde la variable de entorno `JWT_SECRET`.
- **Expiración:** Tiempo de vida configurado a 7 días (`JWT_EXPIRES_IN=7d`).
- **Almacenamiento en Cliente:** El token y los datos de perfil se almacenan en `localStorage` del navegador.
- **Hallazgo y Riesgo:** El almacenamiento de tokens en `localStorage` expone la sesión a ataques de Cross-Site Scripting (XSS) en caso de inyección de scripts maliciosos. No se cuenta con rotación de tokens mediante *Refresh Tokens* ni almacenamiento en cookies `HttpOnly; Secure; SameSite=Strict`.
- **Recomendación:** Para un entorno productivo municipal, migrar la entrega de JWT a cookies de sesión seguras con banderas `HttpOnly` y `SameSite=Strict`, e implementar un mecanismo de revocación de sesiones.

### 1.2. Almacenamiento y Cifrado de Contraseñas
- **Librería:** `bcryptjs` (v2.4.3).
- **Parámetros:** Factor de coste de 10 rondas de salteo (*salt rounds*).
- **Implementación:** Hooks automáticos en el modelo Sequelize `User.js` (`beforeCreate` y `beforeUpdate`).
- **Diagnóstico:** Cumple con los estándares de la industria para protección contra ataques de fuerza bruta y tablas de diccionario (*rainbow tables*).

### 1.3. Control de Acceso y Autorización por Roles (RBAC)
- **Implementación:** Middleware `authorizeRoles` en `server/src/middlewares/authMiddleware.js`.
- **Roles Definidos:** 1. Administrador, 2. Operador, 3. Cuadrilla, 4. Ciudadano.
- **Validación del Lado del Servidor:** Estricta. El middleware consulta la base de datos para verificar que el usuario asociado al token exista, esté activo (`estatus = true`) y tenga el rol requerido antes de permitir la ejecución de controladores sensibles (rutas `/ordenes`, `/usuarios` y `/catalogos`).
- **Diagnóstico:** Robusto y adecuadamente desacoplado de la lógica de presentación.

### 1.4. Seguridad en Entrada y CORS
- **CORS:** Configurado dinámicamente en `server/src/app.js` permitiendo el dominio de producción en Vercel (`https://sugiu-oaxaca.vercel.app`), subdominios `*.vercel.app`, `process.env.CLIENT_URL` y localhost para pruebas locales.
- **Límites de Payload:** Se define un límite de 10 MB para cuerpos JSON en Express (`express.json({ limit: '10mb' })`).
- **SSL / TLS:** Habilitado de forma obligatoria en la comunicación hacia la base de datos PostgreSQL en Neon con `rejectUnauthorized: false` para tolerar certificados intermedios dinámicos de infraestructura serverless.

---

## 2. Evaluación de Arquitectura y Mantenibilidad

### 2.1. Patrón Arquitectónico
- **Backend:** Arquitectura por capas (Rutas ➔ Middlewares ➔ Controladores ➔ Modelos ORM ➔ Base de Datos).
- **Frontend:** Single Page Application (SPA) basada en componentes funcionales con React 19, haciendo uso de Hooks (`useState`, `useEffect`, `useRef`) y Context API (`AuthContext`) para la propagación del estado de sesión.
- **Desacoplamiento:** Excelente separación de responsabilidades. Los servicios de consumo HTTP están encapsulados en el directorio `client/src/api/` (`authApi.js`, `reportApi.js`, `userApi.js`, `workOrderApi.js`, `catalogApi.js`), permitiendo reutilización y facilidad de refactorización.

### 2.2. Mantenibilidad del Código
- **Claridad y Nomenclatura:** Los nombres de variables, funciones y rutas siguen convenciones semánticas en español (orientadas al contexto del dominio municipal).
- **Tipado:** El proyecto está desarrollado en JavaScript estándar (ESM en frontend, CommonJS en backend) sin TypeScript. Esto agiliza el desarrollo inicial pero incrementa el riesgo de errores en tiempo de ejecución por discrepancias de tipos en objetos complejos.
- **Recomendación:** Considerar la migración progresiva a TypeScript en iteraciones posteriores para robustecer los contratos de datos entre cliente y servidor.

---

## 3. Integridad de Datos y Modelo Relacional

### 3.1. Restricciones de Integridad Referencial
- **Claves Foráneas:** Las relaciones entre tablas en PostgreSQL (`ddl_sigiu.sql`) y Sequelize (`models/index.js`) cuentan con políticas de integridad referencial explícitas:
  - Eliminación de reportes elimina en cascada evidencias fotográficas (`ON DELETE CASCADE`), historial (`ON DELETE CASCADE`) y apoyos ciudadanos (`ON DELETE CASCADE`).
  - Usuarios y categorías están protegidos contra eliminación accidental con `ON DELETE RESTRICT`.
  - Roles y dependencias cuentan con restricciones de unicidad sobre sus nombres.

### 3.2. Gestión de Transacciones ACID
- **Control de Estados:** En `reportController.js:400` (actualización de estado) y `workOrderController.js:146` (cierre de orden con foto), las operaciones que modifican el reporte y crean registros de auditoría se ejecutan dentro de transacciones de base de datos (`sequelize.transaction()`). Esto garantiza consistencia atómica y evita estados huérfanos.

### 3.3. Índices de Base de Datos
- Se encuentran definidos índices para las columnas de consulta frecuente:
  - `idx_reportes_folio` sobre `reportes(folio)`.
  - `idx_reportes_categoria` sobre `reportes(categoria_id)`.
  - `idx_reportes_estado` sobre `reportes(estado_actual_id)`.
  - `idx_reportes_lat_lng` sobre `reportes(latitud, longitud)`.
  - `idx_ordenes_cuadrilla` sobre `ordenes_trabajo(cuadrilla_id)`.

---

## 4. Persistencia y Gestión de Archivos Multimedia

### 4.1. Carga de Evidencias (Multer)
- **Directorio de Almacenamiento:** `server/uploads/` (disco local del servidor).
- **Validación de Tipo:** Lista blanca estricta de extensiones y tipos MIME (`image/jpeg`, `image/png`, `image/webp`).
- **Control de Tamaño:** Límite máximo de 5 Megabytes por imagen gestionado por el middleware de Multer.
- **Nomenclatura:** Sanitización de nombres con prefijo temporal y UUID v4 (`evidencia-${Date.now()}-${uuidv4().substring(0,8)}.ext`) para prevenir sobrescritura de archivos y ataques de *Directory Traversal*.

### 4.2. Vulnerabilidad Operativa Identificada
- **Riesgo:** Si el servidor backend es desplegado en una plataforma de infraestructura en la nube sin almacenamiento persistente (como Heroku, Render en capa gratuita o contenedores Docker sin volúmenes montados), las imágenes subidas por los ciudadanos se perderán en cada reinicio del contenedor.
- **Recomendación:** Implementar un adaptador de almacenamiento en la nube (ej. Amazon S3, Google Cloud Storage o Cloudinary) para la persistencia definitiva de evidencias fotográficas en producción.

---

## 5. Implementación Cartográfica y Geoespacial

### 5.1. Sistema de Referencia Espacial
- **SRID:** WGS84 (EPSG:4326), estándar universal utilizado por los sistemas de posicionamiento global (GPS).
- **Formato de Almacenamiento:** Coordenadas decimales con alta precisión (8 decimales, equivalentes a precisión submétrica en terreno).
- **Estructura Geoespacial:** Compatible con especificación GeoJSON RFC 7946 con orden `[longitud, latitud]` en coordenadas del visualizador.

### 5.2. Visualización Frontend (Leaflet)
- **Capas Base:** Cartografía libre provista por los servidores de teselas de OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`).
- **Rendimiento:** El visor cartográfico renderiza marcadores vectoriales interactivos clasificados cromáticamente por prioridad y categoría de incidencia.

---

## 6. Cobertura de Pruebas y Aseguramiento de Calidad (QA)

### 6.1. Suite Automatizada (`server/tests/api.test.js`)
- **Ejecutor:** Test Runner nativo de Node.js (`node:test` y `node:assert`).
- **Casos de Prueba Ejecutados y Verificados (9 pruebas aprobadas al 100%):**
  1. `HU-01`: Endpoint de diagnóstico `/api/v1/health` responde código HTTP 200 con metadatos municipales.
  2. `HU-01`: Captura de rutas inexistentes con respuesta 404 estandarizada en formato JSON.
  3. `HU-05`: Emisión, firma y verificación de tokens JWT Stateless para roles (Admin, Operador, Cuadrilla).
  4. `HU-05`: Encriptación segura de contraseñas con bcrypt (Salt rounds = 10).
  5. `HU-06`: Validación de coordenadas GPS dentro de rangos válidos WGS84.
  6. `HU-10`: Visor cartográfico GeoJSON FeatureCollection para PostGIS.
  7. `HU-11`: Endpoint de analítica y rendición de cuentas devuelve KPIs, tasas de resolución y balances.
  8. `HU-05`: Validación de campos obligatorios en el registro de ciudadanos.
  9. Compilación limpia y sin errores del cliente React en Vite (`vite build`).

### 6.2. Brechas de Prueba
- No se cuenta con pruebas automatizadas en el frontend (ej. Jest, Vitest o React Testing Library).
- No se dispone de pruebas de carga concurrente ni pruebas end-to-end (ej. Cypress o Playwright).

---

## 7. Matriz de Riesgos Técnicos y Plan de Mitigación

| Riesgo Técnico | Probabilidad | Impacto | Estrategia de Mitigación Recomendada |
| :--- | :--- | :--- | :--- |
| **Pérdida de archivos en servidor efímero** | Alta | Alto | Integrar servicio de almacenamiento de objetos en la nube (AWS S3 o Cloudinary). |
| **Saturación por solicitudes concurrentes sin caché** | Media | Medio | Implementar almacenamiento en caché con Redis para catálogos y estadísticas frecuentes. |
| **Exposición de token JWT en localStorage** | Media | Alto | Migrar a cookies `HttpOnly` y añadir encabezados de seguridad con Helmet (`Content-Security-Policy`). |
| **Inconsistencias por falta de tipado estático** | Media | Bajo | Migrar gradualmente los modelos y servicios a TypeScript. |

---

## 8. Evaluación del Despliegue en Producción Cloud (Iteración 6)

- **URL Pública Oficial:** `https://sugiu-oaxaca.vercel.app/`
- **Frontend SPA:** Alojado en **Vercel** con integración continua desde GitHub (`https://github.com/Fran09876/SUGIU-Oaxaca`), reescrituras de rutas SPA en `vercel.json` y compresión Brotli/Gzip.
- **Backend API REST:** Desplegado en **Render** (Node.js 20 Web Service) con variables de entorno de producción, auto-deploy en branch `main`, y enrutamiento dual para endpoints tanto bajo `/api/v1` como directamente en la raíz `/`.
- **Base de Datos:** Alojada en **Neon Serverless** (PostgreSQL 16 en AWS us-east-2) con extensión espacial PostGIS 3.6 habilitada, pooling de conexiones y cifrado SSL TLS en tránsito.
- **Modelo de Acceso:** Acceso universal inmediato para cualquier usuario con navegador web y cámara (para toma de evidencias in-situ), sin requerir instalación de software local.
- **Credenciales Preconfiguradas:**
  - Admin: `admin@oaxaca.gob.mx` | `JOse2002`
  - Operador: `operador@oaxaca.gob.mx` | `JOse2002`
  - Cuadrilla 01: `cuadrilla@oaxaca.gob.mx` | `JOse2002`
  - Cuadrilla 02: `cuadrilla2@oaxaca.gob.mx` | `JOse2002`
  - Ciudadano: `ciudadano@oaxaca.gob.mx` | `JOse2002`
