import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from docx_utils import set_cell_margins, set_cell_background, set_table_borders, make_header_row_repeat

DOC_DIR = os.path.dirname(os.path.abspath(__file__))
DIAG_DIR = os.path.join(DOC_DIR, "diagramas")

def setup_doc_styles(doc):
    for section in doc.sections:
        section.page_width = Cm(21.59)
        section.page_height = Cm(27.94)
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)
        section.header_distance = Cm(1.27)
        section.footer_distance = Cm(1.27)

    styles = doc.styles

    style_normal = styles['Normal']
    font_normal = style_normal.font
    font_normal.name = 'Arial'
    font_normal.size = Pt(12)
    font_normal.color.rgb = RGBColor(21, 23, 25)
    style_normal.paragraph_format.line_spacing = 1.5
    style_normal.paragraph_format.space_after = Pt(6)
    style_normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    style_h1 = styles['Heading 1']
    font_h1 = style_h1.font
    font_h1.name = 'Arial'
    font_h1.size = Pt(16)
    font_h1.bold = True
    font_h1.color.rgb = RGBColor(21, 23, 25)
    style_h1.paragraph_format.space_before = Pt(16)
    style_h1.paragraph_format.space_after = Pt(6)
    style_h1.paragraph_format.keep_with_next = True

    style_h2 = styles['Heading 2']
    font_h2 = style_h2.font
    font_h2.name = 'Arial'
    font_h2.size = Pt(14)
    font_h2.bold = True
    font_h2.color.rgb = RGBColor(63, 75, 72)
    style_h2.paragraph_format.space_before = Pt(12)
    style_h2.paragraph_format.space_after = Pt(4)
    style_h2.paragraph_format.keep_with_next = True

    style_h3 = styles['Heading 3']
    font_h3 = style_h3.font
    font_h3.name = 'Arial'
    font_h3.size = Pt(12)
    font_h3.bold = True
    font_h3.color.rgb = RGBColor(21, 23, 25)
    style_h3.paragraph_format.space_before = Pt(8)
    style_h3.paragraph_format.space_after = Pt(2)
    style_h3.paragraph_format.keep_with_next = True

def add_p(doc, text="", bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=6):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.5
    if text:
        run = p.add_run(text)
        run.bold = bold
        run.italic = italic
        run.font.name = 'Arial'
    return p

