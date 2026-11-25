import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Configuración global de matplotlib para diagramas técnicos académicos
plt.rcParams['font.sans-serif'] = 'Arial'
plt.rcParams['font.family'] = 'sans-serif'

DIAG_DIR = os.path.dirname(os.path.abspath(__file__))

def save_fig(fig, filename):
    path = os.path.join(DIAG_DIR, filename)
    fig.savefig(path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    print(f"[OK] Diagrama guardado: {filename}")

# ==============================================================================
# DIAGRAMA 01: CONTEXTO DEL SISTEMA SIGIU
# ==============================================================================
def make_context_diagram():
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 6)

    # Centro: Sistema SIGIU
    sigiu_box = patches.FancyBboxPatch((3.5, 2.0), 3.0, 2.0, boxstyle="round,pad=0.2",
                                       fc="#151719", ec="#3F4B48", lw=2)
    ax.add_patch(sigiu_box)
    ax.text(5.0, 3.2, "PLATAFORMA WEB RESPONSIVA\nSIGIU", color="#D0D4D7",
            fontsize=12, fontweight='bold', ha='center', va='center')
    ax.text(5.0, 2.5, "Municipio de Oaxaca de Juárez\n(Node.js + React + PostgreSQL)",
            color="#A9AFB2", fontsize=9, ha='center', va='center')

    # Actores / Entidades externas
    actors = [
        {"name": "Ciudadano\n(Padrón Municipal)", "pos": (1.2, 4.8), "color": "#3F4B48"},
        {"name": "Operador de Dependencia\n(DOPDU / Servicios / SOAPA)", "pos": (8.8, 4.8), "color": "#3F4B48"},
        {"name": "Personal de Cuadrilla\n(Trabajo Operativo en Campo)", "pos": (1.2, 1.2), "color": "#3F4B48"},
        {"name": "Administrador Central\n(Supervisión y Catálogos)", "pos": (8.8, 1.2), "color": "#3F4B48"},
        {"name": "Servidor de Mapas\n(OpenStreetMap / Leaflet)", "pos": (5.0, 5.3), "color": "#7D8181"},
    ]

    for a in actors:
        x, y = a["pos"]
        box = patches.FancyBboxPatch((x-1.0, y-0.45), 2.0, 0.9, boxstyle="round,pad=0.1",
                                     fc=a["color"], ec="#151719", lw=1.5)
        ax.add_patch(box)
        ax.text(x, y, a["name"], color="#FFFFFF", fontsize=8.5, fontweight='bold', ha='center', va='center')

    # Conexiones con etiquetas
    arrows = [
        ((2.2, 4.6), (3.6, 3.6), "Reportes y fotos (WGS84)\nVotos de apoyo"),
        ((7.8, 4.6), (6.4, 3.6), "Validación y despacho\nÓrdenes de Trabajo"),
        ((2.2, 1.4), (3.6, 2.4), "Bitácora en sitio\nEvidencia de resolución"),
        ((7.8, 1.4), (6.4, 2.4), "Gobernanza de usuarios\nCatálogos y analítica"),
        ((5.0, 4.85), (5.0, 4.0), "Teselas cartográficas"),
    ]

    for start, end, label in arrows:
        ax.annotate("", xy=end, xytext=start,
                    arrowprops=dict(arrowstyle="<->", color="#151719", lw=1.5, shrinkA=5, shrinkB=5))
        mid_x = (start[0] + end[0]) / 2
        mid_y = (start[1] + end[1]) / 2
        ax.text(mid_x, mid_y, label, fontsize=7.5, color="#151719",
                ha='center', va='center', bbox=dict(boxstyle="square,pad=0.1", fc="#F5F7F8", ec="none"))

    ax.set_title("Figura 4.1. Diagrama de Contexto del Sistema SIGIU", fontsize=11, fontweight='bold', pad=15)
    save_fig(fig, "diagrama_01_contexto.png")

