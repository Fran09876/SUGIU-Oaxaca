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
    return p

def add_callout(doc, title, text):
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = tbl.cell(0, 0)
    set_cell_background(cell, "F5F7F8")
    set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    r_title = p.add_run(f"NOTA IMPORTANTE: {title}\n")
    r_title.bold = True
    r_title.font.size = Pt(10)
    r_title.font.color.rgb = RGBColor(63, 75, 72)
    r_text = p.add_run(text)
    r_text.font.size = Pt(9.5)
    r_text.font.color.rgb = RGBColor(21, 23, 25)
    cell._tc.get_or_add_tcPr().append(parse_xml(
        f'<w:tcBorders {nsdecls("w")}><w:left w:val="single" w:sz="24" w:space="0" w:color="3F4B48"/><w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/></w:tcBorders>'
    ))
    add_p(doc, "", space_after=4)

def add_custom_table(doc, headers, rows_data, col_widths=None):
    tbl = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl, color="B0B7BB", sz="4")
    make_header_row_repeat(tbl.rows[0])

    for j, h in enumerate(headers):
        cell = tbl.cell(0, j)
        set_cell_background(cell, "151719")
        set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.0
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(255, 255, 255)

    for i, row in enumerate(rows_data):
        bg = "FFFFFF" if i % 2 == 0 else "F5F7F8"
        for j, val in enumerate(row):
            cell = tbl.cell(i + 1, j)
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=90, bottom=90, left=120, right=120)
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.15
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if j > 1 else WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(str(val))
            r.font.size = Pt(9)
            r.font.color.rgb = RGBColor(21, 23, 25)

    if col_widths:
        for row in tbl.rows:
            for j, w in enumerate(col_widths):
                row.cells[j].width = Inches(w)

    add_p(doc, "", space_after=6)
    return tbl

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
    add_p(doc, "Plataforma Web Responsiva para la Gestión de Incidencias Urbanas en Oaxaca de Juárez\nGuía de Operación Paso a Paso para Ciudadanos, Operadores, Cuadrillas y Administradores", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=30)
    add_p(doc, "Autor: José Francisco Pérez Pérez (No. Control: 2211204)\nDocente: Cruz Hernández Bernardo Roberto\nPeriodo: Agosto - Diciembre 2026", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=40)
    doc.add_page_break()

    # Contenido
    doc.add_heading("1. INTRODUCCIÓN Y REQUISITOS DE ACCESO", level=1)
    add_p(doc, "El Sistema Integral de Gestión de Incidencias Urbanas (SIGIU) es una plataforma web responsiva accesible mediante cualquier navegador moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari) desde computadoras de escritorio, laptops, tabletas y teléfonos celulares.")
    add_p(doc, "Para acceder al sistema no es necesario descargar ninguna aplicación desde tiendas digitales. Basta con ingresar a la dirección web asignada por el municipio (por ejemplo, en entorno local: http://localhost:5173).")

    doc.add_heading("2. PERFIL CIUDADANO (PÚBLICO EN GENERAL)", level=1)
    doc.add_heading("2.1. Registro de Cuenta Ciudadana e Inicio de Sesión", level=2)
    add_p(doc, "Cualquier persona puede navegar y reportar como ciudadano digital. Sin embargo, para dar seguimiento a un historial propio de incidencias se recomienda registrar una cuenta:")
    add_p(doc, "1. Haga clic en el botón 'Ingresar al Sistema' ubicado en la esquina superior derecha del encabezado institucional.")
    add_p(doc, "2. En la ventana modal, seleccione la pestaña 'Registro Ciudadano'.")
    add_p(doc, "3. Complete los campos requeridos: Nombre completo, correo electrónico, teléfono de contacto, colonia de residencia (seleccionable del padrón de Oaxaca) y contraseña segura (mínimo 6 caracteres).")
    add_p(doc, "4. Presione 'Completar Registro Ciudadano'. El sistema creará la cuenta y mantendrá la sesión activa automáticamente mediante un token digital seguro.")

    doc.add_heading("2.2. Cómo Levantar un Reporte de Falla Urbana (Paso a Paso)", level=2)
    add_p(doc, "1. En la página principal, asegúrese de encontrarse en la pestaña 'Reportar'.")
    add_p(doc, "2. Paso 1 - Categoría de Incidencia: Seleccione una de las tarjetas interactivas correspondientes al tipo de problema observado: Bacheo y Pavimentación, Alumbrado Público, Fugas de Agua y Drenaje, Recolección de Basura o Semáforos y Señalización. Cada tarjeta indica el tiempo estimado de atención municipal (SLA).")
    add_p(doc, "3. Paso 2 - Ubicación Exacta (GPS): El sistema incluye un radar geográfico que puede detectar su ubicación vía satélite presionando 'Detectar mi GPS'. El navegador solicitará permiso de ubicación (haga clic en 'Permitir'). Si prefiere ajustar manualmente el punto exacto, presione el botón de mapa y arrastre el marcador rojo sobre la calle precisa de la falla.")
    add_p(doc, "4. Paso 3 - Datos Descriptivos: Indique la colonia de Oaxaca de Juárez, calle y esquinas de referencia, un título breve de la falla (ej. 'Hundimiento profundo de adoquín frente al templo') y una descripción clara de las dimensiones y el riesgo peatonal o vehicular.")
    add_p(doc, "5. Paso 4 - Nivel de Severidad: Seleccione el nivel percibido: Baja, Media, Alta o Urgente.")
    add_p(doc, "6. Paso 5 - Evidencia Fotográfica: Presione 'Abrir Cámara' para capturar la fotografía directamente en el lugar, o 'Galería de Archivos' para adjuntar una imagen JPG, PNG o WEBP (máximo 5MB).")
    add_p(doc, "7. Paso 6 - Envío y Acuse: Presione 'Enviar Reporte Ciudadano Oficial'. Una vez procesado, aparecerá en pantalla una ficha con el Folio Único Oficial (ej. OAX-2026-8002). Presione 'Copiar' para conservar su número de seguimiento.")

    doc.add_heading("2.3. Consulta de Muro Comunitario y Apoyo Ciudadano", level=2)
    add_p(doc, "En la pestaña 'Muro', los habitantes pueden revisar las fallas reportadas recientemente por otros vecinos. Si un bache o luminaria reportada por otra persona también le afecta, presione el botón 'A mí también me afecta'. El sistema sumará su respaldo y elevará la prioridad de atención para la cuadrilla municipal sin generar duplicidad de reportes.")

    doc.add_heading("2.4. Visor Cartográfico Urbano (GIS)", level=2)
    add_p(doc, "En la pestaña 'Mapa GIS', los ciudadanos pueden explorar la ciudad sobre el mapa de OpenStreetMap. Utilice las píldoras superiores para filtrar por tipo de falla. Al pulsar sobre cualquier marcador, se abrirá un panel inferior con la fotografía, colonia, fecha y estado de avance.")

    doc.add_heading("2.5. Seguimiento con Línea de Tiempo ('Mis Reportes')", level=2)
    add_p(doc, "En la pestaña 'Mis Reportes' se ofrece un buscador directo por folio para quienes no tengan sesión iniciada, así como la lista completa de reportes emitidos por el usuario registrado. Una línea de tiempo de 5 etapas indica claramente si la falla está en: 1. Recibido ➔ 2. En Validación ➔ 3. Asignado ➔ 4. En Proceso ➔ 5. Atendido.")

    doc.add_page_break()

    doc.add_heading("3. PERFIL OPERADOR DE DEPENDENCIA", level=1)
    add_p(doc, "El Operador es el enlace técnico de cada dirección municipal (DOPDU, Servicios, SOAPA, Tránsito). Al ingresar con sus credenciales institucionales (`operador@oaxaca.gob.mx`), el sistema despliega automáticamente la Mesa de Despacho Operativo:")
    add_p(doc, "1. Métricas Inmediatas: Cuatro tarjetas superiores muestran en tiempo real las incidencias recibidas, asignadas, en proceso y resueltas.")
    add_p(doc, "2. Filtros Dinámicos: El operador puede filtrar por estatus de atención, nivel de prioridad o ingresar términos de búsqueda por folio o colonia.")
    add_p(doc, "3. Inspección de Falla: Al pulsar el botón de documento en cualquier fila de la tabla, se abre la ficha con la fotografía ciudadana y coordenadas exactas.")
    add_p(doc, "4. Despacho de Orden de Trabajo (OT): Al pulsar 'Despachar OT', se abre el modal oficial de despacho. El operador selecciona la cuadrilla de campo disponible, establece la fecha y hora límite de cumplimiento conforme al SLA y redacta instrucciones técnicas específicas sobre maquinaria o materiales necesarios. Al guardar, el reporte pasa a 'Asignado' y se emite la orden con folio `OT-2026-XXXX`.")

    doc.add_page_break()

    doc.add_heading("4. PERFIL PERSONAL DE CUADRILLA EN CAMPO", level=1)
    add_p(doc, "El personal operativo de cuadrilla (`cuadrilla@oaxaca.gob.mx`) cuenta con una interfaz web responsiva especialmente diseñada para teléfonos móviles y trabajo en terreno:")
    add_p(doc, "1. Bandeja de Órdenes: La vista muestra exclusivamente las órdenes asignadas a dicha cuadrilla, con filtros de 'Todas', 'Activas en Campo' y 'Atendidas'.")
    add_p(doc, "2. Navegación Satelital: Cada orden incluye un botón 'Ruta GPS' que abre directamente Google Maps con las coordenadas del reporte para guiar el camión de volteo o brigada hasta el punto exacto de la falla.")
    add_p(doc, "3. Inicio de Reparación: Al llegar al sitio de la obra, la cuadrilla presiona 'Iniciar Reparación (En Proceso)'. El sistema registra la fecha y hora de inicio de actividades y notifica el cambio de estado.")
    add_p(doc, "4. Cierre Técnico con Fotografía de Resolución: Al concluir los trabajos de bacheo o reparación, la cuadrilla presiona 'Concluir y Subir Evidencia'. El sistema exige dos elementos obligatorios:")
    add_p(doc, "   a) Bitácora Técnica: Redacción de materiales y labores efectuadas (ej. 'Se aplicaron 3m² de asfalto en caliente y compactación con rodillo').")
    add_p(doc, "   b) Fotografía de Resolución: Captura con la cámara de la obra concluida. Sin esta fotografía, el sistema rechaza el cierre. Al enviarse, la orden pasa a 'Atendida' y el reporte a 'Atendido'.")

    doc.add_page_break()

    doc.add_heading("5. PERFIL ADMINISTRADOR CENTRAL", level=1)
    add_p(doc, "El Administrador (`admin@oaxaca.gob.mx`) dispone del control integral de la plataforma mediante cinco módulos:")
    add_p(doc, "1. Analítica y Rendición de Cuentas: Métricas de volumen de incidencias, porcentaje de eficiencia resolutiva, tiempo promedio de respuesta en horas, apoyos ciudadanos emitidos, ranking de las 5 colonias con mayor número de fallas y balance de estados.")
    add_p(doc, "2. Mapeo GIS General: Visor cartográfico macro de todas las incidencias del municipio con clústeres y capas.")
    add_p(doc, "3. Supervisión de Órdenes: Permite auditar las órdenes concluidas y abrir el Comparador Visual de Evidencias ('Antes vs Después') para comprobar la calidad del trabajo de la cuadrilla antes de presionar 'Aprobar Cierre Definitivo'.")
    add_p(doc, "4. Gestión de Usuarios (CRUD): Directorio para dar de alta cuentas de operadores y cuadrillas, editar datos y activar o suspender accesos.")
    add_p(doc, "5. Catálogos Municipales (CRUD): Módulo para dar de alta nuevas dependencias o categorías de falla ajustando las horas de atención del SLA.")

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
    p_title = add_p(doc, "MANUAL DE INSTALACIÓN Y CONFIGURACIÓN TÉCNICA", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    p_title.runs[0].font.size = Pt(16)
    add_p(doc, "Guía de Despliegue Local y Puesta a Punto del Entorno SIGIU (Node.js + PostgreSQL + React)", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=30)
    add_p(doc, "Autor: José Francisco Pérez Pérez (No. Control: 2211204)\nPeriodo: Agosto - Diciembre 2026", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=40)
    doc.add_page_break()

    doc.add_heading("1. REQUISITOS PREVIOS DEL SISTEMA", level=1)
    add_p(doc, "Para la instalación y ejecución exitosa de SIGIU en un servidor o estación de trabajo, se deben cumplir los siguientes requisitos de hardware y software:")
    add_custom_table(
        doc,
        ["Componente de Software", "Versión Requerida", "Propósito en la Instalación"],
        [
            ["Sistema Operativo", "Windows 10/11 x64, Ubuntu 20.04+ o macOS", "Entorno host de desarrollo y ejecución"],
            ["Node.js", "v18.0.0 LTS o superior (v20+ recomendada)", "Runtime del servidor Express y herramientas npm"],
            ["npm (Node Package Manager)", "v9.0.0 o superior", "Gestor de paquetes de dependencias"],
            ["PostgreSQL", "v15.0 o superior", "Servidor de base de datos relacional (puerto 5432)"],
            ["Git", "v2.30+ (opcional)", "Control de versiones para clonación del código fuente"],
            ["Navegador Web", "Google Chrome, Firefox o Edge actualizados", "Cliente de ejecución con soporte para Web Geolocation API"],
        ],
        [2.0, 2.0, 2.5]
    )

    doc.add_heading("2. ESTRUCTURA DEL REPOSITORIO Y DESCARGA", level=1)
    add_p(doc, "El proyecto está organizado como un monorepositorio con las siguientes carpetas principales:")
    add_p(doc, "- `/server`: Código de la API RESTful en Node.js Express, modelos Sequelize, seeders y scripts SQL.")
    add_p(doc, "- `/client`: Código de la SPA en React 19, componentes Tailwind y configuración de empaquetado Vite.")
    add_p(doc, "- `/documentacion`: Informes técnicos, manuales y diagramas UML.")

    doc.add_heading("3. INSTALACIÓN DE DEPENDENCIAS", level=1)
    add_p(doc, "Abra una terminal de comandos (PowerShell, Bash o CMD) en la raíz del proyecto y ejecute los siguientes comandos:")
    add_p(doc, "Paso 1: Instalación de dependencias del servidor backend:\n```bash\ncd server\nnpm install\n```")
    add_p(doc, "Paso 2: Instalación de dependencias del cliente frontend:\n```bash\ncd ../client\nnpm install\n```")

    doc.add_heading("4. CONFIGURACIÓN DE VARIABLES DE ENTORNO", level=1)
    add_p(doc, "En el directorio `server/`, cree o edite el archivo `.env` tomando como base la plantilla `.env.example`:")
    add_p(doc, "```env\nPORT=5000\nNODE_ENV=development\nUSE_SQLITE=false\nDB_HOST=localhost\nDB_PORT=5432\nDB_NAME=sigiu_db\nDB_USER=postgres\nDB_PASSWORD=tu_password_postgres\nJWT_SECRET=sigiu_oaxaca_jwt_super_secret_key_2026_secure\nJWT_EXPIRES_IN=7d\nCLIENT_URL=http://localhost:5173\nUPLOAD_DIR=uploads\n```")
    add_callout(doc, "MODO DE FALLBACK SQLITE", "Si no dispone de una instancia de PostgreSQL en su equipo de desarrollo, configure `USE_SQLITE=true`. El sistema creará y utilizará automáticamente una base de datos local embebida en `server/database.sqlite`.")

    doc.add_heading("5. INICIALIZACIÓN DE LA BASE DE DATOS POSTGRESQL", level=1)
    add_p(doc, "1. Inicie su servidor de PostgreSQL e ingrese a la consola de administración (`psql` o pgAdmin).")
    add_p(doc, "2. Cree la base de datos oficial del sistema:\n```sql\nCREATE DATABASE sigiu_db;\n```")
    add_p(doc, "3. Conéctese a la base de datos `sigiu_db` y ejecute el script DDL de creación de tablas e índices ubicado en `server/src/sql/ddl_sigiu.sql`:")
    add_p(doc, "```bash\npsql -U postgres -d sigiu_db -f src/sql/ddl_sigiu.sql\n```")
    add_p(doc, "4. Ejecute el script de sembrado de datos iniciales para cargar los roles, dependencias, categorías y usuarios de prueba:\n```bash\ncd server\nnode src/seeders/seed.js\n```")

    doc.add_heading("6. INICIO DE LOS SERVIDORES", level=1)
    add_p(doc, "Paso 1: Iniciar el backend en una terminal:\n```bash\ncd server\nnpm start\n```\nEl servidor informará que está escuchando en: `http://localhost:5000`.")
    add_p(doc, "Paso 2: Comprobar el diagnóstico del backend en su navegador:\nAbra `http://localhost:5000/api/v1/health`. Debe recibir un objeto JSON indicando `\"status\": \"online\"`.")
    add_p(doc, "Paso 3: Iniciar el frontend en otra terminal:\n```bash\ncd client\nnpm run dev\n```\nVite iniciará la interfaz web en: `http://localhost:5173`.")

    doc.add_heading("7. SOLUCIÓN DE PROBLEMAS COMUNES", level=1)
    add_p(doc, "- Error de puerto ocupado (EADDRINUSE 5000 o 5173): Cierre el proceso que esté utilizando el puerto mediante `netstat` y `taskkill` en Windows, o cambie el puerto en `server/.env`.")
    add_p(doc, "- Advertencia de PostGIS no habilitado: El sistema opera de manera nativa con coordenadas WGS84 decimales y GeoJSON sin requerir obligatoriamente la extensión binaria. Para habilitarla en PostgreSQL, ejecute `CREATE EXTENSION postgis;` en la consola de PostgreSQL.")
    add_p(doc, "- Permiso de geolocalización bloqueado: Los navegadores modernos exigen HTTPS para la Geolocation API cuando se accede desde una IP remota. En `localhost`, el permiso opera normalmente en HTTP.")

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
    p_title = add_p(doc, "MANUAL TÉCNICO DE ARQUITECTURA Y MANTENIMIENTO", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12)
    p_title.runs[0].font.size = Pt(16)
    add_p(doc, "Especificación Detallada de Endpoints RESTful, Modelos Sequelize, Seguridad y Procedimientos de Mantenimiento", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=30)
    add_p(doc, "Autor: José Francisco Pérez Pérez (No. Control: 2211204)\nPeriodo: Agosto - Diciembre 2026", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=40)
    doc.add_page_break()

    doc.add_heading("1. ARQUITECTURA EN CAPAS Y DESACOPLAMIENTO", level=1)
    add_p(doc, "El sistema SIGIU se rige bajo una arquitectura desacoplada en cuatro capas fundamentales:")
    add_p(doc, "1. Capa de Presentación: SPA en React 19 empaquetada con Vite. Administra el estado global de autenticación con Context API (`AuthContext`) y expone las vistas por rol con Tailwind CSS.")
    add_p(doc, "2. Capa de Servicios y Controladores: Servidor Express.js estructurado en controladores modulares (`authController`, `reportController`, `workOrderController`, `userController`, `catalogController`).")
    add_p(doc, "3. Capa de Middlewares y Seguridad: Interceptores de autenticación JWT (`authenticateJWT`), control de acceso RBAC (`authorizeRoles`), carga defensiva con Multer (`multer.js`) y manejador global de errores (`errorHandler.js`).")
    add_p(doc, "4. Capa de Persistencia ORM: Modelos de datos Sequelize comunicados mediante el driver `pg` hacia PostgreSQL 15+.")

    doc.add_heading("2. CONTRATO DETALLADO DE LA API RESTFUL (/api/v1)", level=1)
    add_custom_table(
        doc,
        ["Método", "Endpoint", "Rol Requerido", "Descripción y Carga Útil"],
        [
            ["GET", "/api/v1/health", "Público", "Diagnóstico de salud del servicio y compatibilidad municipal."],
            ["POST", "/api/v1/auth/register", "Público", "Registro ciudadano. Body: { nombre, email, password, colonia, telefono }."],
            ["POST", "/api/v1/auth/login", "Público", "Inicio de sesión. Body: { email, password }. Retorna: { token, user }."],
            ["GET", "/api/v1/auth/me", "Autenticado", "Perfil del usuario asociado al token Bearer en cabecera."],
            ["GET", "/api/v1/reportes", "Público", "Listado con filtros query: ?categoria_id=&estado_id=&prioridad=&search="],
            ["POST", "/api/v1/reportes", "Público / Auth", "Creación de reporte (multipart/form-data con archivo 'evidencia' y campos GPS)."],
            ["GET", "/api/v1/reportes/:id", "Público", "Detalle de incidencia por ID (UUID) o folio oficial (OAX-YYYY-XXXX)."],
            ["GET", "/api/v1/reportes/gis/geojson", "Público", "Exportación GeoJSON FeatureCollection RFC 7946 para visores cartográficos."],
            ["GET", "/api/v1/reportes/mis-reportes", "Ciudadano", "Historial de reportes del usuario en sesión con línea de tiempo."],
            ["POST", "/api/v1/reportes/:id/apoyo", "Público / Auth", "Incrementa votos_apoyo y registra relación única de apoyo ciudadano."],
            ["GET", "/api/v1/reportes/analitica", "Público / Admin", "KPIs de resolución, tiempo promedio en horas y top 5 colonias críticas."],
            ["GET", "/api/v1/ordenes", "Admin, Operador", "Listado de todas las órdenes de trabajo emitidas en el municipio."],
            ["GET", "/api/v1/ordenes/mis-ordenes", "Cuadrilla, Op, Admin", "Órdenes de trabajo asignadas a la cuadrilla autenticada."],
            ["POST", "/api/v1/ordenes", "Admin, Operador", "Despacho de OT. Body: { reporte_id, cuadrilla_id, instrucciones, fecha_limite }."],
            ["PATCH", "/api/v1/ordenes/:id/iniciar", "Cuadrilla, Op, Admin", "Transición a 'En Proceso' con registro de fecha y hora de inicio en campo."],
            ["POST", "/api/v1/ordenes/:id/finalizar", "Cuadrilla, Op, Admin", "Cierre técnico con multipart/form-data: 'evidencia_resolucion' y 'observaciones'."],
            ["PATCH", "/api/v1/ordenes/:id/aprobar", "Administrador", "Aprobación definitiva de cierre tras inspección visual antes/después."],
            ["GET", "/api/v1/usuarios", "Administrador", "Directorio general de usuarios con filtros por rol."],
            ["POST", "/api/v1/usuarios", "Administrador", "Creación de cuentas administrativas y operativas de cuadrilla."],
            ["PATCH", "/api/v1/usuarios/:id/status", "Administrador", "Alternancia de estado activo / inactivo de un usuario."],
        ],
        [0.7, 1.8, 1.2, 2.8]
    )

    doc.add_heading("3. MODELOS SEQUELIZE Y ASOCIACIONES", level=1)
    add_p(doc, "Las asociaciones entre entidades se configuran centralizadamente en `server/src/models/index.js`:")
    add_p(doc, "- `Role.hasMany(User)` / `User.belongsTo(Role, { as: 'rol' })`")
    add_p(doc, "- `Department.hasMany(User)` / `User.belongsTo(Department, { as: 'dependencia' })`")
    add_p(doc, "- `Department.hasMany(Category)` / `Category.belongsTo(Department)`")
    add_p(doc, "- `Category.hasMany(Report)` / `Report.belongsTo(Category, { as: 'categoria' })`")
    add_p(doc, "- `ReportStatus.hasMany(Report)` / `Report.belongsTo(ReportStatus, { as: 'estado' })`")
    add_p(doc, "- `User.hasMany(Report, { as: 'mis_reportes' })` / `Report.belongsTo(User, { as: 'ciudadano' })`")
    add_p(doc, "- `Report.hasMany(ReportEvidence, { as: 'evidencias' })`")
    add_p(doc, "- `Report.hasOne(WorkOrder, { as: 'ordenTrabajo' })` / `WorkOrder.belongsTo(Report)`")
    add_p(doc, "- `User.hasMany(WorkOrder, { as: 'ordenes_asignadas' })` / `WorkOrder.belongsTo(User, { as: 'cuadrilla' })`")

    doc.add_heading("4. SEGURIDAD Y GESTIÓN DE SESIONES", level=1)
    add_p(doc, "El flujo criptográfico opera de la siguiente forma:")
    add_p(doc, "1. En el registro/modificación, el hook `beforeSave` de Sequelize ejecuta `bcrypt.hash(password, 10)` y almacena el hash en `password_hash`.")
    add_p(doc, "2. En el inicio de sesión, `bcrypt.compare(password, user.password_hash)` valida la coincidencia matemática sin revelar el texto plano.")
    add_p(doc, "3. Se emite un JWT Stateless firmado con `JWT_SECRET` que contiene `{ id, email, rol }`.")
    add_p(doc, "4. En cada petición protegida, el middleware `authenticateJWT` valida la firma del token y carga la instancia del usuario activo en `req.user`.")
    add_p(doc, "5. El middleware `authorizeRoles` evalúa si `req.user.rol.nombre` coincide con la lista de roles autorizados para el endpoint.")

    doc.add_heading("5. PROCEDIMIENTOS DE MANTENIMIENTO Y BACKUPS", level=1)
    add_p(doc, "1. Respaldo periódico de la base de datos PostgreSQL:\n```bash\npg_dump -U postgres -h localhost -d sigiu_db -F c -b -v -f backup_sigiu_$(date +%Y%m%d).dump\n```")
    add_p(doc, "2. Restauración de un respaldo:\n```bash\npg_restore -U postgres -h localhost -d sigiu_db -v backup_sigiu_20261122.dump\n```")
    add_p(doc, "3. Mantenimiento del directorio de subidas (`uploads/`):\nSe recomienda ejecutar un script mensual de auditoría para eliminar archivos temporales huérfanos que no cuenten con un registro asociado en la tabla `imagenes_reporte`.")

    doc_path = os.path.join(DOC_DIR, "manual_tecnico_SIGIU.docx")
    doc.save(doc_path)
    print(f"[OK] Manual Técnico generado: {doc_path} ({os.path.getsize(doc_path)} bytes)")

if __name__ == "__main__":
    generate_user_manual()
    generate_install_manual()
    generate_technical_manual()
    print("Todos los manuales complementarios generados con éxito.")
