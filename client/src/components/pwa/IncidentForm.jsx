import React, { useState, useEffect } from 'react';
import { catalogApi } from '../../api/catalogApi';
import { reportApi } from '../../api/reportApi';
import GpsDetector from './GpsDetector';
import CameraUpload from './CameraUpload';
import { 
  Wrench, 
  SunMedium, 
  Droplets, 
  Trash2, 
  TrafficCone, 
  AlertTriangle, 
  Send, 
  Clock, 
  CheckCircle,
  Copy,
  ExternalLink,
  MapPin,
  FileText
} from 'lucide-react';

const iconMap = {
  Wrench,
  SunMedium,
  Droplets,
  Trash2,
  TrafficCone,
  AlertTriangle,
};

const coloniasOaxaca = [
  'Centro Histórico',
  'Colonia Reforma',
  'Barrio de Jalatlaco',
  'Barrio del Ex-Marquesado',
  'San Felipe del Agua',
  'Colonia Volcanes',
  'Cinco Señores',
  'Candiani',
  'Santa Rosa Panzacola',
  'La Cascada',
];

const IncidentForm = ({ onReportCreated }) => {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Campos del formulario
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [colonia, setColonia] = useState('Centro Histórico');
  const [direccionReferencia, setDireccionReferencia] = useState('');
  const [prioridad, setPrioridad] = useState('Media');

  // Coordenadas GPS (WGS84)
  const [latitud, setLatitud] = useState(17.0605);
  const [longitud, setLongitud] = useState(-96.7256);

  // Evidencia fotográfica
  const [selectedFile, setSelectedFile] = useState(null);

  // Estado del envío
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdReportReceipt, setCreatedReportReceipt] = useState(null);
  const [copiedFolio, setCopiedFolio] = useState(false);

  useEffect(() => {
    catalogApi.getCategories()
      .then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setSelectedCategory(res.data[0].id);
          }
        }
      })
      .catch((err) => {
        console.error('Error al cargar categorías:', err);
      })
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleLocationChange = (lat, lng) => {
    setLatitud(lat);
    setLongitud(lng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedCategory) {
      setErrorMessage('Por favor selecciona la categoría de la incidencia urbana.');
      return;
    }

    if (!titulo.trim() || titulo.trim().length < 5) {
      setErrorMessage('Ingresa un título claro y representativo (mínimo 5 caracteres).');
      return;
    }

    if (!descripcion.trim() || descripcion.trim().length < 10) {
      setErrorMessage('Detalla la descripción de la falla o riesgo para la cuadrilla (mínimo 10 caracteres).');
      return;
    }

    if (!latitud || !longitud) {
      setErrorMessage('Es indispensable contar con las coordenadas GPS del reporte.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('categoria_id', selectedCategory);
      formData.append('titulo', titulo.trim());
      formData.append('descripcion', descripcion.trim());
      formData.append('colonia', colonia);
      formData.append('direccion_referencia', direccionReferencia.trim());
      formData.append('prioridad', prioridad);
      formData.append('latitud', latitud);
      formData.append('longitud', longitud);

      if (selectedFile) {
        formData.append('evidencia', selectedFile);
      }

      const response = await reportApi.createReport(formData);

      if (response.success && response.data) {
        setCreatedReportReceipt(response.data);
        if (onReportCreated) {
          onReportCreated(response.data);
        }
        // Limpiar formulario
        setTitulo('');
        setDescripcion('');
        setDireccionReferencia('');
        setSelectedFile(null);
      } else {
        throw new Error(response.message || 'No se pudo registrar la incidencia');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al enviar reporte a los servidores municipales.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedFolio(true);
    setTimeout(() => setCopiedFolio(false), 2000);
  };

  return (
    <div className="space-y-6">

      {/* MODAL DE ACUSE OFICIAL AL COMPLETAR REPORTE */}
      {createdReportReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-lotusWhite rounded-3xl max-w-md w-full p-6 border-2 border-slateGray shadow-2xl space-y-4 text-charcoal">
            
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border-2 border-emerald-500">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h3 className="font-display font-bold text-xl text-charcoal">
                ¡Reporte Registrado con Éxito!
              </h3>
              <p className="text-xs text-mediumGray font-medium">
                Tu incidencia ha ingresado al padrón de atención de la Dirección de Obras Públicas y Servicios Municipales.
              </p>
            </div>

            {/* Ficha Oficial de Folio */}
            <div className="bg-charcoal rounded-2xl p-4 text-lotusWhite space-y-3 border border-slateGray">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-softSlate font-bold">
                  Folio Único Oficial
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-slateGray text-lotusWhite font-mono">
                  {createdReportReceipt.estado?.nombre || 'Recibido'}
                </span>
              </div>
              
              <div className="flex items-center justify-between bg-slateGray/40 p-3 rounded-xl border border-mediumGray/30">
                <span className="font-mono text-lg font-bold tracking-wider text-lotusWhite">
                  {createdReportReceipt.folio}
                </span>
                <button
                  onClick={() => copyToClipboard(createdReportReceipt.folio)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slateGray text-lotusWhite hover:bg-slateGray-600 transition-colors border border-mediumGray/40"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedFolio ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>

              <div className="text-xs space-y-1 text-softSlate">
                <div className="flex justify-between">
                  <span>Categoría:</span>
                  <span className="font-semibold text-lotusWhite">{createdReportReceipt.categoria?.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ubicación:</span>
                  <span className="font-semibold text-lotusWhite">{createdReportReceipt.colonia}</span>
                </div>
                <div className="flex justify-between">
                  <span>Coordenadas:</span>
                  <span className="font-mono text-[11px] text-lotusWhite">
                    {Number(createdReportReceipt.latitud).toFixed(5)}, {Number(createdReportReceipt.longitud).toFixed(5)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setCreatedReportReceipt(null)}
              className="w-full py-3 rounded-xl font-bold bg-slateGray text-lotusWhite hover:bg-slateGray-600 transition-all border border-mediumGray/40 shadow-md active:scale-98"
            >
              Aceptar y Continuar
            </button>
          </div>
        </div>
      )}

      {/* FORMULARIO PRINCIPAL */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* 1. SELECCIÓN DE CATEGORÍA INTERACTIVA (EN REJILLA DE TARJETAS TÁCTILES) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
            1. Selecciona el Tipo de Incidencia
          </label>
          
          {loadingCategories ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-20 bg-softSlate/30 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.map((cat) => {
                const IconComponent = iconMap[cat.icono] || AlertTriangle;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-charcoal text-lotusWhite border-mediumGray shadow-lg ring-2 ring-slateGray scale-[1.02]'
                        : 'bg-white/90 text-charcoal border-mediumGray/30 hover:border-slateGray hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <div
                        className={`p-2 rounded-xl ${
                          isSelected ? 'bg-slateGray text-lotusWhite' : 'bg-lotusWhite text-charcoal'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-slateGray/60 text-softSlate' : 'bg-mediumGray/20 text-charcoal'
                      }`}>
                        ~{cat.dias_horas_atencion}h
                      </span>
                    </div>

                    <div>
                      <div className="text-xs font-bold leading-tight line-clamp-1">
                        {cat.nombre}
                      </div>
                      <div className={`text-[10px] mt-0.5 line-clamp-1 ${
                        isSelected ? 'text-softSlate' : 'text-mediumGray'
                      }`}>
                        {cat.dependencia?.siglas || 'Municipio'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. CAPTURA GEOESPACIAL NATIVA (HU-06) */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
            2. Ubicación Exacta del Problema
          </label>
          <GpsDetector
            latitud={latitud}
            longitud={longitud}
            onLocationChange={handleLocationChange}
          />
        </div>

        {/* 3. COLONIA Y REFERENCIAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Colonia o Barrio de Oaxaca
            </label>
            <select
              value={colonia}
              onChange={(e) => setColonia(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-mediumGray/40 bg-white text-xs font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
            >
              {coloniasOaxaca.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Calle y Cruzamiento / Referencias
            </label>
            <input
              type="text"
              placeholder="Ej. Calle Trujano esquina con 20 de Noviembre"
              value={direccionReferencia}
              onChange={(e) => setDireccionReferencia(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
            />
          </div>
        </div>

        {/* 4. TÍTULO Y DESCRIPCIÓN */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Título Breve de la Falla
            </label>
            <input
              type="text"
              placeholder="Ej. Hundimiento de adoquín frente a templo colonial"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1">
              Descripción Detallada
            </label>
            <textarea
              rows={3}
              placeholder="Explica qué ocurre, dimensiones aproximadas del bache o fuga y el riesgo peatonal o vehicular..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
            />
          </div>
        </div>

        {/* 5. NIVEL DE PRIORIDAD CIUDADANA */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1.5">
            Severidad Percibida
          </label>
          <div className="flex items-center gap-2">
            {['Baja', 'Media', 'Alta', 'Urgente'].map((p) => {
              const isSelected = prioridad === p;
              let activeColor = 'bg-slateGray text-lotusWhite border-slateGray';
              if (p === 'Alta') activeColor = 'bg-amber-700 text-white border-amber-700';
              if (p === 'Urgente') activeColor = 'bg-rose-800 text-white border-rose-800';

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrioridad(p)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    isSelected
                      ? `${activeColor} shadow-sm`
                      : 'bg-white text-charcoal border-mediumGray/40 hover:bg-lotusWhite'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. EVIDENCIA FOTOGRÁFICA CON MULTER (HU-07) */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
            3. Registro Visual (Fotografía)
          </label>
          <CameraUpload
            selectedFile={selectedFile}
            onFileSelect={(file) => setSelectedFile(file)}
            onFileRemove={() => setSelectedFile(null)}
          />
        </div>

        {/* MENSAJE DE ERROR */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* BOTÓN DE ENVÍO */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-4 rounded-2xl font-display font-bold text-sm bg-charcoal text-lotusWhite hover:bg-charcoal-800 border-2 border-slateGray shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-60"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-lotusWhite border-t-transparent rounded-full animate-spin" />
              <span>Transmitiendo Reporte a Obras Públicas...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-softSlate" />
              <span>Enviar Reporte Ciudadano Oficial</span>
            </>
          )}
        </button>

      </form>
    </div>
  );
};

export default IncidentForm;
