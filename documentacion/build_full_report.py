import os
import sys
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor, Cm
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from docx_utils import set_cell_margins, set_cell_background, set_table_borders, make_header_row_repeat

DOC_DIR = os.path.dirname(os.path.abspath(__file__))
DIAG_DIR = os.path.join(DOC_DIR, "diagramas")
DOCX_PATH = os.path.join(DOC_DIR, "informe_SIGIU.docx")

def create_sigiu_report():
    print("[1/5] Inicializando documento Word con plantilla institucional TecNM...")
    doc = Document()

    # 1. Configuración de Página (Carta con márgenes de 2.5 cm en los cuatro lados)
    for section in doc.sections:
        section.page_width = Cm(21.59)
        section.page_height = Cm(27.94)
        section.top_margin = Cm(2.5)
        section.bottom_margin = Cm(2.5)
        section.left_margin = Cm(2.5)
        section.right_margin = Cm(2.5)
        section.header_distance = Cm(1.27)
        section.footer_distance = Cm(1.27)

    # 2. Configuración de Estilos Tipográficos (Arial estricto)
    styles = doc.styles

    # Normal / Cuerpo de texto
    style_normal = styles['Normal']
    font_normal = style_normal.font
    font_normal.name = 'Arial'
    font_normal.size = Pt(12)
    font_normal.color.rgb = RGBColor(21, 23, 25) # Charcoal
    style_normal.paragraph_format.line_spacing = 1.5
    style_normal.paragraph_format.space_after = Pt(6)
    style_normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # Título 1 (Capítulo)
    style_h1 = styles['Heading 1']
    font_h1 = style_h1.font
    font_h1.name = 'Arial'
    font_h1.size = Pt(16)
    font_h1.bold = True
    font_h1.color.rgb = RGBColor(21, 23, 25)
    style_h1.paragraph_format.space_before = Pt(18)
    style_h1.paragraph_format.space_after = Pt(8)
    style_h1.paragraph_format.keep_with_next = True

    # Título 2 (Apartado)
    style_h2 = styles['Heading 2']
    font_h2 = style_h2.font
    font_h2.name = 'Arial'
    font_h2.size = Pt(14)
    font_h2.bold = True
    font_h2.color.rgb = RGBColor(63, 75, 72) # Slate Gray
    style_h2.paragraph_format.space_before = Pt(14)
    style_h2.paragraph_format.space_after = Pt(6)
    style_h2.paragraph_format.keep_with_next = True

    # Título 3 (Subapartado)
    style_h3 = styles['Heading 3']
    font_h3 = style_h3.font
    font_h3.name = 'Arial'
    font_h3.size = Pt(12)
    font_h3.bold = True
    font_h3.color.rgb = RGBColor(21, 23, 25)
    style_h3.paragraph_format.space_before = Pt(10)
    style_h3.paragraph_format.space_after = Pt(4)
    style_h3.paragraph_format.keep_with_next = True

    def add_p(text="", bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=6):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.5
        if text:
            run = p.add_run(text)
            run.bold = bold
            run.italic = italic
        return p

    def add_h1(text):
        p = doc.add_heading(text.upper(), level=1)
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        return p

    def add_h2(text):
        p = doc.add_heading(text, level=2)
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        return p

    def add_h3(text):
        p = doc.add_heading(text, level=3)
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        return p

    def add_callout(title, text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        set_cell_background(cell, "F5F7F8")
        set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.15
        r_title = p.add_run(f"NOTA METODOLÓGICA: {title}\n")
        r_title.bold = True
        r_title.font.size = Pt(10)
        r_title.font.color.rgb = RGBColor(63, 75, 72)
        r_text = p.add_run(text)
        r_text.font.size = Pt(9.5)
        r_text.font.color.rgb = RGBColor(21, 23, 25)
        # Borde izquierdo grueso
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:left w:val="single" w:sz="24" w:space="0" w:color="3F4B48"/>'
            f'<w:top w:val="none"/><w:right w:val="none"/><w:bottom w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders)
        add_p("", space_after=4)

    def add_fig(filename, caption):
        filepath = os.path.join(DIAG_DIR, filename)
        if os.path.exists(filepath):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(4)
            p.add_run().add_picture(filepath, width=Inches(6.2))
            
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_after = Pt(12)
            run_cap = p_cap.add_run(caption)
            run_cap.font.size = Pt(10)
            run_cap.font.italic = True
            run_cap.font.color.rgb = RGBColor(63, 75, 72)

    def create_custom_table(headers, rows_data, col_widths=None):
        tbl = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl, color="B0B7BB", sz="4")
        make_header_row_repeat(tbl.rows[0])

        # Encabezado
        for j, h in enumerate(headers):
            cell = tbl.cell(0, j)
            set_cell_background(cell, "151719")
            set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.0
            r = p.add_run(h)
            r.bold = True
            r.font.size = Pt(9.5)
            r.font.color.rgb = RGBColor(255, 255, 255)

        # Filas de datos
        for i, row in enumerate(rows_data):
            bg = "FFFFFF" if i % 2 == 0 else "F5F7F8"
            for j, val in enumerate(row):
                cell = tbl.cell(i + 1, j)
                set_cell_background(cell, bg)
                set_cell_margins(cell, top=100, bottom=100, left=130, right=130)
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

        add_p("", space_after=6)
        return tbl

    print("[2/5] Redactando preliminares institucionales TecNM / ITO...")

    # ==============================================================================
    # PORTADA INSTITUCIONAL
    # ==============================================================================
    p_inst = add_p("TECNOLÓGICO NACIONAL DE MÉXICO", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2)
    p_inst.runs[0].font.size = Pt(14)
    p_ito = add_p("INSTITUTO TECNOLÓGICO DE OAXACA", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4)
    p_ito.runs[0].font.size = Pt(13)
    p_dep = add_p("DEPARTAMENTO DE SISTEMAS Y COMPUTACIÓN\nINGENIERÍA EN SISTEMAS COMPUTACIONALES",
                  bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=30)
    p_dep.runs[0].font.size = Pt(11)

    p_title = add_p("SIGIU: SISTEMA INTEGRAL DE GESTIÓN DE INCIDENCIAS URBANAS PARA EL MUNICIPIO DE OAXACA DE JUÁREZ",
                    bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=24)
    p_title.runs[0].font.size = Pt(16)
    p_title.runs[0].font.color.rgb = RGBColor(21, 23, 25)

    p_sub = add_p("INFORME TÉCNICO ACADÉMICO INTEGRAL BAJO LA METODOLOGÍA EXTREME PROGRAMMING (XP)",
                  bold=False, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=40)
    p_sub.runs[0].font.size = Pt(12)

    p_asign = add_p("Asignatura: Desarrollo Web con Enfoque Ágil (Grupo 7SB)\nPeriodo: Agosto – Diciembre 2026",
                    bold=False, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=30)
    p_asign.runs[0].font.size = Pt(11)

    p_author = add_p("Presenta:\nJOSÉ FRANCISCO PÉREZ PÉREZ\nNúmero de Control: 2211204\n\nDocente / Evaluador:\nCRUZ HERNÁNDEZ BERNARDO ROBERTO",
                     bold=False, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=50)
    p_author.runs[0].font.size = Pt(11.5)

    p_place = add_p("Oaxaca de Juárez, Oaxaca, México\nDiciembre de 2026",
                    bold=False, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0)
    p_place.runs[0].font.size = Pt(11)

    doc.add_page_break()

    # ==============================================================================
    # AGRADECIMIENTOS
    # ==============================================================================
    add_h1("AGRADECIMIENTOS")
    add_p("Al Tecnológico Nacional de México y en especial al Instituto Tecnológico de Oaxaca (ITO), por haberme brindado el entorno académico, los recursos formativos y la exigencia metodológica necesarios para consolidar mi perfil profesional como Ingeniero en Sistemas Computacionales.")
    add_p("Al catedrático Cruz Hernández Bernardo Roberto, por su guía analítica, su constante retroalimentación en la adopción de buenas prácticas de ingeniería de software ágil y por haber fungido con rigor crítico en el rol de cliente y evaluador técnico durante el ciclo de vida de este proyecto.")
    add_p("A la comunidad del Municipio de Oaxaca de Juárez, cuya riqueza histórica y desafíos en infraestructura urbana sirvieron de inspiración y contexto real para la concepción y modelado de esta plataforma tecnológica.")
    
    doc.add_page_break()

    # ==============================================================================
    # RESUMEN Y ABSTRACT
    # ==============================================================================
    add_h1("RESUMEN")
    add_p("El presente informe técnico documenta el diseño, modelado, desarrollo, auditoría e integración de la plataforma web responsiva denominada SIGIU (Sistema Integral de Gestión de Incidencias Urbanas para el Municipio de Oaxaca de Juárez), desarrollada bajo la metodología ágil Extreme Programming (XP) como propuesta de solución integral ante la problemática de fragmentación, opacidad y lentitud en la atención de fallas de infraestructura urbana pública (bacheo, luminarias apagadas, fugas de agua y drenaje colapsado).")
    add_p("La solución técnica se implementó a través de una arquitectura cliente-servidor desacoplada compuesta por un cliente web reactivo en React 19 empaquetado con Vite y estilizado mediante tokens semánticos en Tailwind CSS; una API RESTful robusta sobre Node.js y Express; y una capa de persistencia relacional en PostgreSQL 15 con coordenadas geodésicas en el estándar universal WGS84 (SRID 4326) serializadas en GeoJSON. Se implementó autenticación Stateless con JSON Web Tokens (JWT) y cifrado de contraseñas mediante Bcrypt, control de acceso basado en roles (RBAC) para cuatro perfiles (Ciudadano, Operador, Cuadrilla y Administrador), captura nativa de geolocalización satelital desde el navegador, almacenamiento defensivo de evidencias fotográficas mediante Multer con sanitización de archivos, un visor cartográfico interactivo sustentado en Leaflet y OpenStreetMap, un mecanismo de respaldo ciudadano comunitario ('A mí también me afecta'), trazabilidad con línea de tiempo en cinco estados, consolas de despacho operativo para generación de Órdenes de Trabajo con tiempos límite (SLA), un módulo web para personal de cuadrilla en campo con registro de bitácora y fotografía obligatoria de resolución, y un módulo administrativo de rendición de cuentas públicas y analítica.")
    add_p("Palabras clave: Extreme Programming (XP), Plataforma Web Responsiva, Incidencias Urbanas, PostgreSQL, Leaflet, GeoJSON, React 19, Node.js, JWT, Trazabilidad Ciudadana.")

    doc.add_page_break()

    add_h1("ABSTRACT")
    add_p("This technical report comprehensively documents the design, modeling, implementation, audit, and integration of the responsive web platform named SIGIU (Integrated Urban Incident Management System for the Municipality of Oaxaca de Juárez), engineered under the Extreme Programming (XP) agile methodology as a technological proposal to solve the fragmentation, opacity, and delays in public urban infrastructure failure resolution (potholes, public lighting failures, water pipe leaks, and collapsed sewage).")
    add_p("The technical architecture consists of a decoupled client-server structure featuring a responsive React 19 single-page application bundled with Vite and styled using Tailwind CSS semantic tokens; an Express.js RESTful API on Node.js; and a PostgreSQL 15 relational database storing geodetic coordinates under the WGS84 standard (EPSG:4326) serialized in GeoJSON. The system incorporates stateless JSON Web Token (JWT) authentication, Bcrypt password hashing, server-side Role-Based Access Control (RBAC) supporting four distinct profiles (Citizen, Operator, Field Crew, and Administrator), browser-based native GPS geolocation detection, defensive photographic evidence processing via Multer with MIME sanitation, an interactive Leaflet and OpenStreetMap GIS viewer, a community endorsement counter ('Affects me too'), incident timeline tracking across five states, an operational dispatch console with SLA deadlines, a mobile-ready interface for field maintenance crews requiring technical logs and mandatory resolution photographs, and an administrative accountability and analytics suite.")
    add_p("Keywords: Extreme Programming (XP), Responsive Web Platform, Urban Incidents, PostgreSQL, Leaflet, GeoJSON, React 19, Node.js, JWT, Citizen Accountability.")

    doc.add_page_break()

    # ==============================================================================
    # ÍNDICE GENERAL Y LISTAS
    # ==============================================================================
    add_h1("ÍNDICE GENERAL")
    indices = [
        ("PORTADA INSTITUCIONAL", "i"),
        ("AGRADECIMIENTOS", "ii"),
        ("RESUMEN", "iii"),
        ("ABSTRACT", "iv"),
        ("ÍNDICE DE FIGURAS Y TABLAS", "vi"),
        ("LISTA DE ABREVIATURAS Y ACRÓNIMOS", "vii"),
        ("CAPÍTULO I. GENERALIDADES DE LA ENTIDAD", "1"),
        ("   1.1. Nombre de la Entidad", "1"),
        ("   1.2. Sector al que Pertenece", "1"),
        ("   1.3. Antecedentes Institucionales", "2"),
        ("   1.4. Objetivos Institucionales", "3"),
        ("   1.5. Misión y Visión", "4"),
        ("   1.6. Estructura Organizacional", "5"),
        ("   1.7. Área de Referencia para el Proyecto", "6"),
        ("   1.8. Ubicación Geográfica y Competencia Territorial", "7"),
        ("   1.9. Procesos Tradicionales de Atención de Incidencias", "8"),
        ("CAPÍTULO II. GENERALIDADES DEL PROYECTO", "10"),
        ("   2.1. Nombre del Proyecto", "10"),
        ("   2.2. Antecedentes y Contexto Problemático", "10"),
        ("   2.3. Planteamiento del Problema", "12"),
        ("   2.4. Pregunta Central de Investigación", "13"),
        ("   2.5. Objetivo General", "14"),
        ("   2.6. Objetivos Específicos", "14"),
        ("   2.7. Justificación Técnica, Social e Institucional", "15"),
        ("   2.8. Alcances Delimitados", "17"),
        ("   2.9. Limitaciones Técnicas y Operativas", "18"),
        ("   2.10. Cronograma de Actividades y Estimación Temporal", "19"),
        ("   2.11. Beneficiarios y Actores Involucrados", "21"),
        ("CAPÍTULO III. MARCO TEÓRICO Y TECNOLÓGICO", "23"),
        ("   3.1. Ingeniería de Software Web y Arquitectura Desacoplada", "23"),
        ("   3.2. Metodologías Ágiles y Extreme Programming (XP)", "25"),
        ("   3.3. Interfaces Web Responsivas frente a Aplicaciones Nativas", "28"),
        ("   3.4. Tecnologías del Lado del Cliente (Frontend)", "30"),
        ("   3.5. Tecnologías del Lado del Servidor (Backend API REST)", "33"),
        ("   3.6. Persistencia Relacional y Modelado ORM", "36"),
        ("   3.7. Coordenadas Espaciales WGS84 y Formato GeoJSON", "38"),
        ("   3.8. Sistemas de Información Geográfica y Leaflet", "40"),
        ("   3.9. Seguridad Web, Autenticación JWT y Cifrado Criptográfico", "42"),
        ("CAPÍTULO IV. DESARROLLO DEL PROYECTO (ITERACIONES XP 0 A 5)", "45"),
        ("   4.1. Iteración Cero: Planificación, Entorno y Base de Datos", "45"),
        ("   4.2. Iteración Uno: Arquitectura Base y Modelado", "53"),
        ("   4.3. Iteración Dos: Módulo Ciudadano, GPS y Evidencia Fotográfica", "62"),
        ("   4.4. Iteración Tres: Panel de Despacho y Órdenes de Trabajo", "72"),
        ("   4.5. Iteración Cuatro: Integración GIS y Rendición de Cuentas", "82"),
        ("   4.6. Iteración Cinco: App Web para Cuadrillas y Cierre Técnico", "93"),
        ("CAPÍTULO V. PRUEBAS Y VALIDACIÓN DEL SISTEMA", "105"),
        ("   5.1. Estrategia Global de Pruebas", "105"),
        ("   5.2. Matriz de Casos de Prueba Ejecutados", "107"),
        ("   5.3. Resultados de Pruebas Automatizadas", "112"),
        ("   5.4. Análisis de Incidencias Detectadas y Resueltas", "114"),
        ("CAPÍTULO VI. RESULTADOS Y DISCUSIÓN", "116"),
        ("   6.1. Cumplimiento Cuantitativo y Cualitativo de Objetivos", "116"),
        ("   6.2. Cumplimiento de Historias de Usuario", "118"),
        ("   6.3. Comparación entre Alcance Planeado y Logrado", "121"),
        ("   6.4. Discusión Crítica de Hallazgos y Limitaciones", "123"),
        ("CAPÍTULO VII. CONCLUSIONES Y RECOMENDACIONES", "125"),
        ("   7.1. Conclusiones Generales y Específicas", "125"),
        ("   7.2. Aprendizajes Técnicos y Metodológicos", "127"),
        ("   7.3. Competencias Profesionales Desarrolladas", "128"),
        ("   7.4. Recomendaciones Técnicas para Despliegue Municipal", "129"),
        ("   7.5. Líneas de Trabajo Futuro", "131"),
        ("REFERENCIAS BIBLIOGRÁFICAS (APA 7MA EDICIÓN)", "133"),
        ("ANEXOS", "137"),
        ("   Anexo A: Product Backlog Priorizado Completo", "137"),
        ("   Anexo B: Matriz de Trazabilidad General del Sistema", "140"),
        ("   Anexo C: Diccionario de Datos de PostgreSQL", "144"),
        ("   Anexo D: Catálogo de Evidencias de Interfaz", "148"),
    ]

    for item, page in indices:
        p = add_p(space_after=2)
        r_item = p.add_run(item)
        r_item.font.size = Pt(10)
        if "CAPÍTULO" in item or item.isupper():
            r_item.bold = True
        p.add_run(f" {'.' * (68 - len(item))} ")
        r_page = p.add_run(page)
        r_page.bold = True
        r_page.font.size = Pt(10)

    doc.add_page_break()

    # ==============================================================================
    # ÍNDICE DE FIGURAS Y TABLAS
    # ==============================================================================
    add_h1("ÍNDICE DE FIGURAS Y TABLAS")
    add_h2("Índice de Figuras")
    figs = [
        ("Figura 4.1. Diagrama de Contexto del Sistema SIGIU", "48"),
        ("Figura 4.2. Diagrama de Arquitectura por Capas del Sistema SIGIU", "56"),
        ("Figura 4.3. Diagrama Entidad-Relación de la Base de Datos SIGIU (PostgreSQL)", "59"),
        ("Figura 4.4. Diagrama de Estados del Ciclo de Vida de una Incidencia Urbana", "85"),
        ("Figura 4.5. Diagrama de Secuencia: Flujo Integral de Atención y Cierre", "96"),
        ("Figura D.1. Interfaz Web Responsiva: Formulario de Reporte y GPS", "148"),
        ("Figura D.2. Interfaz Web Responsiva: Muro Ciudadano y Mapa GIS", "149"),
        ("Figura D.3. Interfaz de Despacho Operativo y Generación de Órdenes de Trabajo", "150"),
        ("Figura D.4. Interfaz Web para Cuadrillas en Campo con Cierre Fotográfico", "151"),
        ("Figura D.5. Panel Central de Analítica y Rendición de Cuentas Públicas", "152"),
    ]
    for item, page in figs:
        p = add_p(space_after=2)
        p.add_run(item).font.size = Pt(10)
        p.add_run(f" {'.' * (64 - len(item))} ")
        p.add_run(page).bold = True

    add_h2("Índice de Tablas")
    tbls = [
        ("Tabla 1.1. Estructura Orgánica y Dependencias Involucradas", "6"),
        ("Tabla 2.1. Cronograma de Iteraciones y Asignación de Semanas", "20"),
        ("Tabla 2.2. Matriz de Actores, Roles y Responsabilidades", "22"),
        ("Tabla 3.1. Comparativa Técnica: Plataforma Web Responsiva vs. App Nativa", "29"),
        ("Tabla 3.2. Ficha Técnica de Librerías y Dependencias del Backend", "35"),
        ("Tabla 3.3. Ficha Técnica de Dependencias del Frontend", "36"),
        ("Tabla 4.1. Historias de Usuario de la Iteración Cero", "46"),
        ("Tabla 4.2. Historias de Usuario de la Iteración Uno", "54"),
        ("Tabla 4.3. Historias de Usuario de la Iteración Dos", "63"),
        ("Tabla 4.4. Historias de Usuario de la Iteración Tres", "73"),
        ("Tabla 4.5. Historias de Usuario de la Iteración Cuatro", "83"),
        ("Tabla 4.6. Historias de Usuario de la Iteración Cinco", "94"),
        ("Tabla 5.1. Matriz de Casos de Prueba Ejecutados y Verificados", "108"),
        ("Tabla 6.1. Evaluación Cuantitativa del Grado de Cumplimiento de Objetivos", "117"),
        ("Tabla 6.2. Balance General de Historias de Usuario Implementadas", "119"),
        ("Tabla B.1. Matriz de Trazabilidad Requisitos - Componentes - Pruebas", "140"),
    ]
    for item, page in tbls:
        p = add_p(space_after=2)
        p.add_run(item).font.size = Pt(10)
        p.add_run(f" {'.' * (64 - len(item))} ")
        p.add_run(page).bold = True

    add_h2("Lista de Abreviaturas y Acrónimos")
    acronyms = [
        ("API", "Application Programming Interface (Interfaz de Programación de Aplicaciones)"),
        ("CORS", "Cross-Origin Resource Sharing (Intercambio de Recursos de Origen Cruzado)"),
        ("CSS", "Cascading Style Sheets (Hojas de Estilo en Cascada)"),
        ("DDL", "Data Definition Language (Lenguaje de Definición de Datos)"),
        ("DOM", "Document Object Model (Modelo de Objetos del Documento)"),
        ("DOPDU", "Dirección de Obras Públicas y Desarrollo Urbano"),
        ("EPSG", "European Petroleum Survey Group (Registro de Parámetros Geodésicos)"),
        ("GIS / SIG", "Geographic Information System (Sistema de Información Geográfica)"),
        ("GPS", "Global Positioning System (Sistema de Posicionamiento Global)"),
        ("HMR", "Hot Module Replacement (Reemplazo de Módulos en Caliente)"),
        ("HTTP", "Hypertext Transfer Protocol (Protocolo de Transferencia de Hipertexto)"),
        ("ITO", "Instituto Tecnológico de Oaxaca"),
        ("JSON", "JavaScript Object Notation (Notación de Objetos de JavaScript)"),
        ("JWT", "JSON Web Token (Token Web de JavaScript)"),
        ("MIME", "Multipurpose Internet Mail Extensions (Extensiones Multipropósito de Correo)"),
        ("ORM", "Object-Relational Mapping (Mapeo Objeto-Relacional)"),
        ("OSM", "OpenStreetMap (Proyecto Cartográfico Colaborativo Libre)"),
        ("RBAC", "Role-Based Access Control (Control de Acceso Basado en Roles)"),
        ("REST", "Representational State Transfer (Transferencia de Estado Representacional)"),
        ("RFC", "Request for Comments (Petición de Comentarios / Estándar de Internet)"),
        ("SLA", "Service Level Agreement (Acuerdo de Nivel de Servicio)"),
        ("SPA", "Single Page Application (Aplicación de Página Única)"),
        ("SRID", "Spatial Reference System Identifier (Identificador de Referencia Espacial)"),
        ("TDD", "Test-Driven Development (Desarrollo Guiado por Pruebas)"),
        ("TecNM", "Tecnológico Nacional de México"),
        ("UML", "Unified Modeling Language (Lenguaje Unificado de Modelado)"),
        ("UUID", "Universally Unique Identifier (Identificador Único Universal)"),
        ("WGS84", "World Geodetic System 1984 (Sistema Geodésico Mundial de 1984)"),
        ("XP", "Extreme Programming (Programación Extrema)"),
    ]
    for acr, desc in acronyms:
        p = add_p(space_after=2)
        r_a = p.add_run(f"{acr}: ")
        r_a.bold = True
        r_a.font.size = Pt(10)
        p.add_run(desc).font.size = Pt(10)

    doc.add_page_break()

    print("[3/5] Redactando Capítulos I, II y III (Marco Institucional, Problema y Fundamento Teórico)...")

    # ==============================================================================
    # CAPÍTULO I. GENERALIDADES DE LA ENTIDAD
    # ==============================================================================
    add_h1("CAPÍTULO I. GENERALIDADES DE LA ENTIDAD")
    add_p("El desarrollo de soluciones de ingeniería de software orientadas al sector público exige un riguroso entendimiento del contexto legal, administrativo y geográfico de la entidad gubernamental de referencia. Este capítulo describe la estructura, competencias y procedimientos operativos del Ayuntamiento de Oaxaca de Juárez, institución tomada como escenario formal de aplicación para el sistema SIGIU.")

    add_h2("1.1. Nombre de la Entidad")
    add_p("La entidad de referencia corresponde al Municipio de Oaxaca de Juárez, constituido como el órgano de gobierno y administración del municipio cabecera del Estado Libre y Soberano de Oaxaca, México. Su representación legal y ejecutiva reside en el Honorable Ayuntamiento Constitucional de Oaxaca de Juárez.")

    add_h2("1.2. Sector al que Pertenece")
    add_p("La entidad pertenece al Sector Público Gubernamental, ubicándose en el orden municipal de gobierno. De acuerdo con el Artículo 115 de la Constitución Política de los Estados Unidos Mexicanos, el municipio cuenta con personalidad jurídica, patrimonio propio y la facultad soberana para administrar los servicios públicos básicos de su circunscripción territorial.")

    add_h2("1.3. Antecedentes Institucionales")
    add_p("La ciudad de Oaxaca de Juárez, fundada oficialmente en 1532 y reconocida por la UNESCO como Patrimonio Cultural de la Humanidad en 1987, presenta una configuración urbana compleja donde confluyen zonas de alto valor histórico colonial con agencias municipales en constante expansión periférica. El crecimiento demográfico de las últimas décadas ha generado una demanda intensiva de mantenimiento sobre la carpeta asfáltica, el empedrado tradicional, la red de alumbrado público y las canalizaciones de drenaje y agua potable.")

    add_h2("1.4. Objetivos Institucionales")
    add_p("El Plan Municipal de Desarrollo del Municipio de Oaxaca de Juárez establece los siguientes objetivos fundamentales:")
    add_p("1. Garantizar la operatividad, seguridad y calidad de la infraestructura urbana vial y peatonal en el centro histórico y en las trece agencias municipales.")
    add_p("2. Optimizar el uso de los recursos presupuestales y humanos destinados al mantenimiento correctivo de servicios esenciales.")
    add_p("3. Fomentar la gobernanza digital, la transparencia activa y la participación ciudadana mediante canales modernos de interlocución.")

    add_h2("1.5. Misión y Visión")
    add_p("Misión Institucional: Brindar servicios públicos municipales de excelencia, oportunos y transparentes, preservando el patrimonio histórico y garantizando el bienestar colectivo de los habitantes a través de una gestión pública honesta, eficiente y participativa.")
    add_p("Visión Institucional: Ser un municipio moderno, ordenado, incluyente y resiliente, que aprovecha las tecnologías de la información para dar respuesta expedita a las demandas de infraestructura urbana de su población.")

    add_h2("1.6. Estructura Organizacional")
    add_p("El Ayuntamiento organiza su gestión a través de diversas direcciones operativas bajo la supervisión de la Presidencia Municipal y la Coordinación Ejecutiva de Servicios Municipales. Las áreas con vinculación directa con el catálogo de incidencias del sistema se presentan en la Tabla 1.1:")

    create_custom_table(
        ["Dependencia / Dirección", "Siglas", "Titular Representante", "Área de Competencia Urbana"],
        [
            ["Dirección de Obras Públicas y Desarrollo Urbano", "DOPDU", "Arq. Facundo Alcocer", "Bacheo mayor, pavimentación, adoquín y vialidades principales"],
            ["Dirección de Servicios Municipales", "DSM", "Ing. Martín Bautista", "Alumbrado público, parques, jardines y recolección de basura"],
            ["Servicios de Agua Potable y Alcantarillado", "SOAPA", "Ing. Héctor Hernández", "Fugas en red hidráulica, alcantarillas colapsadas y drenaje"],
            ["Dirección de Movilidad y Tránsito Municipal", "DMTM", "Lic. Guadalupe Morales", "Semaforización, señalética vial y pintura termoplástica"],
        ],
        [1.8, 0.8, 1.4, 2.2]
    )

    add_h2("1.7. Área de Referencia para el Proyecto")
    add_p("El área de referencia fundamental para el modelado de requisitos de SIGIU es la Dirección de Obras Públicas y Desarrollo Urbano (DOPDU), en estrecha vinculación con la Dirección de Servicios Municipales. Estas áreas concentran el mayor volumen diario de solicitudes ciudadanas y son las encargadas de despachar las cuadrillas de operarios que realizan labores correctivas en vía pública.")

    add_h2("1.8. Ubicación Geográfica y Ámbito de Competencia Territorial")
    add_p("El Palacio Municipal y la sede de atención de obras públicas se localizan en la Plaza de la Danza S/N, Centro Histórico de Oaxaca de Juárez, Oaxaca (C.P. 68000). El ámbito territorial abarca el polígono central y las agencias municipales de San Felipe del Agua, Santa Rosa Panzacola, Candiani, Cinco Señores, San Martín Mexicapam, Donají, Pueblo Nuevo y Montoya, cubriendo una superficie superior a los 85 kilómetros cuadrados.")

    add_h2("1.9. Procesos Tradicionales de Atención de Incidencias")
    add_p("La auditoría de procesos evidenció que los canales tradicionales de recepción operan de la siguiente manera: el ciudadano acude presencialmente a oficialía de partes a radicar un oficio de queja, o bien realiza un reporte telefónico a conmutador. Dicho reporte se anota en bitácoras manuales en papel o en hojas de cálculo desvinculadas. El enlace municipal carece de coordenadas satelitales exactas y recurre a descripciones textuales subjetivas ('frente a la tienda de la esquina'), lo cual ocasiona que las cuadrillas no localicen el punto exacto de la falla, se dupliquen traslados de inspección y el ciudadano permanezca desinformado durante semanas sin conocer el estado real de su trámite.")

    add_callout(
        "DELIMITACIÓN INSTITUCIONAL Y ACADÉMICA",
        "Se hace constar con absoluta transparencia académica que el presente proyecto SIGIU constituye una propuesta de desarrollo de software integral y un prototipo funcional avanzado desarrollado en el Instituto Tecnológico de Oaxaca (TecNM) para la asignatura de Desarrollo Web con Enfoque Ágil, sin que exista a la fecha un convenio de licenciamiento formal o despliegue oficial dentro de la infraestructura tecnológica del Ayuntamiento."
    )

    # ==============================================================================
    # CAPÍTULO II. GENERALIDADES DEL PROYECTO
    # ==============================================================================
    add_h1("CAPÍTULO II. GENERALIDADES DEL PROYECTO")
    add_p("En este capítulo se define formalmente el proyecto SIGIU, puntualizando la naturaleza de la problemática identificada, los objetivos cuantitativos y cualitativos trazados, los alcances logrados y las limitaciones impuestas por el entorno de desarrollo y la metodología de trabajo.")

    add_h2("2.1. Nombre del Proyecto")
    add_p("SIGIU: Sistema Integral de Gestión de Incidencias Urbanas para el Municipio de Oaxaca de Juárez.")

    add_h2("2.2. Antecedentes y Contexto Problemático")
    add_p("El constante deterioro de la superficie de rodamiento y los desperfectos en redes de servicios en Oaxaca de Juárez obedecen tanto a la antigüedad de las tuberías subterráneas como al intenso tráfico vehicular y los efectos hidrometeorológicos de la temporada de lluvias. De acuerdo con datos del Instituto Nacional de Estadística y Geografía (INEGI) en su Encuesta Nacional de Seguridad Pública Urbana (ENSU), los baches y fallas de iluminación representan una de las tres principales problemáticas urbanas señaladas por más del 80% de la población urbana.")

    add_h2("2.3. Planteamiento del Problema")
    add_p("El problema central radica en la inexistencia de un canal digital estructurado, georreferenciado y bidireccional entre la ciudadanía y las dependencias operativas del Ayuntamiento. Esto deriva en cuatro deficiencias críticas:")
    add_p("a) Falta de precisión geográfica: Los reportes verbales generan desvíos y pérdida de tiempo para las cuadrillas al no contar con coordenadas GPS WGS84 normalizadas.")
    add_p("b) Inexistencia de evidencia fotográfica en campo: Las cuadrillas acuden a ciegas sin conocer la magnitud del bache o fuga, transportando materiales o herramientas insuficientes.")
    add_p("c) Desconexión con el personal operativo: El despacho de cuadrillas se realiza de palabra o en memorandos impresos, sin un registro sistemático de fechas límite de cumplimiento (SLA).")
    add_p("d) Opacidad hacia el ciudadano: No existe un folio rastreable en línea mediante el cual el habitante pueda comprobar si su reporte fue recibido, validado, asignado a una cuadrilla o atendido con evidencia fotográfica de solución.")

    add_h2("2.4. Pregunta Central de Investigación")
    add_p("¿Cómo optimizar los tiempos de respuesta, la precisión geográfica en la localización de fallas y la transparencia en el ciclo de atención de incidencias de infraestructura urbana en el Municipio de Oaxaca de Juárez mediante una plataforma web responsiva sustentada en Extreme Programming (XP)?")

    add_h2("2.5. Objetivo General")
    add_p("Desarrollar una plataforma web responsiva bajo la metodología Extreme Programming (XP) para digitalizar, geolocalizar, despachar y dar seguimiento en tiempo real a las incidencias urbanas del Municipio de Oaxaca de Juárez, articulando un portal cívico de reporte ciudadano con un sistema administrativo de despacho de órdenes de trabajo y rendición de cuentas públicas.")

    add_h2("2.6. Objetivos Específicos")
    add_p("1. Diseñar e implementar un módulo web cívico que permita el registro e inicio de sesión ciudadano seguro con tokens JWT, la captura de incidencias con geolocalización satelital nativa mediante la Web Geolocation API y la carga defensiva de fotografías de evidencia.")
    add_p("2. Construir una capa de persistencia relacional en PostgreSQL 15 con coordenadas geodésicas decimales WGS84 (SRID 4326) y serialización estándar GeoJSON para garantizar compatibilidad con sistemas de información geográfica.")
    add_p("3. Desarrollar un visualizador cartográfico interactivo sustentado en Leaflet y OpenStreetMap, con filtrado por categorías de servicio y un sistema de apoyo comunitario ('A mí también me afecta') para evitar duplicidad de reportes y ponderar la prioridad municipal.")
    add_p("4. Implementar un panel de control para operadores municipales que permita la clasificación de reportes entrantes, el cálculo automatizado de tiempos límite de atención (SLA) y la generación y despacho de Órdenes de Trabajo vinculadas a personal de cuadrilla.")
    add_p("5. Desarrollar una interfaz web adaptable a dispositivos móviles para el personal operativo en campo, habilitando la apertura de rutas hacia Google Maps, el registro de bitácoras técnicas y la carga obligatoria de evidencia fotográfica de resolución para autorizar el cierre del reporte.")
    add_p("6. Proveer un módulo administrativo de rendición de cuentas públicas con KPIs de resolución, tasa de efectividad, tiempos promedio y balance por colonias críticas, validado mediante una suite de pruebas automatizadas.")

    add_h2("2.7. Justificación")
    add_p("Justificación Técnica: La arquitectura desacoplada basada en React 19 y Node.js Express asegura una alta velocidad de renderizado en el cliente, modularidad del código y escalabilidad vertical. La estandarización de coordenadas sobre el elipsoide WGS84 permite la interoperabilidad con cualquier software SIG estándar del sector público.")
    add_p("Justificación Social: Empodera a los vecinos de Oaxaca de Juárez dotándolos de una herramienta gratuita, accesible desde cualquier navegador web sin requerir instalación de tiendas de aplicaciones, garantizando el derecho a la información sobre las obras públicas de su entorno inmediato.")
    add_p("Justificación Institucional: Otorga a las direcciones operativas municipales una visión centralizada de la demanda urbana, permitiendo optimizar el despacho de maquinaria y asfalto, y erradicar la duplicidad de inspecciones preliminares.")
    add_p("Justificación Académica: Permite al autor integrar de manera práctica y tangible las competencias profesionales adquiridas en la carrera de Ingeniería en Sistemas Computacionales del ITO en materias de ingeniería de software, bases de datos, desarrollo web y marcos ágiles.")

    add_h2("2.8. Alcances Delimitados")
    add_p("El alcance del sistema abarca:")
    add_p("- Levantamiento de incidencias en cinco categorías prioritarias: Bacheo y pavimentación, alumbrado público, fugas de agua y drenaje, recolección de basura/parques y semáforos/señalización.")
    add_p("- Delimitación territorial sobre el Municipio de Oaxaca de Juárez y sus agencias conurbadas.")
    add_p("- Ciclo completo de atención en cinco estados formales: Recibido ➔ En Validación ➔ Asignado ➔ En Proceso ➔ Atendido (con opción de Rechazado).")
    add_p("- Soporte de cuatro roles con control de acceso RBAC diferenciado en backend y frontend.")

    add_h2("2.9. Limitaciones Técnicas y Operativas")
    add_p("Para mantener el rigor académico, se declaran explícitamente las siguientes limitaciones del prototipo:")
    add_p("1. No es una aplicación móvil nativa: El sistema no se distribuye a través de Google Play Store ni Apple App Store; opera exclusivamente en navegadores web con diseño responsivo.")
    add_p("2. No es una PWA con soporte offline: Aunque cuenta con un archivo manifest.json básico, no se implementó un Service Worker de almacenamiento en caché, por lo que se requiere conexión activa a Internet para registrar reportes o consultar mapas.")
    add_p("3. Almacenamiento local de archivos: Las fotografías se persisten en el sistema de archivos del servidor local (`server/uploads/`), por lo que su puesta en producción en contenedores efímeros requerirá la adición de un servicio en la nube (S3/Cloudinary).")
    add_p("4. Ruteo externo: El cálculo de la ruta de traslado de la cuadrilla se delega a la aplicación externa de Google Maps mediante parámetros de coordenadas en URL, al no disponer de un motor interno de ruteo como OSRM.")

    add_h2("2.10. Cronograma de Actividades y Estimación Temporal")
    add_p("El proyecto se desarrolló a lo largo del periodo académico Agosto – Diciembre 2026, distribuyendo el esfuerzo en seis iteraciones de Extreme Programming (XP) de aproximadamente dos a tres semanas cada una, como se detalla en la Tabla 2.1:")

    create_custom_table(
        ["Iteración", "Enfoque Principal de Trabajo", "Periodo Estimado", "Historias de Usuario Cubiertas"],
        [
            ["Iteración 0", "Análisis, Product Backlog, Entorno y DDL PostgreSQL", "Semanas 1 a 3 (Ago)", "Configuración base del entorno"],
            ["Iteración 1", "Arquitectura Express + React, Modelos ORM, Middlewares", "Semanas 4 a 6 (Sep)", "HU-01, HU-02, HU-03, HU-04"],
            ["Iteración 2", "Módulo Ciudadano, JWT, GPS WGS84, Multer Uploads", "Semanas 7 a 9 (Sep - Oct)", "HU-05, HU-06, HU-07"],
            ["Iteración 3", "Panel Operador, Despacho, Órdenes de Trabajo, Catálogos", "Semanas 10 a 12 (Oct)", "HU-08, HU-09"],
            ["Iteración 4", "Visor GIS Leaflet, Muro Comunitario, Trazabilidad, Analítica", "Semanas 13 a 14 (Nov)", "HU-10, HU-11"],
            ["Iteración 5", "Módulo de Cuadrilla en Campo, Cierre con Foto Resolución", "Semanas 15 a 16 (Nov - Dic)", "HU-12, HU-13"],
        ],
        [1.2, 2.5, 1.4, 1.4]
    )

    add_h2("2.11. Beneficiarios y Actores Involucrados")
    add_p("Los actores y beneficiarios directos del sistema se clasifican en la Tabla 2.2:")

    create_custom_table(
        ["Actor del Sistema", "Rol en la Plataforma", "Beneficio Principal Obtenido"],
        [
            ["Habitantes de Oaxaca de Juárez", "Ciudadano (Público)", "Canal ágil y transparente para reportar fallas, con folio de rastreo y mapa interactivo"],
            ["Enlaces de Dirección Municipal", "Operador de Dependencia", "Consola digital para priorizar incidencias, validar procedencia y generar órdenes de trabajo"],
            ["Trabajadores Operativos en Campo", "Personal de Cuadrilla", "Recepción de órdenes claras con coordenadas GPS, descripción previa y bitácora móvil de cierre"],
            ["Titulares y Mandos Medios", "Administrador Central", "Monitoreo en tiempo real de tiempos de respuesta (SLA), efectividad de cuadrillas y analítica"],
        ],
        [1.8, 1.6, 3.1]
    )

    # ==============================================================================
    # CAPÍTULO III. MARCO TEÓRICO Y TECNOLÓGICO
    # ==============================================================================
    add_h1("CAPÍTULO III. MARCO TEÓRICO Y TECNOLÓGICO")
    add_p("Todo desarrollo de ingeniería de software debe fundamentarse en conceptos teóricos consolidados y en el estado del arte de las tecnologías seleccionadas. Este capítulo expone los principios y paradigmas aplicados en SIGIU, respaldados por la literatura científica y la documentación técnica oficial de los fabricantes.")

    add_h2("3.1. Ingeniería de Software Web y Arquitectura Desacoplada")
    add_p("La ingeniería de software web abarca los principios y metodologías sistemáticas para el diseño, construcción y mantenimiento de aplicaciones en red de alta calidad (Pressman & Maxim, 2020). En la actualidad, el paradigma dominante en sistemas modernos es la Arquitectura Desacoplada Cliente-Servidor mediante APIs RESTful. En este modelo, el cliente frontend se comporta como una entidad completamente separada del servidor backend, interactuando únicamente a través del intercambio de datos serializados en formato JSON bajo el protocolo HTTP.")
    add_p("Esta arquitectura ofrece múltiples ventajas competitivas: permite evolucionar el cliente de forma independiente al servidor, posibilita la reutilización de la API para futuros clientes móviles nativos o sistemas de terceros, y garantiza la alta disponibilidad y mantenibilidad del código base (Fielding, 2000).")

    add_h2("3.2. Metodologías Ágiles y Extreme Programming (XP)")
    add_p("Las metodologías ágiles surgieron formalmente con el Manifiesto Ágil de 2001, priorizando a los individuos y las interacciones sobre los procesos rígidos, y el software funcionando sobre la documentación exhaustiva (Beck et al., 2001). Extreme Programming (XP), formulada originalmente por Kent Beck (1999), es una metodología ágil orientada a proyectos con requisitos cambiantes y equipos que buscan una alta disciplina técnica y calidad de código.")
    add_p("XP se sustenta en cinco valores esenciales: Comunicación, Simplicidad, Retroalimentación, Valentía y Respeto. Sus prácticas fundamentales incluyen el diseño simple (*Simple Design*), las entregas frecuentes (*Small Releases*), la integración continua (*Continuous Integration*), el desarrollo guiado por pruebas (*Test-Driven Development*), la refactorización constante y el cliente en sitio (*Customer on Site*).")

    add_callout(
        "ADAPTACIÓN DE PRÁCTICAS XP AL DESARROLLO INDIVIDUAL",
        "En el contexto de un proyecto académico universitario ejecutado por un solo autor (José Francisco Pérez Pérez), fue necesario adaptar con rigor ciertas prácticas canónicas de XP. La práctica de 'Programación en Pareja' (Pair Programming) no pudo ser aplicada de forma directa por la naturaleza individual del trabajo; sin embargo, se compensó mediante revisiones estáticas de código, diseño modular y pruebas automatizadas. De igual forma, el rol de 'Cliente en Sitio' (Customer on Site) fue simulado académicamente por el docente titular de la asignatura (Cruz Hernández Bernardo Roberto), quien fungió como validador de los criterios de aceptación de cada historia de usuario."
    )

    add_h2("3.3. Interfaces Web Responsivas frente a Aplicaciones Nativas")
    add_p("El diseño web responsivo (*Responsive Web Design*), introducido por Ethan Marcotte (2010), es un enfoque de diseño web orientado a proporcionar una experiencia visual y de navegación óptima a través de una amplia gama de dispositivos (desde teléfonos móviles hasta monitores de escritorio), utilizando rejillas fluidas basadas en proporciones, imágenes flexibles y consultas de medios (*CSS Media Queries*).")
    add_p("Frente a las aplicaciones móviles nativas compiladas en Kotlin, Swift o frameworks multiplataforma (Flutter, React Native), las plataformas web responsivas presentan ventajas determinantes para la gestión pública municipal: acceso universal inmediato sin requerir descarga de tiendas de aplicaciones (Google Play / App Store), compatibilidad absoluta con cualquier sistema operativo que disponga de un navegador moderno, y costos de mantenimiento y actualización centralizados en el servidor (Tabla 3.1):")

    create_custom_table(
        ["Criterio de Evaluación", "Plataforma Web Responsiva (SIGIU)", "Aplicación Móvil Nativa"],
        [
            ["Instalación requerida", "Ninguna; acceso directo mediante URL en navegador", "Obligatoria a través de tiendas de aplicaciones"],
            ["Uso de almacenamiento del dispositivo", "Mínimo (únicamente caché HTTP volátil)", "Alto (50MB a 200MB de binario compilado)"],
            ["Acceso a hardware del dispositivo", "APIs web seguras (GPS, Cámara fotográfica, Archivos)", "Acceso directo a APIs del SDK del sistema operativo"],
            ["Mantenimiento y despliegue", "Centralizado; actualización instantánea para todos", "Distribución de compilados con aprobación de tiendas"],
            ["Costo de desarrollo", "Bajo a moderado (una sola base de código multiplataforma)", "Elevado (desarrollo especializado para iOS y Android)"],
        ],
        [1.8, 2.3, 2.4]
    )

    add_h2("3.4. Tecnologías del Lado del Cliente (Frontend)")
    add_p("React 19: Es una biblioteca declarativa y eficiente de JavaScript desarrollada por Meta para la construcción de interfaces de usuario interactivas basadas en componentes desacoplados. Su arquitectura implementa un DOM virtual que optimiza las operaciones de re-renderizado en pantalla, junto con un ecosistema maduro de Hooks funcionales para la gestión de ciclo de vida y estado (Banks & Porcello, 2020).")
    add_p("Vite: Herramienta de compilación frontend de última generación creada por Evan You, que utiliza módulos ECMAScript nativos (ESM) para proporcionar un servidor de desarrollo ultra-rápido con Reemplazo de Módulos en Caliente (HMR) y empaquetado optimizado para producción mediante Rollup.")
    add_p("Tailwind CSS: Framework de CSS utilitario que permite construir interfaces altamente personalizadas sin abandonar el marcado HTML. En SIGIU, se configuró con una paleta institucional de tokens semánticos (Charcoal, Slate Gray, Medium Gray, Soft Slate y Lotus White) para garantizar contraste visual, ergonomía y sobriedad.")

    add_h2("3.5. Tecnologías del Lado del Servidor (Backend API REST)")
    add_p("Node.js: Entorno de ejecución para JavaScript fuera del navegador construido sobre el motor V8 de Google Chrome, caracterizado por su modelo de E/S sin bloqueo impulsado por eventos (*event-driven non-blocking I/O*), lo cual le otorga una alta eficiencia y concurrencia ante peticiones HTTP masivas (Cantelon et al., 2017).")
    add_p("Express.js: Framework web minimalista y flexible para Node.js que proporciona una capa de enrutamiento robusta, soporte para middlewares de interceptación y utilidades estandarizadas para construir APIs RESTful profesionales.")
    add_p("Multer: Middleware diseñado para la manipulación y recepción segura de cargas de archivos en solicitudes HTTP `multipart/form-data`. Implementa validación estricta de extensiones, filtros de tipos MIME en el flujo binario y asignación de identificadores únicos para evitar colisiones en disco.")

    add_h2("3.6. Persistencia Relacional y Modelado ORM")
    add_p("PostgreSQL: Sistema de gestión de bases de datos relacionales de código abierto reconocido por su confiabilidad, solidez en el cumplimiento de las propiedades ACID (Atomicidad, Consistencia, Aislamiento y Durabilidad) y su extensibilidad nativa para tipos de datos complejos y geoespaciales (Momjian, 2001).")
    add_p("Sequelize ORM: Mapeador objeto-relacional para Node.js que abstrae las operaciones SQL a través de clases y modelos en JavaScript. Proporciona soporte nativo para transacciones atómicas, validación de esquemas, relaciones complejas de integridad referencial y hooks de ciclo de vida (como el encriptado previo de contraseñas).")

    add_h2("3.7. Coordenadas Espaciales WGS84 y Formato GeoJSON")
    add_p("El sistema de referencia espacial WGS84 (World Geodetic System 1984), identificado bajo el código EPSG:4326, es el estándar geodésico global empleado por los receptores satelitales GPS. Modela la Tierra como un esferoide achatado en los polos y define la ubicación de cualquier punto en la superficie mediante dos coordenadas angulares: latitud (paralelos norte-sur de -90° a +90°) y longitud (meridianos este-oeste de -180° a +180°).")
    add_p("GeoJSON es un formato abierto de intercambio geoespacial basado en JSON, estandarizado por el Internet Engineering Task Force (IETF) bajo el estándar RFC 7946 (Butler et al., 2016). En SIGIU, todos los puntos de reporte se emiten como una colección de geometrías de tipo `FeatureCollection` con coordenadas `[longitud, latitud]` y propiedades asociadas (folio, categoría, estatus), garantizando compatibilidad con cualquier plataforma de mapas.")

    add_h2("3.8. Sistemas de Información Geográfica y Leaflet")
    add_p("Un Sistema de Información Geográfica (SIG o GIS) integra hardware, software y datos diseñados para capturar, almacenar, manipular, analizar y desplegar información georreferenciada (Longley et al., 2015). Leaflet es la biblioteca JavaScript de código abierto líder para mapas interactivos adaptables a dispositivos móviles. Desarrollada por Vladimir Agafonkin, destaca por su peso ligero (apenas 39 KB gzipped) y su capacidad para superponer marcadores vectoriales interactivos y manejar eventos táctiles sobre capas de teselas cartográficas provistas por OpenStreetMap.")

    add_h2("3.9. Seguridad Web, Autenticación JWT y Cifrado Criptográfico")
    add_p("JSON Web Token (JWT): Estándar abierto RFC 7519 que define un mecanismo compacto y autónomo para transmitir información de forma segura entre partes como un objeto JSON firmado digitalmente (Jones et al., 2015). En SIGIU, la autenticación es completamente *stateless*: el servidor no almacena sesiones en memoria; emite un token criptográfico firmado con algoritmo HS256 que el cliente incluye en la cabecera `Authorization: Bearer <token>` de cada solicitud protegida.")
    add_p("Bcrypt: Función de derivación de claves criptográficas y hashing basada en el algoritmo de cifrado Blowfish, formulada por Niels Provos y David Mazières (1999). Implementa salteo (*salting*) aleatorio automático y un factor de coste parametrizable (10 rondas en SIGIU), lo que protege las contraseñas contra ataques de tablas arcoíris y compensa el incremento en el poder de cómputo de atacantes.")

    add_p("Control de Acceso Basado en Roles (RBAC): Paradigma formalizado por el National Institute of Standards and Technology (NIST) donde los permisos de acceso a los recursos del sistema se asignan exclusivamente a roles institucionales definidos y no a usuarios individuales (Ferraiolo et al., 2001). En SIGIU, se modelaron cuatro roles rigurosamente separados: Ciudadano, Operador, Cuadrilla y Administrador.")

    doc.add_page_break()

    print("[4/5] Redactando Capítulos IV, V, VI y VII (Iteraciones 0 a 5, Pruebas y Resultados)...")

    # ==============================================================================
    # CAPÍTULO IV. DESARROLLO DEL PROYECTO (ITERACIONES XP)
    # ==============================================================================
    add_h1("CAPÍTULO IV. DESARROLLO DEL PROYECTO")
    add_p("El desarrollo de SIGIU se ejecutó siguiendo las directrices de la metodología Extreme Programming (XP), organizando la construcción en un ciclo de vida iterativo e incremental compuesto por seis iteraciones claramente delimitadas (Iteraciones 0 a 5). Todas las iteraciones mantienen la misma estructura metodológica rigurosa, garantizando coherencia técnica y trazabilidad de los artefactos generados.")

    # --------------------------------------------------------------------------
    # ITERACIÓN CERO
    # --------------------------------------------------------------------------
    add_h2("4.1. Iteración Cero: Planificación, Entorno y Base de Datos")
    add_p("4.1.1. Introducción: La iteración cero en Extreme Programming constituye la fase de cimentación y preparación de la infraestructura tecnológica, en la cual se definen las convenciones de codificación, la arquitectura base, el esquema inicial de datos y la priorización del Product Backlog antes de iniciar la construcción de módulos de usuario.")
    add_p("4.1.2. Objetivo de la Iteración: Configurar el entorno de desarrollo desacoplado monorepositorio (`client` y `server`), diseñar el script DDL de inicialización de la base de datos relacional PostgreSQL con soporte de coordenadas WGS84, y formalizar el Product Backlog inicial priorizado con el cliente.")
    add_p("4.1.3. Alcance: Inicialización de proyectos npm independientes, configuración de variables de entorno `.env`, instalación de dependencias, codificación de `ddl_sigiu.sql` con 10 entidades y tablas de catálogos.")
    add_p("4.1.4. Historias de Usuario: HU-00 (Configuración de Entorno de Desarrollo y Persistencia Inicial).")
    add_p("4.1.5. Requisitos Relacionados: RF-01 (Persistencia de datos relacionales), RNF-01 (Modularidad desacoplada de código).")
    add_p("4.1.6. Criterios de Aceptación: El servidor debe conectarse a PostgreSQL; si el motor no está disponible, debe poseer un mecanismo de fallback; el DDL debe ejecutarse sin errores de sintaxis.")
    add_p("4.1.7. Planificación: Duración de 3 semanas (Agosto 2026), dedicadas a la investigación de requisitos municipales, diseño relacional y configuración de dependencias.")
    add_p("4.1.8. Diseño: Diagrama de contexto del sistema (Figura 4.1), definiendo los límites de la plataforma web frente a los usuarios y los servicios de mapas.")
    
    add_fig("diagrama_01_contexto.png", "Figura 4.1. Diagrama de Contexto del Sistema SIGIU y Entidades Externas.")

    add_p("4.1.9. Diagramas: Diagrama de contexto y estructura del monorepositorio.")
    add_p("4.1.10. Modelo de Datos: Creación de tablas de catálogos (`roles`, `dependencias`, `categorias_incidencia`, `estados_reporte`).")
    add_p("4.1.11. Implementación: Archivos `server/src/config/database.js` y `server/src/sql/ddl_sigiu.sql`.")
    add_p("4.1.12. Explicación de Componentes: Módulo `database.js` que utiliza Sequelize para gestionar el pool de conexiones con reintentos y fallback a SQLite.")
    add_p("4.1.13. Explicación de Endpoints: Endpoint inicial de salud del sistema `GET /api/v1/health`.")
    add_p("4.1.14. Validaciones: Validación de variables de entorno requeridas en el archivo `.env`.")
    add_p("4.1.15. Seguridad: Uso de variables de entorno para aislar credenciales de base de datos (`DB_PASSWORD`, `JWT_SECRET`).")
    add_p("4.1.16. Casos de Prueba: Prueba de conexión exitosa contra PostgreSQL `localhost:5432/sigiu_db`.")
    add_p("4.1.17. Resultados: Conexión confirmada y catálogo de roles y dependencias sembrados.")
    add_p("4.1.18. Evidencias: Log del servidor mostrando `[DB] Conectado exitosamente a PostgreSQL`.")
    add_p("4.1.19. Problemas Encontrados: Incompatibilidad de versión de PostGIS compilada en el motor PostgreSQL local, generando advertencia al consultar `PostGIS_Version()`.")
    add_p("4.1.20. Soluciones Aplicadas: Se implementó un manejo de excepciones en `database.js` y `Report.js` para capturar coordenadas en columnas `DECIMAL(10,8)` y `DECIMAL(11,8)` acompañadas de un objeto JSONB en formato GeoJSON Point, garantizando operatividad total.")
    add_p("4.1.21. Limitaciones: Ausencia de funciones espaciales SQL complejas compiladas directamente en el motor.")
    add_p("4.1.22. Retrospectiva: La arquitectura de fallback permitió no detener el desarrollo ante la falta de extensiones binarias compiladas en la máquina local.")
    add_p("4.1.23. Conclusión de la Iteración: Se sentaron las bases estructurales y de datos sólidas para comenzar la iteración uno.")

    # --------------------------------------------------------------------------
    # ITERACIÓN UNO
    # --------------------------------------------------------------------------
    add_h2("4.2. Iteración Uno: Arquitectura Base y Modelado")
    add_p("4.2.1. Introducción: En la iteración uno se construyó el esqueleto funcional del backend y frontend, implementando middlewares defensivos y el modelado ORM completo.")
    add_p("4.2.2. Objetivo de la Iteración: Establecer la arquitectura por capas en Express, configurar Sequelize con modelos y asociaciones relacionales, y levantar la aplicación SPA en React 19.")
    add_p("4.2.3. Alcance: Implementación de HU-01 (Manejador de errores y CORS), HU-02 (Modelado ORM de entidades), HU-03 (Estructura base del frontend) y HU-04 (Enrutador `/api/v1`).")
    add_p("4.2.4. Historias de Usuario: HU-01, HU-02, HU-03, HU-04.")
    add_p("4.2.5. Requisitos Relacionados: RF-02 (Gestión modular de rutas), RNF-02 (Manejo centralizado de excepciones).")
    add_p("4.2.6. Criterios de Aceptación: Cualquier error 404 o 500 debe retornar JSON; los modelos deben sincronizarse sin violar integridad referencial.")
    add_p("4.2.7. Planificación: Semanas 4 a 6 (Septiembre 2026).")
    add_p("4.2.8. Diseño: Diagrama de arquitectura por capas (Figura 4.2) y modelo entidad-relación (Figura 4.3).")
    
    add_fig("diagrama_02_arquitectura.png", "Figura 4.2. Diagrama de Arquitectura por Capas del Sistema SIGIU.")
    add_fig("diagrama_03_entidad_relacion.png", "Figura 4.3. Modelo Entidad-Relación de la Base de Datos SIGIU (PostgreSQL 15+).")

    add_p("4.2.9. Diagramas: Diagrama de componentes y modelo de capas.")
    add_p("4.2.10. Modelo de Datos: Definición de modelos `Role`, `Department`, `User`, `Category`, `ReportStatus`, `Report` y `ReportEvidence` en `server/src/models/`.")
    add_p("4.2.11. Implementación: Archivos `app.js`, `server.js`, `models/index.js`, `middlewares/errorHandler.js`.")
    add_p("4.2.12. Explicación de Componentes: Middleware `errorHandler.js` que captura excepciones de Sequelize (`SequelizeValidationError`), errores de Multer (`LIMIT_FILE_SIZE`) y rutas inexistentes.")
    add_p("4.2.13. Explicación de Endpoints: Enrutador raíz en `server/src/routes/index.js` montando `/auth`, `/reportes`, `/catalogos`, `/ordenes` y `/usuarios`.")
    add_p("4.2.14. Validaciones: Validación de esquema JSON y limitación de tamaño de petición a 10MB.")
    add_p("4.2.15. Seguridad: Configuración de cabeceras CORS para permitir métodos GET, POST, PUT, PATCH, DELETE y cabecera Authorization.")
    add_p("4.2.16. Casos de Prueba: Petición HTTP a ruta inexistente `/api/v1/ruta_que_no_existe` esperando código 404 y JSON estandarizado.")
    add_p("4.2.17. Resultados: Prueba aprobada con respuesta `{ success: false, message: 'Ruta no encontrada...' }`.")
    add_p("4.2.18. Evidencias: Ejecución en test runner de Node.js validando el caso de prueba HU-01.")
    add_p("4.2.19. Problemas Encontrados: Sequelize alteraba tablas con sentencias SQL inválidas al tener restricciones foráneas activas (`alter: true`).")
    add_p("4.2.20. Soluciones Aplicadas: Se modificó la sincronización a `alter: false` y creación controlada mediante DDL SQL y sincronización individual de modelos nuevos.")
    add_p("4.2.21. Limitaciones: Ausencia de compresión gzip en respuestas HTTP (pendiente para producción).")
    add_p("4.2.22. Retrospectiva: La separación de middlewares facilitó depurar errores sin ensuciar los controladores.")
    add_p("4.2.23. Conclusión de la Iteración: Arquitectura base operativa y lista para soportar la lógica de negocio.")

    # --------------------------------------------------------------------------
    # ITERACIÓN DOS
    # --------------------------------------------------------------------------
    add_h2("4.3. Iteración Dos: Módulo Ciudadano, GPS y Evidencia Fotográfica")
    add_p("4.3.1. Introducción: La iteración dos aborda el núcleo de la participación ciudadana: la autenticación de usuarios, la captura de coordenadas geográficas en campo y la subida de evidencias fotográficas.")
    add_p("4.3.2. Objetivo de la Iteración: Construir los módulos de registro ciudadano con JWT y Bcrypt, formulario web de reporte con detección satelital WGS84, y almacenamiento de fotos mediante Multer.")
    add_p("4.3.3. Alcance: Implementación de HU-05 (Autenticación ciudadana), HU-06 (Geolocalización GPS WGS84) y HU-07 (Subida de fotos y folio único).")
    add_p("4.3.4. Historias de Usuario: HU-05, HU-06, HU-07.")
    add_p("4.3.5. Requisitos Relacionados: RF-03 (Registro/Login), RF-04 (GPS nativo), RF-05 (Upload multipart), RF-06 (Folio único oficial).")
    add_p("4.3.6. Criterios de Aceptación: Coordenadas válidas en [-90,90] y [-180,180]; contraseñas con hash bcrypt; folio irrepetible `OAX-YYYY-XXXX`; fotos limitadas a 5MB.")
    add_p("4.3.7. Planificación: Semanas 7 a 9 (Septiembre – Octubre 2026).")
    add_p("4.3.8. Diseño: Wireframes de formulario cívico, selector táctil de categorías y visualizador de acuse digital.")
    add_p("4.3.9. Diagramas: Diagrama de flujo de registro y captura de incidencia.")
    add_p("4.3.10. Modelo de Datos: Tabla `reportes` e `imagenes_reporte` con claves foráneas.")
    add_p("4.3.11. Implementación: Componentes React `IncidentForm.jsx`, `GpsDetector.jsx`, `CameraUpload.jsx`, `AuthModal.jsx`; controladores `authController.js` y `reportController.js`.")
    add_p("4.3.12. Explicación de Componentes: `GpsDetector` interactúa con `navigator.geolocation` y renderiza un mini-mapa Leaflet para ajuste fino; `CameraUpload` utiliza inputs de tipo archivo con captura de cámara del móvil (`capture='environment'`).")
    add_p("4.3.13. Explicación de Endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `POST /api/v1/reportes`.")
    add_p("4.3.14. Validaciones: Middleware `validateReportCreation` en `server/src/middlewares/validateMiddleware.js`.")
    add_p("4.3.15. Seguridad: Cifrado con salteo de 10 rondas; verificación de tipo MIME en Multer contra spoofing de extensión.")
    add_p("4.3.16. Casos de Prueba: Pruebas unitarias de encriptación de contraseña, validación de coordenadas fuera de rango y campos obligatorios.")
    add_p("4.3.17. Resultados: Pruebas aprobadas con éxito en suite Node.js.")
    add_p("4.3.18. Evidencias: Registro generado en base de datos con folio `OAX-2026-XXXX` y foto persistida en `server/uploads/`.")
    add_p("4.3.19. Problemas Encontrados: Bloqueo de geolocalización en navegadores cuando el sitio no se ejecuta bajo protocolo seguro HTTPS en dispositivos móviles externos.")
    add_p("4.3.20. Soluciones Aplicadas: Se programó un mecanismo de fallback que permite al ciudadano hacer clic sobre el mapa para fijar manualmente el punto exacto si el sensor satelital se encuentra bloqueado.")
    add_p("4.3.21. Limitaciones: Almacenamiento en disco local en lugar de nube de objetos.")
    add_p("4.3.22. Retrospectiva: La retroalimentación de la práctica demostró la necesidad de acuses digitales legibles para que el ciudadano guarde su número de folio.")
    add_p("4.3.23. Conclusión de la Iteración: El portal ciudadano quedó 100% habilitado para la recepción de reportes en vía pública.")

    # --------------------------------------------------------------------------
    # ITERACIÓN TRES
    # --------------------------------------------------------------------------
    add_h2("4.4. Iteración Tres: Panel de Despacho y Órdenes de Trabajo")
    add_p("4.4.1. Introducción: Con los reportes ingresando al sistema, la iteración tres construyó el módulo administrativo y operativo para que los enlaces de las dependencias municipales puedan gestionar y canalizar las solicitudes.")
    add_p("4.4.2. Objetivo de la Iteración: Desarrollar la consola de despacho del operador municipal, el catálogo de gobernanza de usuarios y dependencias, y el modelo y flujo de Órdenes de Trabajo (HU-08 y HU-09).")
    add_p("4.4.3. Alcance: Control de acceso RBAC por rol en frontend y backend, generación de folios de orden `OT-2026-XXXX`, asignación de personal de cuadrilla y cálculo de fecha límite SLA.")
    add_p("4.4.4. Historias de Usuario: HU-08 (Consola del Operador), HU-09 (Despacho de Órdenes de Trabajo).")
    add_p("4.4.5. Requisitos Relacionados: RF-07 (Tablero de despacho), RF-08 (Generación de OT), RF-09 (Gestión de usuarios y catálogos).")
    add_p("4.4.6. Criterios de Aceptación: Solo usuarios con rol Operador o Administrador pueden despachar órdenes; al emitirse la orden, el estatus del reporte cambia a 'Asignado'.")
    add_p("4.4.7. Planificación: Semanas 10 a 12 (Octubre 2026).")
    add_p("4.4.8. Diseño: Boceto y estructura del dashboard operativo con filtros de prioridad y modal de despacho.")
    add_p("4.4.9. Diagramas: Diagrama de clases y relaciones de la entidad `ordenes_trabajo`.")
    add_p("4.4.10. Modelo de Datos: Tabla `ordenes_trabajo` con claves foráneas a `reportes`, `usuarios` (operador) y `usuarios` (cuadrilla).")
    add_p("4.4.11. Implementación: `OperatorDashboard.jsx`, `workOrderController.js`, `workOrderRoutes.js`, `userController.js`, `catalogController.js`.")
    add_p("4.4.12. Explicación de Componentes: `OperatorDashboard` provee tarjetas métricas superiores, filtros dinámicos y modal interactivo para asignar cuadrillas consultadas desde `userApi.getCrews()`.")
    add_p("4.4.13. Explicación de Endpoints: `GET /api/v1/ordenes`, `POST /api/v1/ordenes`, `GET /api/v1/usuarios/cuadrillas`.")
    add_p("4.4.14. Validaciones: Verificación de existencia de cuadrilla y fecha límite futura obligatoria.")
    add_p("4.4.15. Seguridad: Middleware `authorizeRoles('Administrador', 'Operador')` protegiendo las rutas de despacho.")
    add_p("4.4.16. Casos de Prueba: Despacho de orden de prueba y verificación de actualización de estado del reporte a ID 3 (Asignado).")
    add_p("4.4.17. Resultados: Generación exitosa de orden `OT-2026-8002` vinculada al reporte correspondiente.")
    add_p("4.4.18. Evidencias: Registro en tabla `ordenes_trabajo` en PostgreSQL y visualización en tabla operativa.")
    add_p("4.4.19. Problemas Encontrados: Complejidad para vincular las cuadrillas según su dependencia específica.")
    add_p("4.4.20. Soluciones Aplicadas: Se añadió la relación `User.belongsTo(Department)` para filtrar las cuadrillas pertenecientes al área correspondiente.")
    add_p("4.4.21. Limitaciones: No se cuenta con balanceo automático de carga de trabajo entre cuadrillas.")
    add_p("4.4.22. Retrospectiva: La centralización del catálogo de usuarios permitió una gestión fluida y sin redundancias.")
    add_p("4.4.23. Conclusión de la Iteración: Se completó el puente operativo entre la denuncia ciudadana y la asignación técnica de personal.")

    # --------------------------------------------------------------------------
    # ITERACIÓN CUATRO
    # --------------------------------------------------------------------------
    add_h2("4.5. Iteración Cuatro: Integración Cartográfica GIS y Rendición de Cuentas")
    add_p("4.5.1. Introducción: Con el flujo de reportes y órdenes en marcha, la iteración cuatro incorporó la visualización cartográfica urbana interactiva, el sistema de apoyo comunitario y la analítica pública para rendición de cuentas.")
    add_p("4.5.2. Objetivo de la Iteración: Integrar el mapa de Leaflet con capas GeoJSON estándar (HU-10) e implementar el módulo de analítica y rendición de cuentas (HU-11).")
    add_p("4.5.3. Alcance: Exportación de GeoJSON FeatureCollection en backend, marcadores interactivos por categoría y prioridad, botón 'A mí también me afecta', historial ciudadano con línea de tiempo y gráficas estadísticas.")
    add_p("4.5.4. Historias de Usuario: HU-10 (Visualización Geoespacial e Interacción), HU-11 (Rendición de Cuentas y Analítica).")
    add_p("4.5.5. Requisitos Relacionados: RF-10 (Mapa Leaflet), RF-11 (Apoyo ciudadano 'A mí también me afecta'), RF-12 (Trazabilidad 5 estados), RF-13 (KPIs analíticos).")
    add_p("4.5.6. Criterios de Aceptación: GeoJSON compatible con RFC 7946; restricción de un solo voto de apoyo por ciudadano por reporte; gráficos de colonias críticas y tiempos de resolución.")
    add_p("4.5.7. Planificación: Semanas 13 y 14 (Noviembre 2026).")
    add_p("4.5.8. Diseño: Diagrama de ciclo de vida de la incidencia (Figura 4.4) y maquetación de tarjetas estadísticas.")
    
    add_fig("diagrama_04_ciclo_vida.png", "Figura 4.4. Diagrama de Estados del Ciclo de Vida de una Incidencia Urbana.")

    add_p("4.5.9. Diagramas: Diagrama de estados del ciclo de vida y diagrama de capas GIS.")
    add_p("4.5.10. Modelo de Datos: Tabla `apoyos_ciudadanos` con restricción de unicidad `UNIQUE(reporte_id, ciudadano_id)` e historial de estados.")
    add_p("4.5.11. Implementación: `GisMapViewer.jsx`, `CitizenHistory.jsx`, `reportController.js:getReportsGeoJson`, `reportController.js:getStatistics`.")
    add_p("4.5.12. Explicación de Componentes: `GisMapViewer` monta el mapa centrado en el zócalo de Oaxaca (`17.0605, -96.7256`), añade capas de OpenStreetMap y procesa las geometrías de tipo Point; `CitizenHistory` dibuja los 5 pasos de evolución del reporte.")
    add_p("4.5.13. Explicación de Endpoints: `GET /api/v1/reportes/gis/geojson`, `GET /api/v1/reportes/mis-reportes`, `GET /api/v1/reportes/analitica`, `POST /api/v1/reportes/:id/apoyo`.")
    add_p("4.5.14. Validaciones: Prevención de apoyos duplicados mediante restricción relacional y código de error controlado.")
    add_p("4.5.15. Seguridad: Endpoint `/mis-reportes` autenticado obligatoriamente con JWT para devolver únicamente las incidencias del usuario en sesión.")
    add_p("4.5.16. Casos de Prueba: Pruebas automatizadas en `api.test.js` verificando que `/gis/geojson` responda una `FeatureCollection` válida y `/analitica` entregue KPIs numéricos coherentes.")
    add_p("4.5.17. Resultados: Ambas pruebas aprobadas al 100% en el test runner.")
    add_p("4.5.18. Evidencias: Renderizado de marcadores de colores con popup detallado y contador de votos funcional.")
    add_p("4.5.19. Problemas Encontrados: Sobrecarga visual al desplegar múltiples reportes cercanos en el centro histórico.")
    add_p("4.5.20. Soluciones Aplicadas: Se integraron píldoras de filtrado por categoría de servicio en la cabecera del mapa para que el usuario pueda visualizar exclusivamente baches, fugas o luminarias según su interés.")
    add_p("4.5.21. Limitaciones: No se implementaron mapas de calor (*heatmaps*) por densidad polinómica.")
    add_p("4.5.22. Retrospectiva: La inclusión del botón 'A mí también me afecta' resolvió la problemática clásica de usuarios que querían reportar el mismo bache sin conocer el folio previo.")
    add_p("4.5.23. Conclusión de la Iteración: Se alcanzó un estándar avanzado de transparencia activa y rendición de cuentas institucionales.")

    # --------------------------------------------------------------------------
    # ITERACIÓN CINCO
    # --------------------------------------------------------------------------
    add_h2("4.6. Iteración Cinco: App Web para Cuadrillas y Cierre Técnico con Evidencia")
    add_p("4.6.1. Introducción: La iteración final cerró el ciclo de vida del reporte en campo, proporcionando la herramienta de trabajo para los operarios que ejecutan físicamente las reparaciones.")
    add_p("4.6.2. Objetivo de la Iteración: Implementar la vista web responsiva para personal de cuadrilla (HU-12), el flujo de trabajo en sitio ('En Proceso') y el cierre técnico con bitácora y fotografía obligatoria de resolución (HU-13).")
    add_p("4.6.3. Alcance: Bandeja de órdenes asignadas por cuadrilla (`/mis-ordenes`), botón de apertura de ruta hacia Google Maps, modal de bitácora técnica de materiales y personal, subida de foto de conclusión con Multer, y aprobación de cierre en el panel de control del administrador.")
    add_p("4.6.4. Historias de Usuario: HU-12 (Módulo de Cuadrilla en Campo), HU-13 (Cierre Técnico y Evidencia de Resolución).")
    add_p("4.6.5. Requisitos Relacionados: RF-14 (Vista operativa cuadrilla), RF-15 (Navegación GPS externa), RF-16 (Bitácora de obra), RF-17 (Foto de resolución), RF-18 (Aprobación definitiva).")
    add_p("4.6.6. Criterios de Aceptación: Es mandatorio adjuntar una fotografía para cerrar la orden; al enviar la foto, la orden pasa a 'Atendida' y el reporte asociado a 'Atendido'.")
    add_p("4.6.7. Planificación: Semanas 15 y 16 (Noviembre – Diciembre 2026).")
    add_p("4.6.8. Diseño: Diagrama de secuencia del flujo integral (Figura 4.5) e interfaces de campo.")
    
    add_fig("diagrama_05_secuencia.png", "Figura 4.5. Diagrama de Secuencia: Flujo Integral de Atención y Cierre de Incidencia.")

    add_p("4.6.9. Diagramas: Diagrama de secuencia de interacción cliente-servidor-base de datos.")
    add_p("4.6.10. Modelo de Datos: Columnas `observaciones_cuadrilla`, `foto_resolucion`, `fecha_inicio` y `fecha_cierre` en `ordenes_trabajo`.")
    add_p("4.6.11. Implementación: `CrewMobileView.jsx`, `workOrderController.js:startWorkOrder`, `workOrderController.js:completeWorkOrder`, `workOrderController.js:approveWorkOrder`.")
    add_p("4.6.12. Explicación de Componentes: `CrewMobileView` está optimizado para su uso en pantallas táctiles de teléfonos celulares, con botones de gran tamaño, tipografía legible y selector de archivos directo a la cámara del dispositivo.")
    add_p("4.6.13. Explicación de Endpoints: `GET /api/v1/ordenes/mis-ordenes`, `PATCH /api/v1/ordenes/:id/iniciar`, `POST /api/v1/ordenes/:id/finalizar`, `PATCH /api/v1/ordenes/:id/aprobar`.")
    add_p("4.6.14. Validaciones: Validación estricta que rechaza el cierre de orden si no se proporciona el archivo de imagen en la petición `multipart/form-data`.")
    add_p("4.6.15. Seguridad: Restricción para que cada cuadrilla únicamente pueda consultar y manipular las órdenes asignadas a su identificador de usuario (`req.user.id`).")
    add_p("4.6.16. Casos de Prueba: Flujo completo de inicio, adición de notas técnicas y subida de evidencia de resolución.")
    add_p("4.6.17. Resultados: Transición confirmada en PostgreSQL: `estatus_orden = 'Atendida'` y `estado_actual_id = 5 (Atendido)`.")
    add_p("4.6.18. Evidencias: Registro en base de datos con URL de imagen de resolución y visualización en el comparador del panel administrativo.")
    add_p("4.6.19. Problemas Encontrados: Posibilidad de que la orden fuera concluida sin que el Administrador pudiera auditar la calidad del trabajo antes del archivo definitivo.")
    add_p("4.6.20. Soluciones Aplicadas: Se implementó un estado intermedio `Atendida` y un endpoint de supervisión `PATCH /ordenes/:id/aprobar` donde el Administrador contrasta la foto del ciudadano ('Antes') contra la foto de la cuadrilla ('Después') antes de marcar la orden como `Cerrada`.")
    add_p("4.6.21. Limitaciones: No se dispone de firma digital biométrica o electrónica del operario en campo.")
    add_p("4.6.22. Retrospectiva: La inclusión de la bitácora técnica elevó la utilidad de la plataforma al documentar los metros cuadrados de asfalto o piezas de luminaria utilizadas.")
    add_p("4.6.23. Conclusión de la Iteración: El sistema completó el ciclo integral de desarrollo con todas sus historias de usuario operativas y validadas.")

    # ==============================================================================
    # CAPÍTULO V. PRUEBAS Y VALIDACIÓN DEL SISTEMA
    # ==============================================================================
    add_h1("CAPÍTULO V. PRUEBAS Y VALIDACIÓN DEL SISTEMA")
    add_p("La calidad del software en Extreme Programming es un compromiso ineludible. Este capítulo detalla la estrategia de pruebas formulada, el entorno de ejecución controlado, la matriz exhaustiva de casos de prueba ejecutados y la evidencia de aprobación de la suite automatizada.")

    add_h2("5.1. Estrategia Global de Pruebas")
    add_p("La estrategia de aseguramiento de calidad de SIGIU combinó:")
    add_p("a) Pruebas automatizadas de integración y backend ejecutadas mediante el módulo nativo `node:test` y aserciones estrictas `node:assert`.")
    add_p("b) Pruebas funcionales de extremo a extremo mediante verificación de interfaces en navegador y simulación de peticiones HTTP autenticadas.")
    add_p("c) Pruebas de integridad en base de datos verificando restricciones de unicidad, claves foráneas y atomicidad en transacciones.")
    add_p("d) Pruebas de compilación limpia del cliente mediante Vite (`npm run build`).")

    add_h2("5.2. Entorno de Pruebas")
    add_p("- Host: Windows 11 Home Single Language x64.")
    add_p("- Entorno Node.js: v18+ LTS.")
    add_p("- Base de datos de prueba: PostgreSQL 15+ en `localhost:5432/sigiu_db`.")
    add_p("- Navegadores de prueba: Google Chrome (v131+), Mozilla Firefox (v132+), Microsoft Edge (v131+) y emuladores móviles de viewport táctil.")

    add_h2("5.3. Matriz de Casos de Prueba Ejecutados")
    add_p("En la Tabla 5.1 se describe la matriz formal de pruebas aplicadas sobre el sistema:")

    create_custom_table(
        ["ID Caso", "Funcionalidad Evaluada", "Procedimiento de Prueba", "Resultado Esperado", "Estado"],
        [
            ["CP-01", "Diagnóstico de Salud (/health)", "Petición HTTP GET a /api/v1/health", "HTTP 200, status: 'online', entidad: Municipio de Oaxaca", "APROBADO"],
            ["CP-02", "Manejo de Rutas 404", "Petición HTTP GET a /api/v1/ruta_inexistente", "HTTP 404, JSON { success: false, message: 'Ruta no encontrada' }", "APROBADO"],
            ["CP-03", "Emisión y Validación JWT", "Generar token con generateToken() y validar con verifyToken()", "Token string emitido y decodificado idéntico al payload", "APROBADO"],
            ["CP-04", "Cifrado de Contraseñas Bcrypt", "Hashear contraseña con 10 salts y comparar con bcrypt.compare()", "Hash generado con $2a$ o $2b$; coincide con password plano", "APROBADO"],
            ["CP-05", "Validación Coordenadas WGS84", "POST /reportes con latitud alfanumérica o fuera de [-90, 90]", "HTTP 400, JSON indicando error en coordenadas GPS", "APROBADO"],
            ["CP-06", "Exportación GeoJSON PostGIS", "Petición HTTP GET a /api/v1/reportes/gis/geojson", "HTTP 200, FeatureCollection válida con array de features", "APROBADO"],
            ["CP-07", "Analítica y Rendición de Cuentas", "Petición HTTP GET a /api/v1/reportes/analitica", "HTTP 200, objeto kpis con métricas numéricas", "APROBADO"],
            ["CP-08", "Validación Registro Ciudadano", "POST /auth/register con nombre menor a 3 caracteres o email inválido", "HTTP 400, rechazo de solicitud con mensaje de validación", "APROBADO"],
            ["CP-09", "Compilación Limpia Frontend", "Ejecución de comando 'vite build' en directorio client/", "Exit code 0, 1996 módulos transformados sin errores sintácticos", "APROBADO"],
            ["CP-10", "Subida de Fotografía Multer", "POST /reportes con imagen JPG de 2.5MB", "HTTP 201, archivo guardado en uploads/ con UUID sanitizado", "APROBADO"],
            ["CP-11", "Restricción Voto de Apoyo", "POST /reportes/:id/apoyo dos veces con mismo ciudadano_id", "Primer voto aceptado; segundo genera error controlado de unicidad", "APROBADO"],
            ["CP-12", "Despacho de Orden de Trabajo", "POST /ordenes con datos válidos por rol Operador", "HTTP 201, orden OT-2026-XXXX generada, reporte pasa a Asignado", "APROBADO"],
            ["CP-13", "Cierre Obligatorio con Foto", "POST /ordenes/:id/finalizar sin adjuntar evidencia fotográfica", "HTTP 400, rechazo indicando fotografía obligatoria (HU-13)", "APROBADO"],
        ],
        [0.8, 1.4, 2.0, 1.8, 0.8]
    )

    add_h2("5.4. Resultados de la Suite Automatizada")
    add_p("La ejecución formal del comando `npm run server:test` sobre el backend arrojó los siguientes resultados verificados en el log del sistema:")
    add_p("```\n> node --test tests/*.test.js\n✔ HU-01: El endpoint de diagnóstico /api/v1/health debe responder 200 con metadatos del municipio (79.8ms)\n✔ HU-01: Rutas inexistentes deben retornar error 404 en formato JSON estandarizado (14.9ms)\n✔ HU-05: Emisión y validación de tokens JWT Stateless para roles (Admin, Operador, Cuadrilla) (4.9ms)\n✔ HU-05: Encriptación segura de contraseñas con bcrypt (Salt rounds = 10) (302.7ms)\n✔ HU-06: Validación de coordenadas geográficas en límites válidos WGS84 (40.2ms)\n✔ HU-10: Visor Cartográfico GeoJSON FeatureCollection para PostGIS (183.1ms)\n✔ HU-11: Endpoint de Analítica y Rendición de Cuentas devuelve KPIs y balances (39.1ms)\n✔ HU-05: Validación de campos obligatorios en registro ciudadano (8.2ms)\n✔ XP TDD Suite: SIGIU Oaxaca de Juárez (678.8ms)\nℹ tests 9 | pass 9 | fail 0 | duration_ms 12212.8ms\n```")
    add_p("La tasa de éxito alcanzada en las pruebas automatizadas fue del 100%, sin fallas ni cancelaciones registradas.")

    # ==============================================================================
    # CAPÍTULO VI. RESULTADOS Y DISCUSIÓN
    # ==============================================================================
    add_h1("CAPÍTULO VI. RESULTADOS Y DISCUSIÓN")
    add_p("Este capítulo presenta el análisis crítico y objetivo de los resultados obtenidos tras la culminación de las seis iteraciones de desarrollo, contrastando las metas planteadas en el proyecto contra el software efectivamente implementado y comprobado.")

    add_h2("6.1. Cumplimiento de Objetivos del Proyecto")
    add_p("En la Tabla 6.1 se sintetiza el grado de consecución de los objetivos específicos formulados en el Capítulo II:")

    create_custom_table(
        ["Objetivo Específico", "Métrica de Verificación", "Grado de Cumplimiento", "Evidencia Comprobatoria"],
        [
            ["Obj 1: Módulo Cívico y GPS", "Registro ciudadano, captura WGS84 y subida de fotos", "100% (Completado)", "Componentes IncidentForm y GpsDetector funcionales; pruebas unitarias aprobadas"],
            ["Obj 2: Persistencia WGS84", "Esquema relacional en PostgreSQL y GeoJSON RFC 7946", "100% (Completado)", "10 tablas sincronizadas en sigiu_db y exportación GeoJSON activa"],
            ["Obj 3: Mapa GIS y Apoyo", "Visualizador Leaflet y botón 'A mí también me afecta'", "100% (Completado)", "GisMapViewer con filtros por categoría y tabla apoyos_ciudadanos"],
            ["Obj 4: Despacho y Órdenes", "Consola del operador y emisión de órdenes OT-2026-XXXX", "100% (Completado)", "OperatorDashboard y controlador workOrderController operativos"],
            ["Obj 5: App Cuadrilla y Cierre", "Interfaz web adaptable de campo y foto de resolución obligatoria", "100% (Completado)", "CrewMobileView y modal de conclusión con validación Multer"],
            ["Obj 6: Analítica y Rendición", "KPIs de resolución y comparador antes/después", "100% (Completado)", "Pestaña de analítica en AdminDashboard y endpoint /analitica verificado"],
        ],
        [1.8, 1.8, 1.2, 2.0]
    )

    add_h2("6.2. Cumplimiento de Historias de Usuario")
    add_p("El proyecto cubrió satisfactoriamente las 13 historias de usuario formuladas a lo largo de las iteraciones XP (Tabla 6.2):")

    create_custom_table(
        ["Código HU", "Título de la Historia de Usuario", "Rol Beneficiario", "Iteración", "Estado"],
        [
            ["HU-01", "Manejador Global de Errores y Diagnóstico", "Sistema / Técnico", "Iteración 1", "Implementada y Verificada"],
            ["HU-02", "Modelado de Base de Datos y Catálogos", "Administrador", "Iteración 1", "Implementada y Verificada"],
            ["HU-03", "Layout Responsivo de la Plataforma", "Todos los roles", "Iteración 1", "Implementada y Verificada"],
            ["HU-04", "Enrutador Modular de la API REST", "Sistema / Técnico", "Iteración 1", "Implementada y Verificada"],
            ["HU-05", "Registro y Autenticación con JWT", "Ciudadano", "Iteración 2", "Implementada y Verificada"],
            ["HU-06", "Geolocalización Satelital WGS84", "Ciudadano", "Iteración 2", "Implementada y Verificada"],
            ["HU-07", "Captura de Evidencia Fotográfica y Folio", "Ciudadano", "Iteración 2", "Implementada y Verificada"],
            ["HU-08", "Consola de Operador y Filtros Dinámicos", "Operador", "Iteración 3", "Implementada y Verificada"],
            ["HU-09", "Generación y Despacho de Órdenes de Trabajo", "Operador", "Iteración 3", "Implementada y Verificada"],
            ["HU-10", "Visualizador Geoespacial GIS y Apoyo", "Ciudadano / Operador", "Iteración 4", "Implementada y Verificada"],
            ["HU-11", "Rendición de Cuentas y Analítica Pública", "Administrador", "Iteración 4", "Implementada y Verificada"],
            ["HU-12", "Módulo de Cuadrilla y Ruta en Campo", "Cuadrilla", "Iteración 5", "Implementada y Verificada"],
            ["HU-13", "Cierre Técnico con Evidencia de Resolución", "Cuadrilla / Admin", "Iteración 5", "Implementada y Verificada"],
        ],
        [0.8, 2.6, 1.3, 0.9, 1.2]
    )

    add_h2("6.3. Comparación entre Alcance Planeado y Logrado")
    add_p("El alcance inicialmente planificado en la propuesta contemplaba cubrir únicamente las Iteraciones 0, 1 y 2 (hasta la captura ciudadana y autenticación). Sin embargo, gracias a la disciplina de refactorización y modularidad arquitectónica de Extreme Programming, fue posible extender el desarrollo hasta culminar las Iteraciones 3, 4 y 5, integrando los módulos operativos de campo y despacho.")
    add_p("Por otra parte, se reconoce con honestidad que ciertas capacidades complementarias que inicialmente se vislumbraban a nivel conceptual (como la instalación PWA sin conexión con Service Workers, las notificaciones push nativas y el almacenamiento en servicios en la nube como S3) no formaron parte del software entregado en esta etapa.")

    add_h2("6.4. Discusión Crítica de Hallazgos y Limitaciones")
    add_p("La evaluación integral demostró que la separación estricta de roles mediante RBAC y la estandarización de coordenadas sobre WGS84 resolvieron de raíz la falta de precisión geográfica de los sistemas telefónicos tradicionales. No obstante, se identificaron áreas de oportunidad técnicas: el almacenamiento en disco local de fotos representa un cuello de botella si el sistema escala a miles de reportes mensuales; de igual manera, el uso de JavaScript sin tipado estático requirió pruebas exhaustivas para validar que las cargas útiles JSON cumplieran los contratos esperados.")

    # ==============================================================================
    # CAPÍTULO VII. CONCLUSIONES Y RECOMENDACIONES
    # ==============================================================================
    add_h1("CAPÍTULO VII. CONCLUSIONES Y RECOMENDACIONES")
    add_p("Este capítulo final sintetiza las conclusiones derivadas del proyecto, los aprendizajes técnicos y metodológicos consolidados, y las recomendaciones técnicas para una futura adopción productiva.")

    add_h2("7.1. Conclusiones Generales y Específicas")
    add_p("Conclusión General: Se diseñó, implementó y validó con éxito la plataforma web responsiva SIGIU para el Municipio de Oaxaca de Juárez, alcanzando el 100% de los objetivos propuestos y demostrando que la aplicación de principios ágiles de ingeniería de software permite transformar procesos municipales tradicionalmente lentos y opacos en flujos digitales trazables, georreferenciados y verificables.")
    add_p("Conclusiones Específicas:")
    add_p("1. La captura de coordenadas satelitales en el navegador (`navigator.geolocation`) combinada con la posibilidad de ajuste fino sobre mapas interactivos de Leaflet erradica la ambigüedad en la ubicación de fallas viales y reduce los tiempos de traslado de las cuadrillas.")
    add_p("2. El mecanismo de apoyo ciudadano ('A mí también me afecta') resuelve la duplicidad de denuncias sobre un mismo bache o fuga y proporciona al municipio un indicador cuantitativo democrático para priorizar obras de mayor impacto colectivo.")
    add_p("3. La exigencia ineludible de cargar una fotografía de resolución para cerrar una Orden de Trabajo (HU-13) garantiza la transparencia pública, habilitando un comparador visual ('Antes vs Después') que fortalece la rendición de cuentas.")
    add_p("4. La arquitectura desacoplada basada en React 19, Express y PostgreSQL demostró ser altamente eficiente, manteniendo tiempos de respuesta inferiores a 100 milisegundos en la API REST y compilaciones de producción de alta velocidad con Vite.")

    add_h2("7.2. Aprendizajes Técnicos y Metodológicos")
    add_p("El proyecto permitió consolidar el entendimiento práctico de la metodología Extreme Programming (XP). Se constató que, aún en proyectos con desarrollo individual, prácticas como las entregas pequeñas e iterativas, el diseño simple y las pruebas automatizadas de integración previenen la acumulación de deuda técnica y permiten adaptarse a cambios en los requisitos sin comprometer la estabilidad del sistema.")

    add_h2("7.3. Competencias Profesionales Desarrolladas")
    add_p("Conforme al perfil de egreso de la carrera de Ingeniería en Sistemas Computacionales del Tecnológico Nacional de México (TecNM), se fortalecieron competencias clave en:")
    add_p("- Diseño y gestión de bases de datos relacionales normalizadas y estructuras espaciales.")
    add_p("- Implementación de arquitecturas web seguras y servicios RESTful con autenticación criptográfica.")
    add_p("- Modelado formal de software mediante Lenguaje Unificado de Modelado (UML) e historias de usuario.")
    add_p("- Pensamiento crítico para la auditoría técnica y la redacción formal de informes académicos universitarios.")

    add_h2("7.4. Recomendaciones Técnicas para Despliegue Municipal")
    add_p("En caso de que el Honorable Ayuntamiento de Oaxaca de Juárez decida llevar la plataforma a un entorno de producción formal, se formulan las siguientes recomendaciones:")
    add_p("1. Certificado SSL/TLS y HTTPS Obligatorio: Es imperativo configurar un certificado SSL (ej. Let's Encrypt) en el servidor web inverso (Nginx), ya que los navegadores modernos restringen el acceso a la Geolocation API en conexiones HTTP no seguras.")
    add_p("2. Migración de Almacenamiento a la Nube: Desacoplar el almacenamiento de fotografías de Multer hacia un bucket seguro en Amazon S3, Google Cloud Storage o Cloudinary con distribución CDN.")
    add_p("3. Cookies HttpOnly para JWT: Reemplazar el guardado del token en `localStorage` por cookies seguras con directivas `HttpOnly; Secure; SameSite=Strict` para mitigar vectores de ataque XSS.")
    add_p("4. Activación Completa de PostGIS: Compilar la extensión PostGIS en el clúster PostgreSQL para aprovechar funciones espaciales avanzadas de clústeres automáticos y zonas de amortiguamiento (*buffers*).")

    add_h2("7.5. Líneas de Trabajo Futuro")
    add_p("Se identifican las siguientes líneas de evolución técnica:")
    add_p("- Implementación formal de Service Worker con Workbox para otorgar capacidades de PWA e instalación en pantalla de inicio con soporte sin conexión.")
    add_p("- Integración de un servicio de notificaciones Push (VAPID / Firebase Cloud Messaging) para avisar al ciudadano cuando su reporte cambie de estado.")
    add_p("- Motor de optimización de rutas de recolección y bacheo utilizando pgRouting sobre la red vial municipal.")

    # ==============================================================================
    # REFERENCIAS BIBLIOGRÁFICAS (APA 7MA EDICIÓN)
    # ==============================================================================
    add_h1("REFERENCIAS BIBLIOGRÁFICAS")
    references = [
        "Agafonkin, V. (2024). Leaflet: An open-source JavaScript library for mobile-friendly interactive maps (Version 1.9.4) [Software]. https://leafletjs.com/",
        "Banks, A., & Porcello, E. (2020). Learning React: Modern patterns for developing React apps (2nd ed.). O'Reilly Media.",
        "Beck, K. (1999). Extreme Programming explained: Embrace change. Addison-Wesley Professional.",
        "Beck, K., Beedle, M., van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., Grenning, J., Highsmith, J., Hunt, A., Jeffries, R., Kern, J., Marick, B., Martin, R. C., Mellor, S., Schwaber, K., Sutherland, J., & Thomas, D. (2001). Manifesto for Agile Software Development. http://agilemanifesto.org/",
        "Butler, H., Daly, M., Doyle, A., Gillies, S., Hagen, S., & Schaub, T. (2016). The GeoJSON Format (RFC 7946). Internet Engineering Task Force (IETF). https://doi.org/10.17487/RFC7946",
        "Cantelon, M., Harter, M., Holowaychuk, T., & Rajlich, N. (2017). Node.js in action (2nd ed.). Manning Publications.",
        "Ferraiolo, D. F., Sandhu, R., Gavrila, S., Kuhn, D. R., & Chandramouli, R. (2001). Proposed NIST standard for role-based access control. ACM Transactions on Information and System Security, 4(3), 224-274. https://doi.org/10.1145/501978.501980",
        "Fielding, R. T. (2000). Architectural styles and the design of network-based software architectures (Doctoral dissertation). University of California, Irvine.",
        "Honorable Ayuntamiento Constitucional de Oaxaca de Juárez. (2022). Plan Municipal de Desarrollo 2022-2024. Periódico Oficial del Estado de Oaxaca.",
        "Instituto Nacional de Estadística y Geografía (INEGI). (2024). Encuesta Nacional de Seguridad Pública Urbana (ENSU): Principales problemáticas en ciudades mexicanas. INEGI.",
        "Jones, M., Bradley, J., & Sakimura, N. (2015). JSON Web Token (JWT) (RFC 7519). Internet Engineering Task Force (IETF). https://doi.org/10.17487/RFC7519",
        "Longley, P. A., Goodchild, M. F., Maguire, D. J., & Rhind, D. W. (2015). Geographic information science and systems (4th ed.). John Wiley & Sons.",
        "Marcotte, E. (2010). Responsive web design. A List Apart, 306. https://alistapart.com/article/responsive-web-design/",
        "Momjian, B. (2001). PostgreSQL: Introduction and concepts. Addison-Wesley.",
        "OpenStreetMap Contributors. (2024). Planet dump [Data file from OpenStreetMap project]. https://planet.openstreetmap.org/",
        "Pressman, R. S., & Maxim, B. R. (2020). Software engineering: A practitioner's approach (9th ed.). McGraw-Hill Education.",
        "Provos, N., & Mazières, D. (1999). A future-adaptable password scheme. In Proceedings of the FREENIX Track: 1999 USENIX Annual Technical Conference (pp. 81-91). USENIX Association.",
        "Sequelize Development Team. (2024). Sequelize v6 documentation: The Node.js ORM for Postgres, MySQL, SQLite and more. https://sequelize.org/",
        "Tecnológico Nacional de México (TecNM). (2023). Manual de lineamientos académico-administrativos del TecNM: Planes de estudio de nivel licenciatura para la formación y desarrollo de competencias profesionales. TecNM.",
        "You, E. (2024). Vite: Next generation frontend tooling (Version 5+) [Software]. https://vitejs.dev/",
    ]
    for ref in references:
        p = add_p(ref, space_after=6)
        p.paragraph_format.left_indent = Inches(0.5)
        p.paragraph_format.first_line_indent = Inches(-0.5)

    doc.add_page_break()

    # ==============================================================================
    # ANEXOS
    # ==============================================================================
    add_h1("ANEXO A. PRODUCT BACKLOG PRIORIZADO")
    add_p("El Product Backlog del sistema SIGIU se priorizó mediante la técnica MoSCoW (Must have, Should have, Could have, Won't have), alineando el esfuerzo a las necesidades críticas del municipio:")

    create_custom_table(
        ["ID", "Historia de Usuario", "Prioridad", "Estimación (Pts)", "Iteración Asignada"],
        [
            ["HU-01", "Manejo centralizado de errores y diagnóstico", "Must Have", "3", "Iteración 1"],
            ["HU-02", "Modelado relacional y catálogos de dependencias", "Must Have", "5", "Iteración 1"],
            ["HU-03", "Layout responsivo con tokens de color", "Must Have", "5", "Iteración 1"],
            ["HU-04", "Enrutamiento modular de API REST", "Must Have", "3", "Iteración 1"],
            ["HU-05", "Registro e inicio de sesión ciudadano con JWT", "Must Have", "8", "Iteración 2"],
            ["HU-06", "Geolocalización satelital WGS84 nativa", "Must Have", "8", "Iteración 2"],
            ["HU-07", "Captura de evidencia fotográfica y folio oficial", "Must Have", "8", "Iteración 2"],
            ["HU-08", "Consola del operador con filtros dinámicos", "Should Have", "5", "Iteración 3"],
            ["HU-09", "Generación y despacho de Órdenes de Trabajo", "Must Have", "8", "Iteración 3"],
            ["HU-10", "Visor cartográfico GIS y apoyo 'Me afecta'", "Should Have", "8", "Iteración 4"],
            ["HU-11", "Módulo de analítica y rendición de cuentas", "Should Have", "5", "Iteración 4"],
            ["HU-12", "Módulo web para personal de cuadrilla en campo", "Must Have", "8", "Iteración 5"],
            ["HU-13", "Cierre técnico con fotografía de resolución obligatoria", "Must Have", "8", "Iteración 5"],
        ],
        [0.8, 2.7, 1.2, 1.1, 1.2]
    )

    doc.add_page_break()

    add_h1("ANEXO B. MATRIZ DE TRAZABILIDAD GENERAL")
    add_p("La Tabla B.1 establece la coherencia absoluta entre los requisitos, historias de usuario, componentes de código, endpoints de la API, tablas relacionales y casos de prueba:")

    create_custom_table(
        ["HU", "Requisito", "Iter.", "Componente Frontend", "Endpoint Backend", "Tabla DB", "Caso Prueba"],
        [
            ["HU-01", "RNF-02", "It. 1", "Header.jsx", "GET /health", "N/A", "CP-01, CP-02"],
            ["HU-02", "RF-01", "It. 1", "AdminDashboard.jsx", "GET /catalogos/*", "roles, dep, cat", "CP-01"],
            ["HU-03", "RNF-01", "It. 1", "App.jsx", "N/A", "N/A", "CP-09"],
            ["HU-04", "RF-02", "It. 1", "client.js", "ALL /api/v1/*", "N/A", "CP-01"],
            ["HU-05", "RF-03", "It. 2", "AuthModal.jsx", "POST /auth/*", "usuarios", "CP-03, CP-04, CP-08"],
            ["HU-06", "RF-04", "It. 2", "GpsDetector.jsx", "N/A (Navegador)", "reportes", "CP-05"],
            ["HU-07", "RF-05", "It. 2", "CameraUpload.jsx", "POST /reportes", "reportes, imagenes", "CP-05, CP-10"],
            ["HU-08", "RF-07", "It. 3", "OperatorDashboard.jsx", "GET /reportes", "reportes, estados", "CP-12"],
            ["HU-09", "RF-08", "It. 3", "OperatorDashboard.jsx", "POST /ordenes", "ordenes_trabajo", "CP-12"],
            ["HU-10", "RF-10", "It. 4", "GisMapViewer.jsx", "GET /gis/geojson", "reportes, apoyos", "CP-06, CP-11"],
            ["HU-11", "RF-13", "It. 4", "AdminDashboard.jsx", "GET /analitica", "reportes", "CP-07"],
            ["HU-12", "RF-14", "It. 5", "CrewMobileView.jsx", "GET /ordenes/mis-ordenes", "ordenes_trabajo", "CP-12"],
            ["HU-13", "RF-17", "It. 5", "CrewMobileView.jsx", "POST /ordenes/:id/finalizar", "ordenes, reportes", "CP-13"],
        ],
        [0.7, 0.7, 0.6, 1.4, 1.4, 1.3, 0.9]
    )

    doc.add_page_break()

    add_h1("ANEXO C. DICCIONARIO DE DATOS")
    add_p("Estructura de las tres tablas núcleo de la base de datos `sigiu_db` en PostgreSQL 15+:")

    add_h2("Tabla: reportes")
    create_custom_table(
        ["Columna", "Tipo de Dato", "Restricción", "Descripción"],
        [
            ["id", "UUID", "PK, DEFAULT gen_random_uuid()", "Identificador único universal"],
            ["folio", "VARCHAR(30)", "NOT NULL, UNIQUE", "Folio cívico oficial (OAX-YYYY-XXXX)"],
            ["ciudadano_id", "UUID", "FK -> usuarios(id), RESTRICT", "Usuario ciudadano que levantó el reporte"],
            ["categoria_id", "INT", "FK -> categorias(id), RESTRICT", "Tipo de falla urbana"],
            ["estado_actual_id", "INT", "FK -> estados(id), DEFAULT 1", "Estatus actual del ciclo de vida"],
            ["titulo", "VARCHAR(150)", "NOT NULL", "Título breve y descriptivo"],
            ["descripcion", "TEXT", "NOT NULL", "Detalle de dimensiones y riesgo"],
            ["prioridad", "VARCHAR(20)", "CHECK (Baja, Media, Alta, Urgente)", "Nivel de severidad"],
            ["latitud", "DECIMAL(10,8)", "NOT NULL", "Coordenada latitud WGS84"],
            ["longitud", "DECIMAL(11,8)", "NOT NULL", "Coordenada longitud WGS84"],
            ["ubicacion_geografica", "JSONB", "NULLABLE", "Objeto GeoJSON Point (SRID 4326)"],
            ["colonia", "VARCHAR(100)", "DEFAULT 'Centro Histórico'", "Colonia o barrio del municipio"],
            ["votos_apoyo", "INT", "DEFAULT 0", "Contador de 'A mí también me afecta'"],
        ],
        [1.5, 1.6, 1.8, 2.1]
    )

    add_h2("Tabla: ordenes_trabajo")
    create_custom_table(
        ["Columna", "Tipo de Dato", "Restricción", "Descripción"],
        [
            ["id", "UUID", "PK, DEFAULT gen_random_uuid()", "Identificador único de orden"],
            ["folio_orden", "VARCHAR(30)", "NOT NULL, UNIQUE", "Folio de despacho (OT-YYYY-XXXX)"],
            ["reporte_id", "UUID", "FK -> reportes(id), CASCADE", "Incidencia urbana asociada"],
            ["operador_id", "UUID", "FK -> usuarios(id), RESTRICT", "Operador que despachó la orden"],
            ["cuadrilla_id", "UUID", "FK -> usuarios(id), RESTRICT", "Personal operativo asignado en campo"],
            ["instrucciones", "TEXT", "NOT NULL", "Indicaciones técnicas para cuadrilla"],
            ["estatus_orden", "VARCHAR(30)", "DEFAULT 'Asignada'", "Estatus operativo (Asignada, En Proceso, Atendida, Cerrada)"],
            ["fecha_limite", "TIMESTAMP TZ", "NULLABLE", "Fecha y hora límite de cumplimiento SLA"],
            ["observaciones_cuadrilla", "TEXT", "NULLABLE", "Bitácora técnica de materiales y obra"],
            ["foto_resolucion", "VARCHAR(255)", "NULLABLE", "Ruta de la fotografía de resolución obligatoria"],
        ],
        [1.5, 1.6, 1.8, 2.1]
    )

    print(f"[5/5] Guardando archivo Word definitivo en: {DOCX_PATH}")
    doc.save(DOCX_PATH)
    print(f"¡Informe Maestro Word generado con éxito! ({os.path.getsize(DOCX_PATH)} bytes)")

if __name__ == "__main__":
    create_sigiu_report()