def add_callout(doc, title, text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = table.cell(0, 0)
    set_cell_background(cell, "D0D4D7")
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    set_table_borders(table, color="3F4B48", sz="12", val="single")

    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(4)
    run_t = p.add_run(f"📌 {title.upper()}\n")
    run_t.bold = True
    run_t.font.name = 'Arial'
    run_t.font.size = Pt(11)
    run_t.font.color.rgb = RGBColor(21, 23, 25)

    run_b = p.add_run(text)
    run_b.font.name = 'Arial'
    run_b.font.size = Pt(10.5)
    run_b.font.color.rgb = RGBColor(21, 23, 25)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_after = Pt(6)

def add_custom_table(doc, headers, rows_data, col_widths=None):
    table = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    make_header_row_repeat(table.rows[0])
    set_table_borders(table, color="7D8181", sz="4", val="single")

    # Header
    for idx, heading in enumerate(headers):
        cell = table.cell(0, idx)
        set_cell_background(cell, "151719")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(heading)
        run.bold = True
        run.font.name = 'Arial'
        run.font.size = Pt(10)
        run.font.color.rgb = RGBColor(208, 212, 215)

    # Rows
    for r_idx, row in enumerate(rows_data):
        bg = "FFFFFF" if r_idx % 2 == 0 else "F4F5F6"
        for c_idx, val in enumerate(row):
            cell = table.cell(r_idx + 1, c_idx)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            run = p.add_run(str(val))
            run.font.name = 'Arial'
            run.font.size = Pt(9.5)
            run.font.color.rgb = RGBColor(21, 23, 25)

    if col_widths:
        for r in table.rows:
            for idx, width in enumerate(col_widths):
                r.cells[idx].width = Inches(width)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_after = Pt(6)
    return table

# ==============================================================================
# 1. MANUAL DE USUARIO
# ==============================================================================
def generate_user_manual():
    print("[Manual 1/3] Generando Manual de Usuario de SIGIU...")
    doc = Document()
    setup_doc_styles(doc)

    # Portada
    p = add_p(doc, "TECNOLÓGICO NACIONAL DE MÉXICO\nINSTITUTO TECNOLÓGICO DE OAXACA", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=20)
    p.runs[0].font.size = Pt(13)
    p_title = add_p(doc, "MANUAL DE USUARIO DEL SISTEMA SIGIU", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    p_title.runs[0].font.size = Pt(16)
    add_p(doc, "Plataforma Web Responsiva para la Gestión de Incidencias Urbanas en Oaxaca de Juárez\nGuía de Operación Paso a Paso en Entorno de Producción Cloud\n(Acceso Universal sin Instalación para Ciudadanos, Operadores, Cuadrillas y Administradores)", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=24)
    add_p(doc, "URL Oficial en Producción: https://sugiu-oaxaca.vercel.app/\nAutor: José Francisco Pérez Pérez (No. Control: 2211204)\nDocente: Cruz Hernández Bernardo Roberto\nPeriodo: Agosto - Diciembre 2026", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=36)
    doc.add_page_break()

    # Contenido
    doc.add_heading("1. INTRODUCCIÓN Y REQUISITOS DE ACCESO", level=1)
    add_p(doc, "El Sistema Integral de Gestión de Incidencias Urbanas (SIGIU) es una plataforma web responsiva de acceso público desplegada en la nube para el Municipio de Oaxaca de Juárez. Se encuentra alojada en infraestructura de alta disponibilidad y es accesible desde cualquier navegador moderno (Google Chrome, Safari, Mozilla Firefox, Microsoft Edge).")
    
    add_callout(doc, "ACCESO DIRECTO EN LA NUBE (CERO INSTALACIÓN)", "Para utilizar el sistema no es necesario descargar ninguna aplicación desde Google Play Store ni Apple App Store, ni instalar archivos ejecutables. La plataforma se ejecuta directamente desde la nube ingresando a la URL oficial: https://sugiu-oaxaca.vercel.app/")

    add_p(doc, "Requisitos para los usuarios:")
    add_p(doc, "1. Dispositivo con Navegador Web: Cualquier computadora de escritorio, laptop, tableta o teléfono móvil con conexión a Internet.")
    add_p(doc, "2. Cámara Integrada o Trasera: Indispensable para la captura y adjunción de evidencias fotográficas in-situ (baches, fugas de agua, obras terminadas). El navegador solicitará permiso al momento de abrir la cámara.")
    add_p(doc, "3. Geolocalización (GPS): Recomendada para capturar las coordenadas exactas de la falla con precisión satelital WGS84 al presionar 'Detectar mi GPS'.")

    doc.add_heading("2. CREDENCIALES OFICIALES PRECONFIGURADAS EN PRODUCCIÓN", level=1)
    add_p(doc, "El sistema cuenta con cuentas oficiales preconfiguradas y activas en la base de datos de producción para evaluar y operar cada uno de los roles del sistema:")
    
    add_custom_table(
        doc,
        ["Rol del Sistema", "Correo Electrónico Oficial", "Contraseña", "Alcance y Competencia"],
        [
            ["Administrador", "admin@oaxaca.gob.mx", "JOse2002", "Control total, métricas analíticas, CRUD de usuarios, dependencias y aprobación final."],
            ["Operador (DOPDU)", "operador@oaxaca.gob.mx", "JOse2002", "Mesa de despacho técnico, inspección de reportes y emisión de Órdenes de Trabajo (OT)."],
            ["Cuadrilla 01 (Vial)", "cuadrilla@oaxaca.gob.mx", "JOse2002", "Personal operativo en campo de bacheo/pavimentación; ruta GPS y subida de evidencia de resolución."],
            ["Cuadrilla 02 (Redes)", "cuadrilla2@oaxaca.gob.mx", "JOse2002", "Personal operativo de alumbrado público y servicios municipales."],
            ["Ciudadano Registrado", "ciudadano@oaxaca.gob.mx", "JOse2002", "Habitante de Oaxaca; levantamiento con folio propio y seguimiento en línea de tiempo."],
        ],
        [1.3, 2.0, 1.1, 2.6]
    )

    doc.add_heading("3. PERFIL CIUDADANO (PÚBLICO EN GENERAL)", level=1)
    doc.add_heading("3.1. Registro e Inicio de Sesión", level=2)
    add_p(doc, "Cualquier persona puede navegar y reportar como ciudadano. Para dar seguimiento personalizado:")
    add_p(doc, "1. Ingrese a https://sugiu-oaxaca.vercel.app/ y presione 'Ingresar al Sistema' en la esquina superior derecha.")
    add_p(doc, "2. En la ventana modal, seleccione 'Iniciar Sesión' e introduzca las credenciales (o presione 'Registro Ciudadano' para crear una cuenta personal en menos de un minuto).")
    add_p(doc, "3. El sistema mantendrá la sesión activa mediante un token JWT seguro almacenado localmente.")

    doc.add_heading("3.2. Cómo Levantar un Reporte de Falla Urbana (Paso a Paso)", level=2)
    add_p(doc, "1. En la página de inicio, pulse la pestaña 'Reportar'.")
    add_p(doc, "2. Paso 1 - Categoría de Incidencia: Seleccione una categoría municipal (Bacheo y Pavimentación, Alumbrado Público, Fugas de Agua, Recolección de Basura o Semáforos). Cada opción muestra su tiempo máximo de resolución (SLA).")
    add_p(doc, "3. Paso 2 - Ubicación Exacta (GPS): Presione 'Detectar mi GPS' para obtener la posición satelital automática, o arrastre el marcador interactivo en el mapa para afinar la ubicación.")
    add_p(doc, "4. Paso 3 - Datos Descriptivos: Indique la colonia de Oaxaca de Juárez, calle de referencia, título de la falla y descripción detallada del problema.")
    add_p(doc, "5. Paso 4 - Nivel de Severidad: Seleccione entre Baja, Media, Alta o Urgente.")
    add_p(doc, "6. Paso 5 - Evidencia Fotográfica: Presione 'Abrir Cámara' para capturar la imagen directamente desde su teléfono o laptop, o seleccione una foto de la galería.")
    add_p(doc, "7. Paso 6 - Envío y Folio: Presione 'Enviar Reporte Ciudadano Oficial'. El sistema generará una clave de seguimiento única (ej. REP-202611-001) para consulta posterior.")

    doc.add_heading("3.3. Muro Comunitario, Apoyos y Mapa GIS", level=2)
    add_p(doc, "En la pestaña 'Muro', los habitantes pueden revisar fallas reportadas por vecinos y pulsar 'A mí también me afecta' para sumar votos de respaldo y priorizar su atención. En la pestaña 'Mapa GIS', los ciudadanos pueden explorar las fallas distribuidas sobre el plano cartográfico de la ciudad con marcadores clasificados por color.")

    doc.add_page_break()

    doc.add_heading("4. PERFIL OPERADOR DE DEPENDENCIA", level=1)
    add_p(doc, "Al iniciar sesión como Operador (`operador@oaxaca.gob.mx`), el sistema despliega la Mesa de Despacho Operativo:")
    add_p(doc, "1. Métricas de Bandeja: Conteo de reportes recibidos, validados, asignados y resueltos.")
    add_p(doc, "2. Inspección Técnica: Visualización de la fotografía ciudadana, datos geográficos y nivel de severidad.")
    add_p(doc, "3. Despacho de Orden de Trabajo (OT): Al pulsar 'Despachar OT', el operador selecciona la brigada disponible, define la fecha límite de cumplimiento según el catálogo SLA e ingresa las instrucciones de trabajo. La incidencia avanza automáticamente al estado 'Asignado'.")

    doc.add_page_break()

    doc.add_heading("5. PERFIL PERSONAL DE CUADRILLA EN CAMPO", level=1)
    add_p(doc, "Diseñado específicamente para dispositivos móviles y uso en calle (`cuadrilla@oaxaca.gob.mx`):")
    add_p(doc, "1. Bandeja Móvil: Muestra las órdenes asignadas a la cuadrilla activa.")
    add_p(doc, "2. Ruta GPS: El botón 'Ruta GPS' abre directamente la navegación en Google Maps guiando al vehículo operativo hasta la calle reportada.")
    add_p(doc, "3. Iniciar Reparación: Al arribar al punto, la cuadrilla presiona 'Iniciar Reparación', cambiando el estado a 'En Proceso' con marca temporal.")
    add_p(doc, "4. Cierre Técnico con Foto de Resolución Obligatoria: Al terminar la reparación, la cuadrilla abre la cámara, captura la fotografía de la obra terminada y redacta una breve bitácora. Sin foto de resolución, el sistema no permite el cierre.")

    doc.add_page_break()

    doc.add_heading("6. PERFIL ADMINISTRADOR CENTRAL", level=1)
    add_p(doc, "El Administrador (`admin@oaxaca.gob.mx`) dispone del panel de control global:")
    add_p(doc, "1. Analítica y Rendición de Cuentas: Indicadores de resolución, tiempo promedio de respuesta, ranking de colonias críticas y balance de gestión.")
    add_p(doc, "2. Comparador Visual de Evidencias ('Antes vs Después'): Permite contrastar la fotografía inicial ciudadana contra la fotografía de conclusión de la cuadrilla antes de presionar 'Aprobar Cierre Definitivo'.")
    add_p(doc, "3. Catálogos y Usuarios: Altas, bajas y modificaciones de cuentas de personal y dependencias municipales.")

    doc_path = os.path.join(DOC_DIR, "manual_usuario_SIGIU.docx")
    doc.save(doc_path)
    print(f"[OK] Manual de Usuario generado: {doc_path} ({os.path.getsize(doc_path)} bytes)")

# ==============================================================================
# 2. MANUAL DE INSTALACIÓN Y CONFIGURACIÓN
# ==============================================================================
def generate_install_manual():
    print("[Manual 2/3] Generando Manual de Instalación de SIGIU...")
    doc = Document()
    setup_doc_styles(doc)

    p = add_p(doc, "TECNOLÓGICO NACIONAL DE MÉXICO\nINSTITUTO TECNOLÓGICO DE OAXACA", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=20)
    p.runs[0].font.size = Pt(13)
    p_title = add_p(doc, "MANUAL DE INSTALACIÓN, DESPLIEGUE Y PUESTA EN MARCHA", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    p_title.runs[0].font.size = Pt(16)
    add_p(doc, "Guía de Despliegue en la Nube (Producción SaaS) y Configuración Local del Entorno SIGIU\n(Vercel + Render + Neon PostgreSQL/PostGIS)", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=24)
    add_p(doc, "URL de Producción Activa: https://sugiu-oaxaca.vercel.app/\nRepositorio: https://github.com/Fran09876/SUGIU-Oaxaca\nAutor: José Francisco Pérez Pérez (No. Control: 2211204)\nPeriodo: Agosto - Diciembre 2026", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=36)
    doc.add_page_break()

    doc.add_heading("1. MODALIDADES DE ACCESO Y DESPLIEGUE", level=1)
    add_p(doc, "El sistema SIGIU se encuentra implementado bajo dos esquemas complementarios:")
    add_p(doc, "A. Modalidad SaaS en Producción Cloud (Cero Instalación): Destinada a usuarios finales, servidores públicos, enlaces de dependencias y cuadrillas. La plataforma ya se encuentra completamente compilada, configurada y disponible en línea.")
    add_p(doc, "B. Modalidad DevOps / Desarrollo On-Premise: Destinada a administradores de sistemas y desarrolladores que requieran clonar el repositorio, desplegar instancias réplica o ejecutar la plataforma en servidores locales.")

    add_callout(doc, "USO OPERATIVO INMEDIATO EN PRODUCCIÓN", "Para utilizar la plataforma en el día a día municipal, los usuarios NO requieren instalar software, servidores ni bases de datos locales. Solo deben ingresar con cualquier navegador web con cámara a: https://sugiu-oaxaca.vercel.app/")

    doc.add_heading("2. ARQUITECTURA DE PRODUCCIÓN EN LA NUBE (DESPLIEGUE GRATUITO)", level=1)
    add_p(doc, "La arquitectura de producción de SIGIU está orquestada sobre tres servicios en la nube de nivel gratuito altamente confiables:")
    
    add_custom_table(
        doc,
        ["Capa del Sistema", "Proveedor Cloud", "Tecnología / Motor", "Función en Producción"],
        [
            ["Base de Datos Espacial", "Neon Serverless (neon.tech)", "PostgreSQL 16 + PostGIS 3.6 (AWS us-east-2)", "Persistencia relacional, funciones geoespaciales y almacenamiento de tablas."],
            ["Backend API REST", "Render Cloud (render.com)", "Node.js 20 LTS + Express 4 + Sequelize ORM", "Servicios web RESTful, enrutamiento dual (/api/v1 y /), CORS y autenticación JWT."],
            ["Frontend Responsivo", "Vercel Platform (vercel.com)", "React 19 + Vite 8 + Tailwind CSS", "Alojamiento SPA con rewrites en vercel.json, distribución global CDN y PWA."],
        ],
        [1.5, 1.6, 2.0, 1.9]
    )

    doc.add_heading("3. PROCEDIMIENTO DE DESPLIEGUE EN LA NUBE PASO A PASO", level=1)
    doc.add_heading("3.1. Configuración de Base de Datos en Neon", level=2)
    add_p(doc, "1. Crear una cuenta en https://neon.tech e inicializar un proyecto PostgreSQL llamado `sigiu-db`.")
    add_p(doc, "2. En el SQL Editor de Neon, ejecutar el script consolidado `deploy_init.sql` incluido en el repositorio. Este script:")
    add_p(doc, "   - Habilita las extensiones `postgis` y `pgcrypto`.")
    add_p(doc, "   - Crea las tablas con sus índices relacionales y espaciales WGS84.")
    add_p(doc, "   - Siembra los catálogos y usuarios oficiales con contraseña predeterminada (`JOse2002`).")
    add_p(doc, "3. Copiar la cadena de conexión con SSL: `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`.")

    doc.add_heading("3.2. Configuración del Backend en Render", level=2)
    add_p(doc, "1. En https://render.com, crear un nuevo 'Web Service' vinculado al repositorio `https://github.com/Fran09876/SUGIU-Oaxaca`.")
    add_p(doc, "2. Configurar: Root Directory = `server`, Environment = `Node`, Build Command = `npm install`, Start Command = `npm start`.")
    add_p(doc, "3. En 'Environment Variables', agregar:")
    add_p(doc, "   - `DATABASE_URL`: Cadena de conexión de Neon.")
    add_p(doc, "   - `NODE_ENV`: `production`.")
    add_p(doc, "   - `JWT_SECRET`: Clave criptográfica para firmas.")
    add_p(doc, "   - `CLIENT_URL`: `https://sugiu-oaxaca.vercel.app`.")
    add_p(doc, "4. Render iniciará el contenedor y expondrá la URL pública del backend.")

    doc.add_heading("3.3. Configuración del Frontend en Vercel", level=2)
    add_p(doc, "1. En https://vercel.com, importar el repositorio de GitHub.")
    add_p(doc, "2. Configurar: Root Directory = `client`, Framework Preset = `Vite`.")
    add_p(doc, "3. Variable de entorno: `VITE_API_URL` = URL asignada por Render.")
    add_p(doc, "4. Presionar 'Deploy'. Vercel compilará la SPA y generará la URL de acceso global.")

    doc.add_page_break()

    doc.add_heading("4. INSTALACIÓN Y EJECUCIÓN EN ENTORNO LOCAL (DESARROLLO)", level=1)
    add_p(doc, "Si se desea ejecutar el sistema en una máquina local para desarrollo o evaluación offline:")
    add_p(doc, "1. Requisitos: Node.js 18+ LTS, PostgreSQL 15+ (o modo SQLite automático) y Git.")
    add_p(doc, "2. Clonar el repositorio:\n```bash\ngit clone https://github.com/Fran09876/SUGIU-Oaxaca.git\ncd SUGIU-Oaxaca\n```")
    add_p(doc, "3. Instalar dependencias del servidor y cliente:\n```bash\ncd server && npm install\ncd ../client && npm install\n```")
    add_p(doc, "4. Iniciar servicios locales:\n```bash\n# Terminal 1 (Backend):\ncd server && npm start\n# Terminal 2 (Frontend):\ncd client && npm run dev\n```")
    add_p(doc, "5. Abrir en el navegador: `http://localhost:5173`.")

    doc_path = os.path.join(DOC_DIR, "manual_instalacion_SIGIU.docx")
    doc.save(doc_path)
    print(f"[OK] Manual de Instalación generado: {doc_path} ({os.path.getsize(doc_path)} bytes)")

# ==============================================================================
# 3. MANUAL TÉCNICO DE ARQUITECTURA
# ==============================================================================
def generate_technical_manual():
    print("[Manual 3/3] Generando Manual Técnico de SIGIU...")
    doc = Document()
    setup_doc_styles(doc)

    p = add_p(doc, "TECNOLÓGICO NACIONAL DE MÉXICO\nINSTITUTO TECNOLÓGICO DE OAXACA", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=20)
    p.runs[0].font.size = Pt(13)
    p_title = add_p(doc, "MANUAL TÉCNICO DE ARQUITECTURA, API REST Y SEGURIDAD", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    p_title.runs[0].font.size = Pt(16)
    add_p(doc, "Especificación de la Arquitectura Cloud Desacoplada, Protocolos Criptográficos, Esquema de Base de Datos y Catálogo de Endpoints", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=24)
    add_p(doc, "Plataforma en Producción: https://sugiu-oaxaca.vercel.app/\nBackend API: Render Web Service\nBase de Datos: Neon PostgreSQL 16 + PostGIS 3.6\nAutor: José Francisco Pérez Pérez (No. Control: 2211204)\nPeriodo: Agosto - Diciembre 2026", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=36)
    doc.add_page_break()

    doc.add_heading("1. ARQUITECTURA CLOUD DESACOPLADA Y PERSISTENCIA ESPACIAL", level=1)
    add_p(doc, "SIGIU opera bajo un diseño desacoplado de tres capas en la nube pública:")
    add_p(doc, "1. Frontend SPA (Vercel): Desarrollada en React 19 con empaquetado optimizado en Vite y diseño responsivo adaptativo con Tailwind CSS. Utiliza Leaflet para la renderización cartográfica de geometrías GeoJSON.")
    add_p(doc, "2. Backend API RESTful (Render): Servicio web Node.js Express estructurado en controladores, middlewares defensivos y Sequelize ORM.")
    add_p(doc, "3. Base de Datos Espacial (Neon PostgreSQL + PostGIS): Almacén transaccional en la nube con soporte nativo para coordenadas WGS84 (SRID 4326), tipos de datos JSONB para geometrías y extensión pgcrypto.")

    doc.add_heading("2. MECANISMOS TÉCNICOS CRÍTICOS IMPLEMENTADOS", level=1)
    add_p(doc, "A. Conexión SSL Segura y Bypass de `pg-connection-string`: Para evitar que el parámetro `?sslmode=require` de Neon sobreescriba las opciones TLS en Node.js, el servidor descompone la URL con el motor nativo `new URL()` inyectando `{ ssl: { require: true, rejectUnauthorized: false } }` directamente a Sequelize.")
    add_p(doc, "B. Sincronización Topológica de Modelos: Las tablas relacionales se sincronizan en estricto orden de dependencias para garantizar la integridad referencial en PostgreSQL:")
    add_p(doc, "   `Role` / `Department` / `ReportStatus` ➔ `User` / `Category` ➔ `Report` ➔ `ReportEvidence` / `ReportHistory` / `CitizenSupport` / `WorkOrder`.")
    add_p(doc, "C. Enrutamiento Dual Universal: Express expone los endpoints tanto bajo el prefijo canónico `/api/v1` como directamente en la raíz `/`, garantizando interoperabilidad inmediata ante cualquier configuración de baseURL del cliente.")
    add_p(doc, "D. Endpoints de Diagnóstico en Tiempo Real: `GET /health` y `GET /api/v1/health` ejecutan una verificación en vivo (`sequelize.authenticate()`) devolviendo el estado de salud de la base de datos en JSON.")

    doc.add_heading("3. MATRIZ INTEGRAL DE ENDPOINTS DE LA API REST", level=1)
    add_custom_table(
        doc,
        ["Método", "Ruta de Producción", "Rol Requerido", "Descripción y Payload"],
        [
            ["GET", "/health | /api/v1/health", "Público", "Diagnóstico del servidor y estado de la conexión a la base de datos."],
            ["POST", "/auth/login | /api/v1/auth/login", "Público", "Autenticación de usuarios. Body: { email, password }. Retorna JWT."],
            ["POST", "/auth/register | /api/v1/auth/register", "Público", "Registro de ciudadanos. Body: { nombre, email, password, colonia }."],
            ["GET", "/auth/me | /api/v1/auth/me", "Autenticado", "Información del usuario descifrada a partir del token JWT."],
            ["GET", "/catalogos/categorias", "Público", "Catálogo oficial de tipos de incidencia municipal con SLAs."],
            ["GET", "/reportes | /api/v1/reportes", "Público", "Listado de incidencias con filtros de búsqueda, estado y categoría."],
            ["POST", "/reportes | /api/v1/reportes", "Público / Auth", "Creación de reporte (multipart/form-data con foto y coordenadas GPS)."],
            ["GET", "/reportes/gis/geojson", "Público", "Capa espacial GeoJSON FeatureCollection para visualizadores GIS."],
            ["GET", "/reportes/analitica", "Admin / Público", "Métricas agregadas, porcentaje de resolución y colonias críticas."],
            ["POST", "/reportes/:id/apoyo", "Público / Auth", "Registro del voto de apoyo ciudadano ('A mí también me afecta')."],
            ["GET", "/ordenes | /api/v1/ordenes", "Admin, Operador", "Listado de todas las órdenes de trabajo activas e históricas."],
            ["GET", "/ordenes/mis-ordenes", "Cuadrilla", "Bandeja de órdenes asignadas a la brigada operativa en sesión."],
            ["POST", "/ordenes | /api/v1/ordenes", "Admin, Operador", "Despacho de OT: { reporte_id, cuadrilla_id, instrucciones, fecha_limite }."],
            ["PATCH", "/ordenes/:id/iniciar", "Cuadrilla, Admin", "Marca la orden como 'En Proceso' con estampa de tiempo."],
            ["POST", "/ordenes/:id/finalizar", "Cuadrilla, Admin", "Cierre técnico con fotografía obligatoria de resolución y bitácora."],
            ["PATCH", "/ordenes/:id/aprobar", "Administrador", "Aprobación definitiva de cierre tras comparar fotos 'antes/después'."],
            ["GET", "/usuarios | /api/v1/usuarios", "Administrador", "Directorio y gestión de cuentas de operadores y cuadrillas."],
        ],
        [0.7, 2.0, 1.2, 2.7]
    )

    doc.add_heading("4. MODELO DE SEGURIDAD Y ACCESO (RBAC)", level=1)
    add_p(doc, "1. Hashing de Contraseñas: Algoritmo bcrypt con salt rounds = 10, ejecutado en hooks `beforeCreate` y `beforeUpdate`.")
    add_p(doc, "2. Tokens JWT Stateless: Firmados digitalmente con expiración de 7 días, portando el rol institucional y el ID único del usuario.")
    add_p(doc, "3. Middleware `authenticateJWT`: Extrae la cabecera `Authorization: Bearer <token>`, valida la firma y carga el usuario en `req.user`.")
    add_p(doc, "4. Middleware `authorizeRoles`: Restringe el acceso evaluando el rol del usuario frente a la lista blanca de permisos del endpoint.")
    add_p(doc, "5. Almacenamiento Seguro de Evidencias: Validación estricta de tipos MIME (`image/jpeg`, `image/png`, `image/webp`), sanitización de nombres de archivo y límite de 5MB por archivo.")

    doc.add_heading("5. RESPALDOS Y RECUPERACIÓN ANTE DESASTRES", level=1)
    add_p(doc, "1. Respaldo directo en la nube mediante `pg_dump` con SSL:\n```bash\npg_dump \"postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require\" -F c -b -v -f backup_cloud_sigiu.dump\n```")
    add_p(doc, "2. Restauración rápida:\n```bash\npg_restore -d \"postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require\" -v backup_cloud_sigiu.dump\n```")

    doc_path = os.path.join(DOC_DIR, "manual_tecnico_SIGIU.docx")
    doc.save(doc_path)
    print(f"[OK] Manual Técnico generado: {doc_path} ({os.path.getsize(doc_path)} bytes)")

if __name__ == "__main__":
    generate_user_manual()
    generate_install_manual()
    generate_technical_manual()
    print("Todos los manuales complementarios actualizados con éxito.")
