import React, { useState, useEffect, useRef } from 'react';
import { reportApi } from '../../api/reportApi';
import { catalogApi } from '../../api/catalogApi';
import { useAuth } from '../../context/AuthContext';
import L from 'leaflet';
import { 
  Layers, 
  MapPin, 
  Maximize2, 
  ThumbsUp, 
  Camera, 
  X, 
  CheckCircle,
  RefreshCw
} from 'lucide-react';

const OAXACA_CENTER = {
  lat: 17.0605,
  lng: -96.7256,
};

const GisMapViewer = ({ height = '520px', showControls = true }) => {
  const { user } = useAuth();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const [geoData, setGeoData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [supportingId, setSupportingId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [geoRes, catRes] = await Promise.all([
        reportApi.getReportsGeoJson(),
        catalogApi.getCategories()
      ]);

      if (geoRes.success && geoRes.data) {
        setGeoData(geoRes.data.features || []);
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Error al cargar datos GIS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Inicializar mapa de Leaflet
  useEffect(() => {
    if (mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [OAXACA_CENTER.lat, OAXACA_CENTER.lng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors &bull; SIGIU Oaxaca',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Pintar los marcadores según la categoría seleccionada
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filteredFeatures = selectedCategory === 'ALL'
      ? geoData
      : geoData.filter((f) => String(f.properties?.categoria_id) === String(selectedCategory));

    filteredFeatures.forEach((feat) => {
      const coords = feat.geometry?.coordinates;
      if (!coords || coords.length < 2) return;
      const [lng, lat] = coords;
      const props = feat.properties || {};

      let pinColor = '#151719'; // Charcoal
      if (props.estado === 'Atendido') pinColor = '#15803D'; // Verde
      else if (props.estado === 'En Proceso') pinColor = '#3F4B48'; // Slate
      else if (props.prioridad === 'Urgente') pinColor = '#B91C1C'; // Rojo
      else if (props.prioridad === 'Alta') pinColor = '#C2410C'; // Naranja

      const customIcon = L.divIcon({
        className: 'custom-gis-pin',
        html: `
          <div style="
            background-color: ${pinColor};
            border: 2px solid #D0D4D7;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.4);
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            <span style="color: #D0D4D7; font-size: 11px; font-weight: 800;">${(props.categoria || 'G').charAt(0)}</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });

      marker.on('click', () => {
        setActiveReport({
          ...props,
          lat,
          lng,
        });
      });

      markersLayerRef.current.addLayer(marker);
    });
  }, [geoData, selectedCategory]);

  const handleSupport = async (reportId) => {
    try {
      setSupportingId(reportId);
      const ciudadanoId = user?.id || '34196c94-3f9d-4183-8981-246c4106dffd';
      const res = await reportApi.supportReport(reportId, ciudadanoId);
      if (res.success) {
        setGeoData((prev) =>
          prev.map((f) =>
            f.properties?.id === reportId
              ? { ...f, properties: { ...f.properties, votos_apoyo: res.votos_apoyo } }
              : f
          )
        );
        if (activeReport?.id === reportId) {
          setActiveReport((prev) => ({ ...prev, votos_apoyo: res.votos_apoyo }));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Ya registraste tu apoyo a este reporte.');
    } finally {
      setSupportingId(null);
    }
  };

  const resetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([OAXACA_CENTER.lat, OAXACA_CENTER.lng], 14);
    }
  };

  return (
    <div className="space-y-3">
      {/* Barra de Filtros por Categoría */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white/90 p-2.5 rounded-2xl border border-mediumGray/30 shadow-sm">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-charcoal flex items-center gap-1 mr-1">
              <Layers className="w-3.5 h-3.5 text-slateGray" />
              Filtro GIS:
            </span>
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-charcoal text-lotusWhite shadow-sm'
                  : 'bg-lotusWhite text-charcoal hover:bg-slateGray/20'
              }`}
            >
              Todos ({geoData.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  String(selectedCategory) === String(c.id)
                    ? 'bg-slateGray text-lotusWhite shadow-sm'
                    : 'bg-lotusWhite/80 text-charcoal hover:bg-slateGray/20'
                }`}
              >
                {c.nombre}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetView}
              className="p-1.5 rounded-xl bg-lotusWhite text-charcoal hover:bg-slateGray/20 transition-colors border border-mediumGray/30"
              title="Centrar en Centro Histórico"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={loadData}
              className="p-1.5 rounded-xl bg-lotusWhite text-charcoal hover:bg-slateGray/20 transition-colors border border-mediumGray/30"
              title="Recargar puntos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}

      {/* Contenedor del Mapa y Drawer de Detalle */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-slateGray shadow-lg bg-slateGray/20">
        <div
          ref={mapContainerRef}
          style={{ height, width: '100%' }}
          className="z-0"
        />

        {/* Modal de Detalle al hacer clic en un Marcador */}
        {activeReport && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-lotusWhite/95 backdrop-blur-md rounded-2xl p-4 border border-slateGray shadow-2xl z-20 space-y-3 text-charcoal animate-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-xs font-bold bg-charcoal text-lotusWhite px-2 py-0.5 rounded">
                  {activeReport.folio}
                </span>
                <span className="ml-2 text-xs font-bold text-slateGray">
                  {activeReport.categoria}
                </span>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="p-1 rounded-lg text-mediumGray hover:text-charcoal hover:bg-slateGray/20"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-charcoal">{activeReport.titulo}</h4>
              <p className="text-xs text-mediumGray mt-0.5">{activeReport.colonia}</p>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-mediumGray/30">
              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slateGray text-lotusWhite">
                {activeReport.estado}
              </span>
              <button
                onClick={() => handleSupport(activeReport.id)}
                disabled={supportingId === activeReport.id}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold text-xs bg-slateGray text-lotusWhite hover:bg-slateGray-600 transition-colors shadow-sm"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Apoyar ({activeReport.votos_apoyo || 0})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GisMapViewer;
