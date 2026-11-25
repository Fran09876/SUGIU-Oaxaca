import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = r"C:\Users\Francisco Perez\.gemini\antigravity\scratch\sigiu-oaxaca\docs\wireframes"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Tipografías del sistema Windows
FONT_DIR = r"C:\Windows\Fonts"
font_regular = os.path.join(FONT_DIR, "segoeui.ttf")
font_bold = os.path.join(FONT_DIR, "segoeuib.ttf")
font_mono = os.path.join(FONT_DIR, "consola.ttf")

def get_font(size, bold=False, mono=False):
    try:
        if mono and os.path.exists(font_mono):
            return ImageFont.truetype(font_mono, size)
        f_path = font_bold if bold else font_regular
        if os.path.exists(f_path):
            return ImageFont.truetype(f_path, size)
        return ImageFont.load_default()
    except Exception:
        return ImageFont.load_default()

# Paleta de wireframe profesional (Estilo Figma / Balsamiq de media fidelidad)
COLOR_BG = "#F4F5F7"
COLOR_SURFACE = "#FFFFFF"
COLOR_BORDER = "#D1D5DB"
COLOR_BORDER_DASH = "#9CA3AF"
COLOR_PRIMARY = "#112250"       # Royal Blue institucional
COLOR_SECONDARY = "#3C507D"     # Sapphire
COLOR_ACCENT = "#E0C58F"        # Quicksand Gold
COLOR_TEXT_MAIN = "#1F2937"
COLOR_TEXT_MUTED = "#6B7280"
COLOR_TEXT_LIGHT = "#9CA3AF"
COLOR_BADGE_BG = "#E5E7EB"
COLOR_ANNOTATION_BG = "#EFF6FF"
COLOR_ANNOTATION_BORDER = "#93C5FD"
COLOR_ANNOTATION_TEXT = "#1E40AF"

def draw_annotation_pill(draw, x, y, text, font):
    bbox = font.getbbox(text)
    w = bbox[2] - bbox[0] + 16
    h = bbox[3] - bbox[1] + 8
    draw.rounded_rectangle([x, y, x + w, y + h], radius=4, fill=COLOR_ANNOTATION_BG, outline=COLOR_ANNOTATION_BORDER, width=1)
    draw.text((x + 8, y + 3), text, fill=COLOR_ANNOTATION_TEXT, font=font)