# ==============================================================================
# DIAGRAMA 02: ARQUITECTURA GENERAL EN CAPAS
# ==============================================================================
def make_architecture_diagram():
    fig, ax = plt.subplots(figsize=(10, 7))
    ax.axis('off')
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 7)

    # Capas
    layers = [
        {"y": 5.4, "h": 1.2, "name": "CAPA DE PRESENTACIÓN (CLIENTE WEB RESPONSIVO)",
         "desc": "Single Page Application (SPA) en React 19 + Vite + Tailwind CSS\nComponentes: Ciudadano (PwaView), Operador (OperatorDashboard), Cuadrilla (CrewMobileView), Admin (AdminDashboard)\nServicios HTTP: Axios Client con interceptores JWT | Cartografía: Leaflet 1.9 + OpenStreetMap",
         "fc": "#F5F7F8", "ec": "#3F4B48"},
        {"y": 3.4, "h": 1.6, "name": "CAPA DE SERVICIOS Y NEGOCIO (BACKEND API REST)",
         "desc": "Servidor HTTP Node.js 18+ con Express.js\nMiddlewares: Auth (JWT Stateless), RBAC (authorizeRoles), Multer (Evidencias fotográficas), ErrorHandler centralizado\nControladores: authController, reportController, workOrderController, userController, catalogController",
         "fc": "#FFFFFF", "ec": "#151719"},
        {"y": 1.5, "h": 1.5, "name": "CAPA DE ACCESO A DATOS (ORM Y PERSISTENCIA)",
         "desc": "Sequelize ORM v6 (Mapeo Objeto-Relacional)\nModelos: Role, Department, User, Category, ReportStatus, Report, ReportEvidence, ReportHistory, WorkOrder, CitizenSupport\nHooks de encriptación (bcryptjs) y generación de folios oficiales (OAX-YYYY-XXXX)",
         "fc": "#F5F7F8", "ec": "#3F4B48"},
        {"y": 0.1, "h": 1.1, "name": "CAPA DE ALMACENAMIENTO (BASE DE DATOS Y ARCHIVOS)",
         "desc": "Motor Relacional: PostgreSQL 15+ (sigiu_db) | Coordenadas: WGS84 Decimal + GeoJSON Point (EPSG:4326)\nAlmacenamiento Local de Evidencias: server/uploads/ con UUID y validación MIME",
         "fc": "#151719", "ec": "#151719", "dark": True},
    ]

    for l in layers:
        dark = l.get("dark", False)
        box = patches.FancyBboxPatch((0.5, l["y"]), 9.0, l["h"], boxstyle="round,pad=0.1",
                                     fc=l["fc"], ec=l["ec"], lw=2)
        ax.add_patch(box)
        title_color = "#D0D4D7" if dark else "#151719"
        text_color = "#A9AFB2" if dark else "#3F4B48"
        ax.text(5.0, l["y"] + l["h"] - 0.25, l["name"], color=title_color, fontsize=9.5, fontweight='bold', ha='center')
        ax.text(5.0, l["y"] + (l["h"]-0.3)/2, l["desc"], color=text_color, fontsize=8, ha='center', va='center')

    # Flechas entre capas
    for y_pos, label in [(5.4, "HTTP/JSON + Multipart (Authorization: Bearer <JWT>)"),
                         (3.4, "Llamadas a métodos de modelos ORM"),
                         (1.5, "Protocolo PostgreSQL (puerto 5432) / SQL Queries")]:
        ax.annotate("", xy=(5.0, y_pos), xytext=(5.0, y_pos+0.01),
                    arrowprops=dict(arrowstyle="->", color="#3F4B48", lw=2))
        ax.text(5.0, y_pos, f"  {label}  ", fontsize=7.5, color="#151719",
                ha='center', va='center', bbox=dict(boxstyle="round,pad=0.1", fc="#FFFFFF", ec="#7D8181", lw=0.8))

    ax.set_title("Figura 4.2. Diagrama de Arquitectura por Capas del Sistema SIGIU", fontsize=11, fontweight='bold', pad=15)
    save_fig(fig, "diagrama_02_arquitectura.png")

