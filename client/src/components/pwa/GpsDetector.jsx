import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Crosshair, CheckCircle2, AlertCircle, RefreshCw, Compass } from 'lucide-react';
import L from 'leaflet';

// Coordenadas emblemáticas de referencia en Oaxaca de Juárez
const OAXACA_CENTER = {
  lat: 17.0605,
  lng: -96.7256,
};

const GpsDetector = ({ latitud, longitud, onLocationChange }) => {
  const [gpsStatus, setGpsStatus] = useState('idle'); // 'idle' | 'locating' | 'success' | 'error'
  const [accuracy, setAccuracy] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const captureGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus('error');
      setErrorMessage('La Geolocation Web API no está soportada por este navegador.');
      return;
    }

    setGpsStatus('locating');
    setErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy: acc } = position.coords;
        setAccuracy(Math.round(acc));
        setGpsStatus('success');
        onLocationChange(latitude, longitude);

        if (mapInstanceRef.current && markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
          mapInstanceRef.current.setView([latitude, longitude], 17);
        }
      },
      (error) => {
        setGpsStatus('error');
        let msg = 'No fue posible acceder al sensor GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permiso de ubicación denegado en el navegador. Puedes seleccionar el punto en el mapa de Oaxaca.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Señal satelital GPS no disponible en este momento.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Tiempo de espera agotado al consultar el sensor de ubicación.';
        }
        setErrorMessage(msg);

        if (!latitud || !longitud) {
          onLocationChange(OAXACA_CENTER.lat, OAXACA_CENTER.lng);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    if (showMapPicker && mapContainerRef.current && !mapInstanceRef.current) {
      const currentLat = latitud ? parseFloat(latitud) : OAXACA_CENTER.lat;
      const currentLng = longitud ? parseFloat(longitud) : OAXACA_CENTER.lng;

      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 16,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Icono con paleta oficial SIGIU (Charcoal + Soft Slate)
      const customIcon = L.divIcon({
        className: 'custom-oaxaca-pin',
        html: `
          <div style="background-color: #151719; border: 2.5px solid #7D8181; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.35);">
            <div style="background-color: #D0D4D7; width: 10px; height: 10px; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([currentLat, currentLng], {
        draggable: true,
        icon: customIcon,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onLocationChange(pos.lat, pos.lng);
        setGpsStatus('success');
      });

      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        onLocationChange(e.latlng.lat, e.latlng.lng);
        setGpsStatus('success');
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (!showMapPicker && mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMapPicker]);

  return (
    <div className="bg-white/90 rounded-2xl p-4 sm:p-5 border border-mediumGray/30 shadow-sm space-y-4">
      
      {/* Encabezado del Módulo GPS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-charcoal text-lotusWhite shadow-sm">
            <Crosshair className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-charcoal flex items-center gap-1.5">
              Geolocalización Satelital (WGS84)
              <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-slateGray/15 text-slateGray rounded">
                HU-06
              </span>
            </h4>
            <p className="text-[11px] text-mediumGray">
              Coordenadas de precisión para la cuadrilla municipal
            </p>
          </div>
        </div>

        {/* Indicador de estado del sensor */}
        {gpsStatus === 'locating' && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-100/80 px-2 py-1 rounded-full animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            Buscando satélite...
          </span>
        )}
        {gpsStatus === 'success' && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-100/90 px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Coordenadas fijadas
          </span>
        )}
      </div>

      {/* Radar Visual y Botón de Captura */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-charcoal via-slateGray to-charcoal p-4 text-lotusWhite flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Gráfico de Radar Circular */}
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 flex items-center justify-center rounded-full bg-charcoal/80 border border-mediumGray/50">
            <div className={`absolute inset-0 rounded-full border border-softSlate/40 ${gpsStatus === 'locating' ? 'gps-radar-pulse' : ''}`} />
            <Compass className={`w-7 h-7 text-softSlate ${gpsStatus === 'locating' ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="text-xs font-semibold text-softSlate uppercase tracking-wide">
              {latitud && longitud ? 'Punto Identificado' : 'Sin fijar ubicación'}
            </div>
            <div className="font-mono text-sm font-bold tracking-tight text-lotusWhite">
              {latitud ? Number(latitud).toFixed(6) : '00.000000'}°, {longitud ? Number(longitud).toFixed(6) : '00.000000'}°
            </div>
            {accuracy && (
              <div className="text-[10px] text-softSlate/80">
                Radio de precisión estimada: ±{accuracy} metros
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={captureGpsLocation}
            disabled={gpsStatus === 'locating'}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slateGray text-lotusWhite hover:bg-slateGray-600 transition-all border border-mediumGray/50 shadow-md active:scale-95 disabled:opacity-50"
          >
            <Navigation className="w-4 h-4 fill-lotusWhite" />
            <span>{gpsStatus === 'locating' ? 'Sincronizando...' : 'Detectar mi GPS'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMapPicker(!showMapPicker)}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-charcoal text-lotusWhite hover:bg-charcoal-800 transition-colors border border-mediumGray/40 shadow-sm"
            title="Seleccionar en mapa"
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alerta de Error si se rechaza permiso */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{errorMessage}</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Haz clic en el mapa para posicionar manualmente el marcador sobre la calle donde observaste el incidente.
            </p>
          </div>
        </div>
      )}

      {/* Selector Cartográfico Interactivo Desplegable */}
      {showMapPicker && (
        <div className="space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs text-mediumGray px-1">
            <span className="font-medium">Arrastra el marcador al lugar exacto de la falla en Oaxaca</span>
            <button
              type="button"
              onClick={() => setShowMapPicker(false)}
              className="text-slateGray font-bold hover:underline"
            >
              Cerrar visor
            </button>
          </div>
          <div
            ref={mapContainerRef}
            className="w-full h-56 rounded-xl border-2 border-mediumGray/40 overflow-hidden shadow-inner z-0"
          />
        </div>
      )}

    </div>
  );
};

export default GpsDetector;
