# SIGIU: Sistema Integral de Gestión de Incidencias Urbanas
### Municipio de Oaxaca de Juárez — Dirección de Obras Públicas y Desarrollo Urbano
**Metodología:** Extreme Programming (XP) | **Alcance:** Iteraciones 0, 1 y 2

---

## 🏛️ 1. Descripción del Proyecto
El **SIGIU** es una solución de ingeniería de software orientada a la digitalización, geolocalización y canalización en tiempo real de los reportes ciudadanos por fallas en la infraestructura municipal (bacheo, fallas de alumbrado público, fugas de agua y drenaje colapsado, ramas caídas y semaforización).

El proyecto reemplaza los canales fragmentados tradicionales (llamadas y oficios físicos) mediante una **Progressive Web App (PWA) Móvil** para la ciudadanía y un **Dashboard de Despacho Geoespacial** para las direcciones operativas del Ayuntamiento de Oaxaca de Juárez.

---

## 🎨 2. Paleta Oficial de Diseño (Tailwind CSS)
Diseño con estética cívica e institucional:
- **Royal Blue (`#112250`):** Encabezados, barras de navegación, botones primarios y contenedores de alta jerarquía.
- **Sapphire (`#3C507D`):** Tarjetas de incidencias, botones secundarios y elementos de interacción activa.
- **Quicksand (`#E0C58F`):** Acentos dorados de llamado a la acción (CTA), insignias de folio, pines destacados y medallas.
- **Swan Wing (`#F5F0E9`):** Fondo principal cálido (inspirado en la cantera oaxaqueña) para reducir la fatiga visual.
- **Shellstone (`#D9CBC2`):** Bordes sutiles, contenedores neutros y textos secundarios.

---

## 📐 3. Arquitectura del Sistema & Matriz de Historias de Usuario

```
[ Ciudadano (PWA Móvil) ]       [ Operador / Admin (Dashboard) ]
           │                                      │
           │ (Multipart / JSON + JWT)             │ (REST API)
           ▼                                      ▼
┌──────────────────────────────────────────────────────────────┐
│                  API RESTful (Express.js)                    │
│  ├─ /api/v1/auth (JWT Stateless, Bcrypt)                    │
│  ├─ /api/v1/reportes (Multer Uploads, Validación WGS84)     │
│  └─ /api/v1/catalogos (Dependencias, Categorías, Estados)    │
└──────────────────────────────┬───────────────────────────────┘
                               │ (Sequelize ORM)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│           PostgreSQL 15+ con Extensión PostGIS 3+            │
│  ├─ GEOMETRY(Point, 4326) con Índices Espaciales GIST        │
│  ├─ Triggers automáticos de sincronización de coordenadas   │
│  └─ Registro de auditoría y apoyos ciudadanos ("Me afecta")  │
└──────────────────────────────────────────────────────────────┘
```

### Cobertura de Iteraciones XP:
- **Iteración 0: Configuración Inicial del Entorno y Base de Datos Espacial**
  - Estructura desacoplada `/client` y `/server`.
  - Configuración personalizada de Tailwind CSS con tokens semánticos.
  - Script DDL completo (`server/src/sql/ddl_sigiu.sql`) con PostGIS, funciones espaciales, triggers e índices GIST.
- **Iteración 1: Arquitectura Base y Modelado (HU-01 a HU-04)**
  - **HU-01:** Manejador centralizado de errores, CORS, logging y middlewares defensivos.
  - **HU-02:** Modelado ORM relacional/espacial con Sequelize y seeders de dependencias municipales de Oaxaca.
  - **HU-03:** Layouts de Dashboard Administrativo y PWA móvil con selector interactivo.
  - **HU-04:** Rutas modulares `/api/v1` y cliente Axios con interceptores de autenticación.
- **Iteración 2: Módulo Ciudadano, Autenticación y Captura de Reportes (HU-05 a HU-07)**
  - **HU-05:** Registro e inicio de sesión ciudadano con JWT Stateless y encriptación bcrypt (salt = 10).
  - **HU-06:** Captura nativa de coordenadas GPS del dispositivo (`navigator.geolocation`) con ajuste manual sobre mapa interactivo de Oaxaca.
  - **HU-07:** Carga de fotografías mediante Multer (`multipart/form-data`), generación de folios oficiales (`OAX-YYYY-XXXX`), almacenamiento de punto espacial WGS84 y sistema de apoyo ciudadano ("A mí también me afecta").

---

## 🧪 4. Pruebas Automatizadas (Práctica XP: TDD)
El proyecto incluye una suite de pruebas automatizadas que validan:
1. Diagnóstico de salud del sistema y metadatos de Oaxaca (`/api/v1/health`).
2. Manejador global de excepciones y respuestas 404 estandarizadas.
3. Emisión, firma y verificación de tokens JWT Stateless.
4. Encriptación segura unidireccional con bcrypt.
5. Validación de rangos numéricos y coordenadas espaciales WGS84.
6. Validación de payloads en registro y autenticación.

Para ejecutar la suite de pruebas:
```bash
npm run server:test
```

---

## 🚀 5. Puesta en Marcha Local

### Requisitos Previos:
- Node.js v18+ LTS
- PostgreSQL 15+ con PostGIS 3+ (opcionalmente cuenta con fallback SQLite automático para desarrollo sin configuración inicial)

### Paso 1: Configurar Variables de Entorno del Backend
En la carpeta `server/.env`:
```env
PORT=5000
NODE_ENV=development
USE_SQLITE=false       # Cambiar a true si no tienes PostgreSQL configurado aún
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sigiu_db
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=sigiu_oaxaca_jwt_super_secret_key_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Paso 2: Ejecutar el Script DDL Espacial (en PostgreSQL)
Si utilizas PostgreSQL, crea la base de datos y ejecuta el script:
```sql
CREATE DATABASE sigiu_db;
\c sigiu_db;
\i server/src/sql/ddl_sigiu.sql;
```

### Paso 3: Iniciar Backend
```bash
cd server
npm start
```
*El servidor correrá en `http://localhost:5000` con sus endpoints `/api/v1/...`.*

### Paso 4: Iniciar Frontend (Vite)
En una terminal separada:
```bash
cd client
npm run dev
```
*La interfaz estará disponible en `http://localhost:5173`.*

---

## 🔑 6. Credenciales de Acceso Demo
Para facilitar la evaluación y demostración de los roles de usuario:

| Rol | Correo Electrónico | Contraseña | Funcionalidad Clave |
| :--- | :--- | :--- | :--- |
| **Ciudadano** | `ciudadano@oaxaca.gob.mx` | `oaxaca2026` | Levantamiento de incidencias con GPS y fotos, apoyo de reportes comunitarios |
| **Operador** | `operador@oaxaca.gob.mx` | `oaxaca2026` | Canalización y despacho de reportes por dependencia (DOPDU) |
| **Administrador** | `admin@oaxaca.gob.mx` | `oaxaca2026` | Control global, métricas ejecutivas y visor cartográfico interactivo |

> **Nota:** La aplicación cuenta con un botón **"⚡ Perfiles Demo"** en el encabezado que permite cambiar de rol instantáneamente con un solo clic.