# ==============================================================================
# DIAGRAMA 03: MODELO ENTIDAD-RELACIÓN (POSTGRESQL)
# ==============================================================================
def make_er_diagram():
    fig, ax = plt.subplots(figsize=(12, 8))
    ax.axis('off')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 8)

    entities = [
        {"name": "ROLES", "pos": (1.5, 6.8), "fields": ["PK id (SERIAL)", "nombre (VARCHAR)", "descripcion (VARCHAR)"]},
        {"name": "DEPENDENCIAS", "pos": (6.0, 6.8), "fields": ["PK id (SERIAL)", "nombre (VARCHAR)", "siglas (VARCHAR)", "titular (VARCHAR)"]},
        {"name": "USUARIOS", "pos": (1.5, 4.3), "fields": ["PK id (UUID)", "FK rol_id -> ROLES", "FK dependencia_id -> DEP", "nombre (VARCHAR)", "email (VARCHAR, UQ)", "password_hash (VARCHAR)", "estatus (BOOLEAN)"]},
        {"name": "CATEGORIAS", "pos": (6.0, 4.5), "fields": ["PK id (SERIAL)", "FK dependencia_id -> DEP", "nombre (VARCHAR)", "dias_horas_atencion (INT)", "icono (VARCHAR)"]},
        {"name": "ESTADOS_REPORTE", "pos": (10.2, 4.5), "fields": ["PK id (SERIAL)", "nombre (VARCHAR)", "color_hex (VARCHAR)", "orden (INT)"]},
        {"name": "REPORTES", "pos": (6.0, 1.8), "fields": ["PK id (UUID)", "folio (VARCHAR, UQ)", "FK ciudadano_id -> USUARIOS", "FK categoria_id -> CATEGORIAS", "FK estado_actual_id -> ESTADOS", "FK cuadrilla_id -> USUARIOS", "titulo (VARCHAR)", "latitud (DECIMAL 10,8)", "longitud (DECIMAL 11,8)", "votos_apoyo (INT)"]},
        {"name": "IMAGENES_REPORTE", "pos": (1.5, 1.5), "fields": ["PK id (UUID)", "FK reporte_id -> REPORTES", "url_imagen (VARCHAR)", "mimetype (VARCHAR)", "tipo (VARCHAR)"]},
        {"name": "ORDENES_TRABAJO", "pos": (10.2, 1.8), "fields": ["PK id (UUID)", "folio_orden (VARCHAR, UQ)", "FK reporte_id -> REPORTES", "FK operador_id -> USUARIOS", "FK cuadrilla_id -> USUARIOS", "estatus_orden (VARCHAR)", "fecha_limite (TIMESTAMP)", "foto_resolucion (VARCHAR)"]},
    ]

    for e in entities:
        x, y = e["pos"]
        w = 2.4
        h = 0.35 + len(e["fields"]) * 0.22
        box = patches.FancyBboxPatch((x - w/2, y - h/2), w, h, boxstyle="square,pad=0.05",
                                     fc="#FFFFFF", ec="#151719", lw=1.5)
        ax.add_patch(box)
        # Encabezado
        head = patches.Rectangle((x - w/2, y + h/2 - 0.32), w, 0.32, fc="#151719")
        ax.add_patch(head)
        ax.text(x, y + h/2 - 0.16, e["name"], color="#FFFFFF", fontsize=8, fontweight='bold', ha='center', va='center')
        # Atributos
        for i, field in enumerate(e["fields"]):
            fy = y + h/2 - 0.48 - i * 0.22
            color = "#8A0000" if "PK" in field else ("#003366" if "FK" in field else "#333333")
            ax.text(x - w/2 + 0.1, fy, field, color=color, fontsize=6.8, va='center')

    # Relaciones principales (Líneas)
    lines = [
        ((1.5, 6.0), (1.5, 5.3), "1:N"),
        ((6.0, 6.0), (6.0, 5.3), "1:N"),
        ((4.8, 6.8), (2.7, 4.8), "1:N"),
        ((2.7, 4.0), (4.8, 2.5), "1:N"),
        ((6.0, 3.6), (6.0, 3.0), "1:N"),
        ((9.0, 4.3), (7.2, 2.6), "1:N"),
        ((4.8, 1.8), (2.7, 1.6), "1:N"),
        ((7.2, 1.8), (9.0, 1.8), "1:1"),
    ]

    for p1, p2, card in lines:
        ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color="#3F4B48", lw=1.2, ls="--")
        mx = (p1[0] + p2[0]) / 2
        my = (p1[1] + p2[1]) / 2
        ax.text(mx, my, card, fontsize=7, color="#151719", fontweight='bold',
                bbox=dict(boxstyle="circle,pad=0.1", fc="#FFFFFF", ec="#7D8181", lw=0.5))

    ax.set_title("Figura 4.3. Diagrama Entidad-Relación de la Base de Datos SIGIU (PostgreSQL 15+)",
                 fontsize=11, fontweight='bold', pad=15)
    save_fig(fig, "diagrama_03_entidad_relacion.png")