def create_phone_canvas(title_annotation):
    W, H = 820, 1680
    img = Image.new("RGB", (W, H), COLOR_BG)
    draw = ImageDraw.Draw(img)

    # Marco exterior del teléfono (Bezel)
    draw.rounded_rectangle([20, 20, W - 20, H - 20], radius=44, fill="#1E293B", outline="#0F172A", width=4)
    # Pantalla activa
    draw.rounded_rectangle([32, 32, W - 32, H - 32], radius=36, fill=COLOR_SURFACE)

    # Bocina / Notch superior
    draw.rounded_rectangle([W // 2 - 80, 42, W // 2 + 80, 54], radius=6, fill="#0F172A")
    draw.ellipse([W // 2 + 95, 44, W // 2 + 103, 52], fill="#334155") # Cámara frontal

    # Barra de estado móvil
    f_status = get_font(13, bold=True)
    draw.text((60, 68), "09:41", fill="#1E293B", font=f_status)
    draw.text((W - 130, 68), "5G  85%", fill="#1E293B", font=f_status)

    # Encabezado institucional de la app
    draw.rounded_rectangle([32, 95, W - 32, 185], radius=0, fill=COLOR_PRIMARY)
    f_logo = get_font(22, bold=True)
    f_sub = get_font(12, bold=False)
    draw.text((60, 115), "SIGIU", fill="#FFFFFF", font=f_logo)
    draw.rounded_rectangle([135, 118, 290, 142], radius=6, fill="#E0C58F")
    draw.text((142, 122), "Oaxaca de Juárez", fill=COLOR_PRIMARY, font=get_font(11, bold=True))
    draw.text((60, 148), "Gestión de Incidencias Urbanas • PWA Ciudadana", fill="#D9CBC2", font=f_sub)

    # Barra inferior de inicio
    draw.rounded_rectangle([W // 2 - 70, H - 46, W // 2 + 70, H - 40], radius=3, fill="#94A3B8")

    # Anotación superior de documento
    draw_annotation_pill(draw, 40, H - 38, title_annotation, get_font(11, bold=True))

    return img, draw

# ==============================================================================
# BOCETO 1: PWA CIUDADANA - FORMULARIO DE LEVANTAMIENTO CON RADAR GPS Y CÁMARA
# ==============================================================================
def generate_boceto_1():
    img, draw = create_phone_canvas("BOCETO 01: PWA CIUDADANA - CAPTURA DE INCIDENCIA (HU-06 / HU-07)")
    f_label = get_font(13, bold=True)
    f_body = get_font(12, bold=False)
    f_small = get_font(10, bold=False)

    y = 205
    draw.text((55, y), "1. TIPO DE INCIDENCIA URBANA", fill=COLOR_PRIMARY, font=f_label)
    draw_annotation_pill(draw, 500, y - 2, "Catálogos DOPDU", f_small)

    y += 28
    cats = [
        ("Bacheo / Pavimento", "~48h", "DOPDU", True),
        ("Alumbrado Público", "~24h", "Serv. Municipales", False),
        ("Fuga de Agua / Drenaje", "~12h", "SOAPA", False),
        ("Parques y Limpieza", "~36h", "Serv. Municipales", False)
    ]
    card_w = 345
    card_h = 75
    for i, (name, sla, dep, selected) in enumerate(cats):
        cx = 55 if i % 2 == 0 else 420
        cy = y + (i // 2) * (card_h + 10)
        border_col = COLOR_ACCENT if selected else COLOR_BORDER
        bg_col = "#FDFBF7" if selected else "#FFFFFF"
        draw.rounded_rectangle([cx, cy, cx + card_w, cy + card_h], radius=12, fill=bg_col, outline=border_col, width=2 if selected else 1)
        
        draw.rounded_rectangle([cx + 12, cy + 14, cx + 54, cy + 56], radius=8, fill="#E2E8F0" if not selected else COLOR_PRIMARY)
        draw.text((cx + 25, cy + 26), "[*]" if not selected else "[✓]", fill=COLOR_PRIMARY if not selected else "#FFFFFF", font=f_small)
        
        draw.text((cx + 64, cy + 18), name, fill=COLOR_TEXT_MAIN, font=get_font(12, bold=True))
        draw.text((cx + 64, cy + 40), dep, fill=COLOR_TEXT_MUTED, font=f_small)
        draw.rounded_rectangle([cx + card_w - 55, cy + 12, cx + card_w - 12, cy + 30], radius=4, fill="#F1F5F9")
        draw.text((cx + card_w - 48, cy + 15), sla, fill=COLOR_TEXT_MUTED, font=get_font(9, bold=True))

    y += 180
    # SECCIÓN 2: RADAR GPS WGS84
    draw.text((55, y), "2. UBICACIÓN SATELITAL EXACTA (GPS)", fill=COLOR_PRIMARY, font=f_label)
    draw_annotation_pill(draw, 510, y - 2, "navigator.geolocation", f_small)

    y += 28
    draw.rounded_rectangle([55, y, 765, y + 160], radius=16, fill="#0F172A", outline=COLOR_ACCENT, width=2)
    center_x, center_y = 145, y + 80
    for r in [60, 42, 24, 8]:
        draw.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], outline="#334155", width=1)
    draw.ellipse([center_x - 14, center_y - 14, center_x + 14, center_y + 14], fill=COLOR_ACCENT, outline="#FFFFFF", width=2)
    
    draw.text((230, y + 25), "SENSOR GPS ACTIVO (WGS84)", fill=COLOR_ACCENT, font=get_font(12, bold=True))
    draw.text((230, y + 50), "Latitud:  17.06050000° N", fill="#FFFFFF", font=get_font(13, mono=True))
    draw.text((230, y + 72), "Longitud: -96.72560000° W", fill="#FFFFFF", font=get_font(13, mono=True))
    draw.text((230, y + 96), "Precisión estimada: ± 6.2 metros", fill="#94A3B8", font=f_small)

    draw.rounded_rectangle([230, y + 118, 430, y + 148], radius=8, fill=COLOR_ACCENT)
    draw.text((246, y + 125), "Actualizar Posición GPS", fill=COLOR_PRIMARY, font=get_font(11, bold=True))
    draw.rounded_rectangle([445, y + 118, 620, y + 148], radius=8, fill="#334155")
    draw.text((465, y + 125), "Ajustar Pin en Mapa", fill="#FFFFFF", font=get_font(11, bold=False))

    y += 180
    # SECCIÓN 3: CAMPOS DE FORMULARIO
    draw.text((55, y), "3. DATOS DESCRIPTIVOS DE LA FALLA", fill=COLOR_PRIMARY, font=f_label)
    
    y += 28
    draw.text((55, y), "Colonia / Barrio de Oaxaca:", fill=COLOR_TEXT_MAIN, font=f_body)
    draw.rounded_rectangle([55, y + 20, 395, y + 60], radius=8, fill="#F9FAFB", outline=COLOR_BORDER)
    draw.text((70, y + 32), "Centro Histórico  [▼]", fill=COLOR_TEXT_MAIN, font=f_body)

    draw.text((425, y), "Calle y Referencias:", fill=COLOR_TEXT_MAIN, font=f_body)
    draw.rounded_rectangle([425, y + 20, 765, y + 60], radius=8, fill="#F9FAFB", outline=COLOR_BORDER)
    draw.text((440, y + 32), "Macedonio Alcalá esq. Independencia...", fill=COLOR_TEXT_LIGHT, font=f_body)

    y += 75
    draw.text((55, y), "Título breve del problema:", fill=COLOR_TEXT_MAIN, font=f_body)
    draw.rounded_rectangle([55, y + 20, 765, y + 60], radius=8, fill="#F9FAFB", outline=COLOR_BORDER)
    draw.text((70, y + 32), "Ej. Bache profundo frente a Museo Textil de Oaxaca", fill=COLOR_TEXT_LIGHT, font=f_body)

    y += 75
    draw.text((55, y), "Descripción detallada:", fill=COLOR_TEXT_MAIN, font=f_body)
    draw.rounded_rectangle([55, y + 20, 765, y + 110], radius=8, fill="#F9FAFB", outline=COLOR_BORDER)
    draw.text((70, y + 32), "El adoquín se hundió aproximadamente 20cm, genera riesgo peatonal...", fill=COLOR_TEXT_LIGHT, font=f_body)

    y += 125
    draw.text((55, y), "Severidad / Prioridad:", fill=COLOR_TEXT_MAIN, font=f_body)
    priors = ["Baja", "Media", "Alta", "Urgente"]
    pw = 170
    for i, p in enumerate(priors):
        px = 55 + i * (pw + 6)
        is_sel = (p == "Alta")
        draw.rounded_rectangle([px, y + 20, px + pw, y + 54], radius=8, fill=COLOR_PRIMARY if is_sel else "#FFFFFF", outline=COLOR_BORDER)
        draw.text((px + 55, y + 28), p, fill="#FFFFFF" if is_sel else COLOR_TEXT_MAIN, font=get_font(12, bold=is_sel))

    y += 75
    draw.text((55, y), "4. EVIDENCIA FOTOGRÁFICA (CÁMARA / ARCHIVO)", fill=COLOR_PRIMARY, font=f_label)
    draw_annotation_pill(draw, 500, y - 2, "Multer multipart 5MB", f_small)

    y += 28
    draw.rounded_rectangle([55, y, 765, y + 140], radius=12, fill="#F8FAFC", outline=COLOR_BORDER_DASH, width=2)
    draw.rounded_rectangle([370, y + 20, 440, y + 70], radius=10, fill="#E2E8F0")
    draw.text((388, y + 38), "[CAM]", fill=COLOR_TEXT_MUTED, font=f_small)
    draw.text((280, y + 80), "Capturar con Cámara del Teléfono o Subir Archivo", fill=COLOR_TEXT_MAIN, font=get_font(12, bold=True))
    draw.text((330, y + 102), "Formatos: JPG, PNG, WEBP (Máx. 5MB)", fill=COLOR_TEXT_MUTED, font=f_small)

    y += 160
    draw.rounded_rectangle([55, y, 765, y + 62], radius=16, fill=COLOR_PRIMARY, outline=COLOR_ACCENT, width=2)
    draw.text((275, y + 20), "ENVIAR REPORTE CIUDADANO OFICIAL", fill=COLOR_ACCENT, font=get_font(14, bold=True))

    out_path = os.path.join(OUTPUT_DIR, "boceto_01_pwa_formulario_reporte.png")
    img.save(out_path, dpi=(150, 150))
    print(f"Generado: {out_path}")

# ==============================================================================
# BOCETO 2: PWA CIUDADANA - MURO COMUNITARIO Y MAPA EN VIVO
# ==============================================================================
def generate_boceto_2():
    img, draw = create_phone_canvas("BOCETO 02: PWA CIUDADANA - MURO Y MAPA GEOESPACIAL (APOYOS CIUDADANOS)")
    f_body = get_font(12, bold=False)
    f_small = get_font(10, bold=False)

    y = 205
    draw.rounded_rectangle([55, y, 765, y + 46], radius=12, fill="#E2E8F0")
    draw.rounded_rectangle([57, y + 2, 290, y + 44], radius=10, fill="#FFFFFF")
    draw.text((115, y + 14), "Reportar", fill=COLOR_TEXT_MUTED, font=get_font(12, bold=False))
    draw.rounded_rectangle([292, y + 2, 530, y + 44], radius=10, fill=COLOR_PRIMARY)
    draw.text((350, y + 14), "Muro en Vivo", fill="#FFFFFF", font=get_font(12, bold=True))
    draw.text((615, y + 14), "Mapa GIS", fill=COLOR_TEXT_MUTED, font=get_font(12, bold=False))

    y += 65
    draw.rounded_rectangle([55, y, 640, y + 46], radius=10, fill="#FFFFFF", outline=COLOR_BORDER)
    draw.text((75, y + 14), "🔍  Buscar folio, calle o colonia de Oaxaca...", fill=COLOR_TEXT_LIGHT, font=f_body)
    draw.rounded_rectangle([655, y, 765, y + 46], radius=10, fill=COLOR_PRIMARY)
    draw.text((680, y + 14), "Filtrar", fill="#FFFFFF", font=get_font(12, bold=True))

    y += 65
    draw.text((55, y), "VISOR CARTOGRÁFICO DE INCIDENCIAS ACTIVAS", fill=COLOR_PRIMARY, font=get_font(12, bold=True))
    y += 24
    draw.rounded_rectangle([55, y, 765, y + 220], radius=16, fill="#E5E7EB", outline=COLOR_BORDER)
    
    for line_y in range(y + 30, y + 220, 45):
        draw.line([55, line_y, 765, line_y], fill="#D1D5DB", width=2)
    for line_x in range(120, 765, 80):
        draw.line([line_x, y, line_x, y + 220], fill="#D1D5DB", width=2)
    
    pins = [
        (220, y + 70, "#112250", "OAX-1001"),
        (480, y + 110, "#E0C58F", "OAX-1002"),
        (640, y + 50, "#2563EB", "OAX-1003"),
        (350, y + 160, "#16A34A", "OAX-1004")
    ]
    for px, py, color, fol in pins:
        draw.ellipse([px - 14, py - 14, px + 14, py + 14], fill=color, outline="#FFFFFF", width=2)
        draw.ellipse([px - 5, py - 5, px + 5, py + 5], fill="#FFFFFF")
        draw.rounded_rectangle([px - 30, py + 18, px + 30, py + 34], radius=4, fill="#112250")
        draw.text((px - 26, py + 20), fol, fill="#FFFFFF", font=get_font(9, mono=True))

    draw.rounded_rectangle([65, y + 175, 290, y + 210], radius=6, fill="#FFFFFF", outline=COLOR_BORDER)
    draw.text((75, y + 185), "Centro Histórico • 17.0605, -96.7256", fill=COLOR_PRIMARY, font=f_small)

    y += 240
    draw.text((55, y), "INCIDENCIAS DE LA COMUNIDAD (ORDENADAS POR FECHA Y APOYOS)", fill=COLOR_PRIMARY, font=get_font(12, bold=True))

    cards = [
        ("OAX-2026-1001", "Bache profundo en Andador Alcalá", "Centro Histórico • Hace 2 horas", "Recibido", "#3C507D", 14),
        ("OAX-2026-1002", "Luminarias apagadas en Plaza de la Danza", "Centro Histórico • Hace 5 horas", "Asignado", "#112250", 8),
        ("OAX-2026-1003", "Fuga considerable en Calz. Porfirio Díaz", "Colonia Reforma • Hace 1 día", "En Proceso", "#2563EB", 29),
        ("OAX-2026-1004", "Ramas caídas en Paseo El Llano", "Centro Histórico • Hace 2 días", "Atendido", "#16A34A", 11)
    ]

    y += 26
    for folio, title, place, status, scolor, votes in cards:
        draw.rounded_rectangle([55, y, 765, y + 165], radius=14, fill="#FFFFFF", outline=COLOR_BORDER)
        
        draw.rounded_rectangle([70, y + 16, 175, y + 115], radius=8, fill="#F1F5F9", outline=COLOR_BORDER)
        draw.line([70, y + 16, 175, y + 115], fill="#E2E8F0", width=1)
        draw.line([70, y + 115, 175, y + 16], fill="#E2E8F0", width=1)
        draw.text((100, y + 55), "[FOTO]", fill=COLOR_TEXT_LIGHT, font=f_small)

        draw.rounded_rectangle([190, y + 16, 280, y + 36], radius=4, fill="#F8FAFC", outline=COLOR_BORDER)
        draw.text((196, y + 20), folio, fill=COLOR_PRIMARY, font=get_font(10, mono=True))
        
        draw.rounded_rectangle([660, y + 16, 750, y + 36], radius=10, fill=scolor)
        draw.text((672, y + 20), status, fill="#FFFFFF", font=get_font(9, bold=True))

        draw.text((190, y + 44), title, fill=COLOR_TEXT_MAIN, font=get_font(13, bold=True))
        draw.text((190, y + 68), place, fill=COLOR_TEXT_MUTED, font=f_small)

        draw.line([190, y + 96, 750, y + 96], fill="#F1F5F9", width=1)
        draw.rounded_rectangle([190, y + 110, 390, y + 148], radius=8, fill="#FDFBF7", outline=COLOR_ACCENT)
        draw.text((205, y + 120), f"👍 A mí también me afecta ({votes})", fill=COLOR_PRIMARY, font=get_font(11, bold=True))
        draw.text((600, y + 122), "Ver expediente →", fill=COLOR_SECONDARY, font=f_small)

        y += 180

    out_path = os.path.join(OUTPUT_DIR, "boceto_02_pwa_muro_y_mapa.png")
    img.save(out_path, dpi=(150, 150))
    print(f"Generado: {out_path}")

# ==============================================================================
# BOCETO 3: PWA CIUDADANA - MODAL DE ACUSE CON FOLIO OFICIAL
# ==============================================================================
def generate_boceto_3():
    img, draw = create_phone_canvas("BOCETO 03: PWA CIUDADANA - ACUSE DIGITAL DE FOLIO (CONFIRMACIÓN)")
    f_title = get_font(18, bold=True)
    f_body = get_font(12, bold=False)
    f_small = get_font(10, bold=False)

    # Fondo modal
    draw.rectangle([32, 95, 788, 1648], fill="#334155")

    mx, my = 75, 360
    mw, mh = 670, 880
    draw.rounded_rectangle([mx, my, mx + mw, my + mh], radius=24, fill="#FDFBF7", outline=COLOR_ACCENT, width=3)

    cx, cy = mx + mw // 2, my + 80
    draw.ellipse([cx - 45, cy - 45, cx + 45, cy + 45], fill="#DCFCE7", outline="#22C55E", width=3)
    draw.text((cx - 16, cy - 20), "✓", fill="#15803D", font=get_font(32, bold=True))

    draw.text((mx + 110, my + 145), "¡Reporte Registrado con Éxito!", fill=COLOR_PRIMARY, font=f_title)
    draw.text((mx + 70, my + 185), "Tu incidencia ha ingresado formalmente al padrón de atención", fill=COLOR_TEXT_MUTED, font=f_body)
    draw.text((mx + 130, my + 205), "de la Dirección de Obras Públicas y Desarrollo Urbano.", fill=COLOR_TEXT_MUTED, font=f_body)

    ty = my + 250
    draw.rounded_rectangle([mx + 35, ty, mx + mw - 35, ty + 380], radius=16, fill=COLOR_PRIMARY, outline=COLOR_ACCENT, width=2)
    
    draw.text((mx + 60, ty + 24), "FOLIO ÚNICO DE SEGUIMIENTO", fill=COLOR_ACCENT, font=get_font(11, bold=True))
    draw.rounded_rectangle([mx + mw - 160, ty + 20, mx + mw - 60, ty + 42], radius=4, fill=COLOR_SECONDARY)
    draw.text((mx + mw - 148, ty + 24), "RECIBIDO", fill="#FFFFFF", font=get_font(9, bold=True))

    draw.rounded_rectangle([mx + 55, ty + 55, mx + mw - 55, ty + 120], radius=10, fill="#1E293B", outline="#475569")
    draw.text((mx + 110, ty + 70), "OAX-2026-1001", fill=COLOR_ACCENT, font=get_font(26, bold=True, mono=True))
    draw.rounded_rectangle([mx + mw - 160, ty + 68, mx + mw - 70, ty + 106], radius=6, fill=COLOR_ACCENT)
    draw.text((mx + mw - 145, ty + 78), "[Copiar]", fill=COLOR_PRIMARY, font=get_font(11, bold=True))

    dy = ty + 145
    labels = [
        ("Fecha / Hora de Registro:", "19 de Octubre 2026 • 02:45 hrs"),
        ("Categoría Asignada:", "Bacheo y Pavimentación (DOPDU)"),
        ("Colonia / Municipio:", "Centro Histórico, Oaxaca de Juárez"),
        ("Coordenadas WGS84:", "17.06290000° N, -96.72310000° W"),
        ("Compromiso SLA:", "Atención técnica preliminar en ~48 horas")
    ]
    for lbl, val in labels:
        draw.text((mx + 60, dy), lbl, fill="#94A3B8", font=f_small)
        draw.text((mx + 250, dy), val, fill="#FFFFFF", font=get_font(11, bold=True))
        dy += 36

    by = ty + 335
    for bar_x in range(mx + 60, mx + mw - 60, 6):
        draw.line([bar_x, by, bar_x, by + 28], fill=COLOR_ACCENT, width=2 if bar_x % 4 == 0 else 1)

    draw.rounded_rectangle([mx + 35, my + 670, mx + mw - 35, my + 735], radius=14, fill=COLOR_ACCENT, outline=COLOR_PRIMARY, width=1)
    draw.text((mx + 230, my + 692), "ACEPTAR Y VOLVER AL MURO", fill=COLOR_PRIMARY, font=get_font(13, bold=True))
    draw.text((mx + 215, my + 770), "Puedes consultar el estado de tu folio en cualquier momento", fill=COLOR_TEXT_LIGHT, font=f_small)

    out_path = os.path.join(OUTPUT_DIR, "boceto_03_pwa_acuse_folio.png")
    img.save(out_path, dpi=(150, 150))
    print(f"Generado: {out_path}")

# ==============================================================================
# BOCETO 4: DASHBOARD ADMINISTRATIVO - VISTA PRINCIPAL CON KPIS Y MAPA GIS
# ==============================================================================
def generate_desktop_canvas(title_annotation):
    W, H = 1600, 1050
    img = Image.new("RGB", (W, H), COLOR_BG)
    draw = ImageDraw.Draw(img)

    draw.rounded_rectangle([20, 20, W - 20, H - 20], radius=16, fill=COLOR_SURFACE, outline="#CBD5E1", width=2)
    draw.rounded_rectangle([20, 20, W - 20, 70], radius=0, fill="#E2E8F0")
    for i, c in enumerate(["#EF4444", "#F59E0B", "#10B981"]):
        draw.ellipse([45 + i * 22, 40, 57 + i * 22, 52], fill=c)

    draw.rounded_rectangle([130, 32, W - 200, 60], radius=8, fill="#FFFFFF", outline="#CBD5E1")
    draw.text((150, 38), "🔒 https://sigiu.oaxaca.gob.mx/admin/dashboard (Panel de Control Oficial)", fill=COLOR_TEXT_MUTED, font=get_font(12))

    draw.rounded_rectangle([20, 70, W - 20, 140], radius=0, fill=COLOR_PRIMARY)
    draw.text((50, 92), "SIGIU", fill="#FFFFFF", font=get_font(22, bold=True))
    draw.rounded_rectangle([130, 94, 300, 120], radius=4, fill=COLOR_ACCENT)
    draw.text((138, 98), "Municipio de Oaxaca de Juárez", fill=COLOR_PRIMARY, font=get_font(11, bold=True))
    draw.text((320, 98), "Panel Administrativo y Despacho Operativo", fill="#D9CBC2", font=get_font(13))

    draw.ellipse([W - 250, 88, W - 216, 122], fill=COLOR_ACCENT)
    draw.text((W - 240, 96), "JP", fill=COLOR_PRIMARY, font=get_font(12, bold=True))
    draw.text((W - 205, 90), "Ing. José Francisco Pérez", fill="#FFFFFF", font=get_font(12, bold=True))
    draw.text((W - 205, 108), "Administrador General", fill=COLOR_ACCENT, font=get_font(10))

    draw.rectangle([20, 140, 260, H - 20], fill="#0F172A")
    menu = [
        ("📊 Dashboard General", True),
        ("🗺️ Visor Geoespacial", False),
        ("📋 Tabla de Incidencias", False),
        ("👷 Cuadrillas y Asignación", False),
        ("📑 Catálogos Municipales", False),
        ("⚙️ Configuración / Usuarios", False)
    ]
    sy = 170
    for label, active in menu:
        if active:
            draw.rounded_rectangle([35, sy, 245, sy + 44], radius=8, fill=COLOR_SECONDARY)
            draw.text((55, sy + 12), label, fill="#FFFFFF", font=get_font(13, bold=True))
        else:
            draw.text((55, sy + 12), label, fill="#94A3B8", font=get_font(13, bold=False))
        sy += 55

    draw_annotation_pill(draw, 40, H - 55, title_annotation, get_font(11, bold=True))
    return img, draw

def generate_boceto_4():
    img, draw = generate_desktop_canvas("BOCETO 04: DASHBOARD ADMINISTRATIVO - KPIS Y VISOR GIS (HU-03 / HU-04)")
    f_body = get_font(12, bold=False)

    x_main = 290
    y_main = 165

    draw.text((x_main, y_main), "PANEL DE CONTROL GEOESPACIAL Y MÉTRICAS DE ATENCIÓN", fill=COLOR_PRIMARY, font=get_font(18, bold=True))
    draw.text((x_main, y_main + 26), "Dirección de Obras Públicas y Desarrollo Urbano • Actualización en tiempo real", fill=COLOR_TEXT_MUTED, font=f_body)

    draw.rounded_rectangle([1400, y_main, 1560, y_main + 40], radius=8, fill=COLOR_PRIMARY)
    draw.text((1425, y_main + 10), "Exportar Balance", fill="#FFFFFF", font=get_font(12, bold=True))

    y_kpi = y_main + 65
    kpis = [
        ("TOTAL INCIDENCIAS", "154", "Padrón WGS84 Registrado", COLOR_PRIMARY),
        ("EN ESPERA DE REVISIÓN", "28", "Pendientes de validación", "#D97706"),
        ("EN ATENCIÓN CUADRILLA", "42", "Personal activo en campo", COLOR_SECONDARY),
        ("ATENDIDAS CON ÉXITO", "84", "Efectividad global: 78%", "#16A34A")
    ]
    kw = 300
    for i, (title, num, sub, col) in enumerate(kpis):
        kx = x_main + i * (kw + 20)
        draw.rounded_rectangle([kx, y_kpi, kx + kw, y_kpi + 115], radius=12, fill="#FFFFFF", outline=COLOR_BORDER)
        draw.text((kx + 18, y_kpi + 16), title, fill=COLOR_TEXT_MUTED, font=get_font(10, bold=True))
        draw.text((kx + 18, y_kpi + 36), num, fill=col, font=get_font(30, bold=True))
        draw.text((kx + 18, y_kpi + 84), sub, fill=col, font=get_font(11, bold=True))

    y_map = y_kpi + 140
    mw = 800
    mh = 570
    draw.rounded_rectangle([x_main, y_map, x_main + mw, y_map + mh], radius=16, fill="#E2E8F0", outline=COLOR_BORDER)
    draw.text((x_main + 20, y_map + 20), "🗺️ MAPA CARTOGRÁFICO VECTORIAL DE OAXACA DE JUÁREZ (EPSG:4326)", fill=COLOR_PRIMARY, font=get_font(13, bold=True))
    
    for gy in range(y_map + 60, y_map + mh - 20, 60):
        draw.line([x_main + 20, gy, x_main + mw - 20, gy], fill="#CBD5E1", width=2)
    for gx in range(x_main + 60, x_main + mw - 20, 80):
        draw.line([gx, y_map + 60, gx, y_map + mh - 20], fill="#CBD5E1", width=2)

    pins = [
        (x_main + 320, y_map + 200, "#112250", "Bacheo: Alcalá"),
        (x_main + 420, y_map + 150, "#E0C58F", "Alumbrado: Sto. Domingo"),
        (x_main + 240, y_map + 380, "#2563EB", "Fuga: Calz. Porfirio Díaz"),
        (x_main + 580, y_map + 290, "#16A34A", "Parques: El Llano")
    ]
    for px, py, color, lbl in pins:
        draw.ellipse([px - 16, py - 16, px + 16, py + 16], fill=color, outline="#FFFFFF", width=3)
        draw.rounded_rectangle([px - 50, py + 22, px + 90, py + 44], radius=6, fill=COLOR_PRIMARY)
        draw.text((px - 42, py + 26), lbl, fill="#FFFFFF", font=get_font(10, bold=True))

    lx = x_main + mw + 25
    lw = 445
    draw.rounded_rectangle([lx, y_map, lx + lw, y_map + mh], radius=16, fill="#FFFFFF", outline=COLOR_BORDER)
    draw.text((lx + 20, y_map + 20), "ACTIVIDAD OPERATIVA RECIENTE", fill=COLOR_PRIMARY, font=get_font(13, bold=True))

    recents = [
        ("OAX-2026-1001", "Bache profundo calle Alcalá", "Recibido", "#3C507D", "Hace 15 min"),
        ("OAX-2026-1002", "Luminarias Plaza de la Danza", "Asignado a Cuadrilla 3", "#112250", "Hace 1 hora"),
        ("OAX-2026-1003", "Fuga en Calz. Porfirio Díaz", "En Proceso de soldadura", "#2563EB", "Hace 3 horas"),
        ("OAX-2026-1004", "Ramas Parque El Llano", "Atendido con foto final", "#16A34A", "Ayer")
    ]
    ry = y_map + 60
    for fol, tit, st, sc, tm in recents:
        draw.rounded_rectangle([lx + 15, ry, lx + lw - 15, ry + 110], radius=10, fill="#F8FAFC", outline=COLOR_BORDER)
        draw.text((lx + 28, ry + 14), fol, fill=COLOR_PRIMARY, font=get_font(11, bold=True, mono=True))
        draw.text((lx + lw - 100, ry + 14), tm, fill=COLOR_TEXT_LIGHT, font=get_font(9))
        draw.text((lx + 28, ry + 36), tit, fill=COLOR_TEXT_MAIN, font=get_font(12, bold=True))
        draw.rounded_rectangle([lx + 28, ry + 68, lx + 200, ry + 92], radius=6, fill=sc)
        draw.text((lx + 36, ry + 72), st, fill="#FFFFFF", font=get_font(10, bold=True))
        ry += 125

    out_path = os.path.join(OUTPUT_DIR, "boceto_04_dashboard_admin_principal.png")
    img.save(out_path, dpi=(150, 150))
    print(f"Generado: {out_path}")

# ==============================================================================
# BOCETO 5: DASHBOARD ADMINISTRATIVO - TABLA DE DESPACHO Y EXPEDIENTE
# ==============================================================================
def generate_boceto_5():
    img, draw = generate_desktop_canvas("BOCETO 05: DASHBOARD ADMINISTRATIVO - TABLA DE CANALIZACIÓN Y DETALLE (HU-03)")
    f_body = get_font(12, bold=False)
    f_small = get_font(11, bold=False)

    x_main = 290
    y_main = 165

    draw.text((x_main, y_main), "TABLA DE DESPACHO Y CANALIZACIÓN OPERATIVA", fill=COLOR_PRIMARY, font=get_font(18, bold=True))
    draw.text((x_main, y_main + 26), "Filtrado, asignación de cuadrillas y cambio de estatus de incidencias", fill=COLOR_TEXT_MUTED, font=f_body)

    y_tools = y_main + 65
    draw.rounded_rectangle([x_main, y_tools, x_main + 500, y_tools + 44], radius=8, fill="#FFFFFF", outline=COLOR_BORDER)
    draw.text((x_main + 20, y_tools + 12), "🔍  Buscar por folio, colonia, calle o categoría...", fill=COLOR_TEXT_LIGHT, font=f_body)

    draw.rounded_rectangle([x_main + 520, y_tools, x_main + 720, y_tools + 44], radius=8, fill="#FFFFFF", outline=COLOR_BORDER)
    draw.text((x_main + 535, y_tools + 12), "Todas las categorías [▼]", fill=COLOR_TEXT_MAIN, font=f_body)

    draw.rounded_rectangle([x_main + 735, y_tools, x_main + 910, y_tools + 44], radius=8, fill="#FFFFFF", outline=COLOR_BORDER)
    draw.text((x_main + 750, y_tools + 12), "Todos los estados [▼]", fill=COLOR_TEXT_MAIN, font=f_body)

    y_table = y_tools + 60
    tw = 810
    th = 650
    draw.rounded_rectangle([x_main, y_table, x_main + tw, y_table + th], radius=12, fill="#FFFFFF", outline=COLOR_BORDER)

    headers = [("FOLIO", 40), ("FOTO", 150), ("INCIDENCIA", 220), ("COLONIA", 460), ("PRIORIDAD", 620), ("ESTATUS", 710)]
    draw.rounded_rectangle([x_main, y_table, x_main + tw, y_table + 45], radius=0, fill="#F8FAFC")
    draw.line([x_main, y_table + 45, x_main + tw, y_table + 45], fill=COLOR_BORDER, width=1)
    for name, offset in headers:
        draw.text((x_main + offset, y_table + 14), name, fill=COLOR_TEXT_MUTED, font=get_font(10, bold=True))

    rows = [
        ("OAX-2026-1001", "Bache profundo Alcalá", "Centro", "Alta", "Recibido", "#3C507D", True),
        ("OAX-2026-1002", "Luminarias Plaza Danza", "Centro", "Media", "Asignado", "#112250", False),
        ("OAX-2026-1003", "Fuga Calz. Porfirio Díaz", "Reforma", "Urgente", "En Proceso", "#2563EB", False),
        ("OAX-2026-1004", "Ramas Paseo El Llano", "Centro", "Media", "Atendido", "#16A34A", False),
        ("OAX-2026-1005", "Semáforo apagado Periférico", "Cinco Señores", "Alta", "En Validación", "#D97706", False)
    ]
    row_y = y_table + 45
    for fol, tit, col, pri, st, scol, sel in rows:
        if sel:
            draw.rectangle([x_main, row_y, x_main + tw, row_y + 70], fill="#F0F9FF")
        draw.line([x_main, row_y + 70, x_main + tw, row_y + 70], fill="#F1F5F9", width=1)
        
        draw.text((x_main + 40, row_y + 26), fol, fill=COLOR_PRIMARY, font=get_font(11, bold=True, mono=True))
        draw.rounded_rectangle([x_main + 150, row_y + 14, x_main + 195, row_y + 56], radius=6, fill="#E2E8F0")
        draw.text((x_main + 158, row_y + 28), "[IMG]", fill=COLOR_TEXT_MUTED, font=get_font(9))

        draw.text((x_main + 220, row_y + 18), tit, fill=COLOR_TEXT_MAIN, font=get_font(12, bold=True))
        draw.text((x_main + 220, row_y + 38), "Coord: 17.0629, -96.7231", fill=COLOR_TEXT_LIGHT, font=get_font(10))

        draw.text((x_main + 460, row_y + 26), col, fill=COLOR_TEXT_MUTED, font=f_small)

        draw.rounded_rectangle([x_main + 620, row_y + 22, x_main + 685, row_y + 46], radius=6, fill="#FEF3C7" if pri == "Alta" else "#FEE2E2" if pri == "Urgente" else "#F1F5F9")
        draw.text((x_main + 630, row_y + 26), pri, fill="#92400E" if pri == "Alta" else "#B91C1C" if pri == "Urgente" else COLOR_TEXT_MUTED, font=get_font(10, bold=True))

        draw.rounded_rectangle([x_main + 710, row_y + 22, x_main + 795, row_y + 46], radius=6, fill=scol)
        draw.text((x_main + 720, row_y + 26), st, fill="#FFFFFF", font=get_font(10, bold=True))

        row_y += 70

    dx = x_main + tw + 25
    dw = 435
    draw.rounded_rectangle([dx, y_table, dx + dw, y_table + th], radius=16, fill="#FFFFFF", outline=COLOR_ACCENT, width=2)
    
    draw.text((dx + 25, y_table + 24), "EXPEDIENTE DETALLADO", fill=COLOR_PRIMARY, font=get_font(14, bold=True))
    draw.text((dx + dw - 120, y_table + 24), "OAX-2026-1001", fill=COLOR_SECONDARY, font=get_font(11, bold=True, mono=True))

    draw.rounded_rectangle([dx + 25, y_table + 60, dx + dw - 25, y_table + 240], radius=12, fill="#E2E8F0", outline=COLOR_BORDER)
    draw.line([dx + 25, y_table + 60, dx + dw - 25, y_table + 240], fill="#CBD5E1", width=1)
    draw.line([dx + 25, y_table + 240, dx + dw - 25, y_table + 60], fill="#CBD5E1", width=1)
    draw.text((dx + 120, y_table + 140), "[FOTOGRAFÍA EVIDENCIA MULTER]", fill=COLOR_TEXT_MUTED, font=get_font(11, bold=True))

    ey = y_table + 260
    meta = [
        ("Título:", "Bache profundo sobre calle Macedonio Alcalá"),
        ("Categoría:", "Bacheo y Pavimentación (DOPDU)"),
        ("Ciudadano:", "Carlos Jiménez Mendoza (Col. Reforma)"),
        ("Ubicación GPS:", "17.0629° N, -96.7231° W (Centro Histórico)"),
        ("Apoyos:", "14 ciudadanos respaldan la prioridad")
    ]
    for lbl, val in meta:
        draw.text((dx + 25, ey), lbl, fill=COLOR_TEXT_MUTED, font=get_font(10, bold=True))
        draw.text((dx + 115, ey), val, fill=COLOR_TEXT_MAIN, font=get_font(11, bold=False))
        ey += 28

    ey += 20
    draw.text((dx + 25, ey), "CANALIZAR / CAMBIAR ESTATUS:", fill=COLOR_PRIMARY, font=get_font(11, bold=True))
    ey += 24
    draw.rounded_rectangle([dx + 25, ey, dx + dw - 25, ey + 42], radius=8, fill="#F8FAFC", outline=COLOR_BORDER)
    draw.text((dx + 40, ey + 12), "Asignar a Cuadrilla Operativa 02 (DOPDU) [▼]", fill=COLOR_TEXT_MAIN, font=f_small)

    ey += 55
    draw.rounded_rectangle([dx + 25, ey, dx + dw - 25, ey + 44], radius=8, fill=COLOR_PRIMARY)
    draw.text((dx + 140, ey + 14), "GUARDAR Y CANALIZAR", fill=COLOR_ACCENT, font=get_font(12, bold=True))

    out_path = os.path.join(OUTPUT_DIR, "boceto_05_dashboard_admin_despacho.png")
    img.save(out_path, dpi=(150, 150))
    print(f"Generado: {out_path}")

# ==============================================================================
# BOCETO 6: MÓDULO DE AUTENTICACIÓN (LOGIN Y REGISTRO)
# ==============================================================================
def generate_boceto_6():
    W, H = 1200, 950
    img = Image.new("RGB", (W, H), COLOR_BG)
    draw = ImageDraw.Draw(img)

    draw_annotation_pill(draw, 50, 40, "BOCETO 06: MÓDULO DE ACCESO Y AUTENTICACIÓN (HU-05: JWT / BCRYPT)", get_font(12, bold=True))

    cx, cy = 350, 100
    cw, ch = 500, 780
    draw.rounded_rectangle([cx, cy, cx + cw, cy + ch], radius=24, fill="#FFFFFF", outline=COLOR_BORDER, width=2)

    draw.rounded_rectangle([cx + cw // 2 - 35, cy + 40, cx + cw // 2 + 35, cy + 110], radius=16, fill=COLOR_PRIMARY)
    draw.text((cx + cw // 2 - 18, cy + 55), "SIG", fill=COLOR_ACCENT, font=get_font(18, bold=True))

    draw.text((cx + 140, cy + 130), "Portal SIGIU Oaxaca", fill=COLOR_PRIMARY, font=get_font(20, bold=True))
    draw.text((cx + 105, cy + 162), "Identificación oficial para gestión de reportes urbanos", fill=COLOR_TEXT_MUTED, font=get_font(11))

    draw.rounded_rectangle([cx + 40, cy + 205, cx + cw - 40, cy + 255], radius=10, fill="#F1F5F9")
    draw.rounded_rectangle([cx + 42, cy + 207, cx + cw // 2 - 5, cy + 253], radius=8, fill=COLOR_PRIMARY)
    draw.text((cx + 95, cy + 220), "Iniciar Sesión", fill="#FFFFFF", font=get_font(12, bold=True))
    draw.text((cx + 310, cy + 220), "Registro Ciudadano", fill=COLOR_TEXT_MUTED, font=get_font(12))

    y = cy + 285
    draw.text((cx + 40, y), "Correo Electrónico Institucional o Ciudadano:", fill=COLOR_TEXT_MAIN, font=get_font(11, bold=True))
    draw.rounded_rectangle([cx + 40, y + 22, cx + cw - 40, y + 68], radius=8, fill="#F9FAFB", outline=COLOR_BORDER)
    draw.text((cx + 55, y + 36), "admin@oaxaca.gob.mx", fill=COLOR_TEXT_MAIN, font=get_font(12))

    y += 90
    draw.text((cx + 40, y), "Contraseña de Acceso:", fill=COLOR_TEXT_MAIN, font=get_font(11, bold=True))
    draw.rounded_rectangle([cx + 40, y + 22, cx + cw - 40, y + 68], radius=8, fill="#F9FAFB", outline=COLOR_BORDER)
    draw.text((cx + 55, y + 36), "••••••••••••", fill=COLOR_TEXT_MUTED, font=get_font(14))

    y += 95
    draw.rounded_rectangle([cx + 40, y, cx + cw - 40, y + 54], radius=12, fill=COLOR_PRIMARY, outline=COLOR_ACCENT, width=1)
    draw.text((cx + 185, y + 18), "INGRESAR AL SISTEMA", fill=COLOR_ACCENT, font=get_font(12, bold=True))

    y += 85
    draw.rounded_rectangle([cx + 40, y, cx + cw - 40, y + 140], radius=12, fill="#FDFBF7", outline=COLOR_ACCENT)
    draw.text((cx + 55, y + 15), "REGLAS DE ACCESO BASADAS EN ROLES (RBAC):", fill=COLOR_PRIMARY, font=get_font(10, bold=True))
    draw.text((cx + 55, y + 40), "• Rol Administrador: Redirección automática al Dashboard.", fill=COLOR_TEXT_MUTED, font=get_font(10))
    draw.text((cx + 55, y + 62), "• Rol Operador: Redirección automática a panel de cuadrillas.", fill=COLOR_TEXT_MUTED, font=get_font(10))
    draw.text((cx + 55, y + 84), "• Rol Ciudadano: Acceso a formulario y muro comunitario.", fill=COLOR_TEXT_MUTED, font=get_font(10))
    draw.text((cx + 55, y + 106), "• Autenticación Stateless mediante JWT y encriptación bcrypt.", fill="#15803D", font=get_font(10, bold=True))

    out_path = os.path.join(OUTPUT_DIR, "boceto_06_modulo_autenticacion.png")
    img.save(out_path, dpi=(150, 150))
    print(f"Generado: {out_path}")

if __name__ == "__main__":
    generate_boceto_1()
    generate_boceto_2()
    generate_boceto_3()
    generate_boceto_4()
    generate_boceto_5()
    generate_boceto_6()
    print("¡Todos los bocetos PNG fueron generados con éxito!")