# ==============================================================================
# DIAGRAMA 04: CICLO DE VIDA DE UNA INCIDENCIA (MÁQUINA DE ESTADOS)
# ==============================================================================
def make_lifecycle_diagram():
    fig, ax = plt.subplots(figsize=(11, 4.5))
    ax.axis('off')
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 4.5)

    states = [
        {"id": 1, "name": "1. RECIBIDO", "desc": "Captura ciudadana con GPS\ny fotografía de evidencia", "pos": (1.5, 2.2), "fc": "#7D8181"},
        {"id": 2, "name": "2. EN VALIDACIÓN", "desc": "Operador revisa procedencia\ny pertinencia municipal", "pos": (3.8, 2.2), "fc": "#3F4B48"},
        {"id": 3, "name": "3. ASIGNADO", "desc": "Generación de OT\ny asignación a cuadrilla", "pos": (6.1, 2.2), "fc": "#151719"},
        {"id": 4, "name": "4. EN PROCESO", "desc": "Cuadrilla inicia labores\nen campo (reparación)", "pos": (8.4, 2.2), "fc": "#3F4B48"},
        {"id": 5, "name": "5. ATENDIDO", "desc": "Cierre con foto de resolución\ny bitácora técnica", "pos": (8.4, 0.6), "fc": "#15803D"},
        {"id": 6, "name": "6. RECHAZADO", "desc": "Improcedencia o competencia\nfuera de municipio", "pos": (3.8, 0.6), "fc": "#B91C1C"},
    ]

    for s in states:
        x, y = s["pos"]
        box = patches.FancyBboxPatch((x-1.0, y-0.45), 2.0, 0.9, boxstyle="round,pad=0.1",
                                     fc=s["fc"], ec="#FFFFFF", lw=1.5)
        ax.add_patch(box)
        ax.text(x, y+0.12, s["name"], color="#FFFFFF", fontsize=8.5, fontweight='bold', ha='center', va='center')
        ax.text(x, y-0.18, s["desc"], color="#E5E7E8", fontsize=6.8, ha='center', va='center')

    # Transiciones
    transitions = [
        ((2.5, 2.2), (2.8, 2.2), "Revisión"),
        ((4.8, 2.2), (5.1, 2.2), "Despacho"),
        ((7.1, 2.2), (7.4, 2.2), "Inicio"),
        ((8.4, 1.75), (8.4, 1.05), "Conclusión"),
        ((3.8, 1.75), (3.8, 1.05), "Inadmisible"),
    ]

    for start, end, label in transitions:
        ax.annotate("", xy=end, xytext=start,
                    arrowprops=dict(arrowstyle="->", color="#151719", lw=2, shrinkA=2, shrinkB=2))
        mx = (start[0] + end[0]) / 2
        my = (start[1] + end[1]) / 2
        ax.text(mx, my, label, fontsize=7.5, color="#151719", fontweight='bold',
                ha='center', va='center', bbox=dict(boxstyle="square,pad=0.1", fc="#F5F7F8", ec="none"))

    ax.set_title("Figura 4.4. Diagrama de Estados del Ciclo de Vida de una Incidencia Urbana en SIGIU",
                 fontsize=11, fontweight='bold', pad=15)
    save_fig(fig, "diagrama_04_ciclo_vida.png")

# ==============================================================================
# DIAGRAMA 05: SECUENCIA DE DESPACHO Y RESOLUCIÓN
# ==============================================================================
def make_sequence_diagram():
    fig, ax = plt.subplots(figsize=(11, 7.5))
    ax.axis('off')
    ax.set_xlim(0, 11)
    ax.set_ylim(0, 7.5)

    actors = [
        ("Ciudadano\n(Navegador Web)", 1.2),
        ("API REST Express\n(/api/v1/)", 3.8),
        ("Base de Datos\n(PostgreSQL)", 6.2),
        ("Operador / Cuadrilla\n(Módulos Web)", 9.0)
    ]

    # Lifelines
    for name, x in actors:
        box = patches.FancyBboxPatch((x-0.9, 6.7), 1.8, 0.6, boxstyle="round,pad=0.08",
                                     fc="#151719", ec="#3F4B48", lw=1.5)
        ax.add_patch(box)
        ax.text(x, 7.0, name, color="#FFFFFF", fontsize=8, fontweight='bold', ha='center', va='center')
        ax.plot([x, x], [0.5, 6.7], color="#7D8181", lw=1, ls=":")

    # Mensajes de Secuencia
    seq_steps = [
        (6.2, 1.2, 3.8, "1. POST /reportes (Multer foto + GPS WGS84)", "->"),
        (5.7, 3.8, 6.2, "2. INSERT INTO reportes (Folio OAX-2026-XXXX)", "->"),
        (5.2, 6.2, 3.8, "3. Confirmación (ID, Folio, Estado 1)", "-->"),
        (4.7, 3.8, 1.2, "4. Acuse digital con folio único oficial", "-->"),
        (4.0, 9.0, 3.8, "5. GET /reportes?estado_id=1 (Consulta operador)", "->"),
        (3.5, 3.8, 9.0, "6. POST /ordenes (Generar OT-2026-XXXX)", "->"),
        (3.0, 3.8, 6.2, "7. INSERT INTO ordenes_trabajo & UPDATE estado=3", "->"),
        (2.3, 9.0, 3.8, "8. PATCH /ordenes/:id/iniciar (Cuadrilla en campo)", "->"),
        (1.6, 9.0, 3.8, "9. POST /ordenes/:id/finalizar (Foto resolución + bitácora)", "->"),
        (1.0, 3.8, 6.2, "10. UPDATE reportes SET estado=5 (Atendido)", "->"),
    ]

    for y, x1, x2, label, style in seq_steps:
        ls = "-" if style == "->" else "--"
        ax.annotate("", xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="->", color="#3F4B48", lw=1.5, ls=ls))
        ax.text((x1+x2)/2, y+0.12, label, fontsize=7.2, color="#151719", fontweight='bold', ha='center')

    ax.set_title("Figura 4.5. Diagrama de Secuencia: Flujo Integral de Atención y Cierre de Incidencia",
                 fontsize=11, fontweight='bold', pad=15)
    save_fig(fig, "diagrama_05_secuencia.png")

if __name__ == "__main__":
    print("Iniciando generación de diagramas UML y de arquitectura para SIGIU...")
    make_context_diagram()
    make_architecture_diagram()
    make_er_diagram()
    make_lifecycle_diagram()
    make_sequence_diagram()
    print("Todos los diagramas técnicos generados con éxito.")
