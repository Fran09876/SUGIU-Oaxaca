import React, { useState, useEffect, useRef } from 'react';
import { workOrderApi } from '../../api/workOrderApi';
import { useAuth } from '../../context/AuthContext';
import { 
  HardHat, 
  MapPin, 
  Clock, 
  CheckCircle, 
  Camera, 
  Play, 
  Navigation, 
  AlertTriangle,
  Upload,
  X,
  FileText,
  Calendar,
  Check,
  RefreshCw
} from 'lucide-react';

const CrewMobileView = () => {
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [actionLoading, setActionLoading] = useState(null);

  // Modal de Finalización
  const [completingOrder, setCompletingOrder] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [resolutionPhotoPreview, setResolutionPhotoPreview] = useState(null);
  const [modalError, setModalError] = useState('');

  const fileInputRef = useRef(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await workOrderApi.getMyWorkOrders();
      if (res.success && res.data) {
        setWorkOrders(res.data);
      }
    } catch (err) {
      console.error('Error al cargar órdenes de cuadrilla:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStartWork = async (orderId) => {
    try {
      setActionLoading(orderId);
      const res = await workOrderApi.startWorkOrder(orderId);
      if (res.success) {
        setWorkOrders((prev) =>
          prev.map((o) => (o.id === orderId ? res.data : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al iniciar la orden de trabajo.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenCompleteModal = (order) => {
    setCompletingOrder(order);
    setObservaciones('');
    setResolutionPhoto(null);
    setResolutionPhotoPreview(null);
    setModalError('');
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setModalError('Solo se admiten fotografías (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setModalError('La fotografía supera los 5 MB permitidos.');
      return;
    }

    setResolutionPhoto(file);
    setResolutionPhotoPreview(URL.createObjectURL(file));
    setModalError('');
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionPhoto) {
      setModalError('Es obligatorio adjuntar la fotografía de evidencia de resolución en campo (HU-13).');
      return;
    }

    try {
      setActionLoading(completingOrder.id);
      const formData = new FormData();
      formData.append('observaciones_cuadrilla', observaciones.trim() || 'Trabajo ejecutado satisfactoriamente según especificaciones.');
      formData.append('evidencia_resolucion', resolutionPhoto);

      const res = await workOrderApi.completeWorkOrder(completingOrder.id, formData);
      if (res.success) {
        setWorkOrders((prev) =>
          prev.map((o) => (o.id === completingOrder.id ? res.data : o))
        );
        setCompletingOrder(null);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'Error al enviar evidencia de cierre.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = workOrders.filter((o) => {
    if (filter === 'ACTIVE') return o.estatus_orden === 'Asignada' || o.estatus_orden === 'En Proceso';
    if (filter === 'COMPLETED') return o.estatus_orden === 'Atendida' || o.estatus_orden === 'Cerrada';
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Encabezado Operativo de Cuadrilla */}
      <div className="bg-charcoal rounded-3xl p-5 sm:p-6 text-lotusWhite shadow-xl border border-slateGray flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slateGray border border-mediumGray/40 flex items-center justify-center text-lotusWhite shadow-md">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slateGray text-lotusWhite">
              Operativo de Cuadrilla en Campo (HU-12 / HU-13)
            </span>
            <h2 className="font-display font-black text-xl text-lotusWhite mt-1">
              {user?.nombre || 'Cuadrilla de Obras'}
            </h2>
            <p className="text-xs text-softSlate">
              {user?.dependencia?.nombre || 'Municipio de Oaxaca de Juárez'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slateGray text-lotusWhite hover:bg-slateGray-600 font-bold text-xs border border-mediumGray/40 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Órdenes</span>
        </button>
      </div>

      {/* Píldoras de Filtro */}
      <div className="flex gap-2 bg-white/70 p-1.5 rounded-2xl border border-mediumGray/30 shadow-sm">
        <button
          onClick={() => setFilter('ALL')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'ALL'
              ? 'bg-charcoal text-lotusWhite shadow-md'
              : 'text-charcoal hover:bg-slateGray/20'
          }`}
        >
          Todas ({workOrders.length})
        </button>
        <button
          onClick={() => setFilter('ACTIVE')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'ACTIVE'
              ? 'bg-charcoal text-lotusWhite shadow-md'
              : 'text-charcoal hover:bg-slateGray/20'
          }`}
        >
          Activas en Campo ({workOrders.filter((o) => o.estatus_orden === 'Asignada' || o.estatus_orden === 'En Proceso').length})
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            filter === 'COMPLETED'
              ? 'bg-charcoal text-lotusWhite shadow-md'
              : 'text-charcoal hover:bg-slateGray/20'
          }`}
        >
          Atendidas ({workOrders.filter((o) => o.estatus_orden === 'Atendida' || o.estatus_orden === 'Cerrada').length})
        </button>
      </div>

      {/* Lista de Órdenes */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-softSlate/30 rounded-3xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white/80 rounded-3xl p-8 text-center border border-mediumGray/30 space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-sm text-charcoal">No hay órdenes en esta sección</h4>
          <p className="text-xs text-mediumGray">Tu bandeja operativa está al día.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const report = order.reporte || {};
            const initialPhoto = report.evidencias?.[0]?.url_imagen;
            const fullInitialPhoto = initialPhoto
              ? (initialPhoto.startsWith('http') ? initialPhoto : `http://localhost:5000${initialPhoto}`)
              : null;

            const resolutionPhotoUrl = order.foto_resolucion
              ? (order.foto_resolucion.startsWith('http') ? order.foto_resolucion : `http://localhost:5000${order.foto_resolucion}`)
              : null;

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-5 border border-mediumGray/30 shadow-md space-y-4 text-charcoal"
              >
                {/* Cabecera OT */}
                <div className="flex items-start justify-between gap-2 border-b border-mediumGray/20 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-charcoal text-lotusWhite px-2.5 py-0.5 rounded">
                        {order.folio_orden}
                      </span>
                      <span className="font-mono text-xs font-bold text-slateGray bg-lotusWhite px-2 py-0.5 rounded border border-mediumGray/40">
                        {report.folio}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-charcoal mt-2">{report.titulo}</h3>
                    <p className="text-xs text-mediumGray mt-0.5">{report.categoria?.nombre || 'General'}</p>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full text-white ${
                      order.estatus_orden === 'En Proceso'
                        ? 'bg-amber-600 animate-pulse'
                        : order.estatus_orden === 'Atendida' || order.estatus_orden === 'Cerrada'
                        ? 'bg-emerald-700'
                        : 'bg-slateGray'
                    }`}
                  >
                    {order.estatus_orden}
                  </span>
                </div>

                {/* Ubicación y Navegación */}
                <div className="bg-lotusWhite/60 p-3 rounded-2xl border border-mediumGray/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slateGray flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-charcoal">{report.colonia}</p>
                      <p className="text-mediumGray">{report.direccion_referencia || 'Sin referencias extras'}</p>
                    </div>
                  </div>

                  {report.latitud && report.longitud && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${report.latitud},${report.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-charcoal text-lotusWhite font-bold text-xs hover:bg-charcoal-800 transition-colors shadow-xs self-start sm:self-auto"
                    >
                      <Navigation className="w-3.5 h-3.5 fill-lotusWhite" />
                      <span>Ruta GPS</span>
                    </a>
                  )}
                </div>

                {/* Instrucciones del Operador */}
                {order.instrucciones && (
                  <div className="p-3 bg-white border border-mediumGray/30 rounded-2xl text-xs space-y-1">
                    <span className="font-bold text-charcoal flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slateGray" />
                      Instrucciones de Despacho:
                    </span>
                    <p className="text-charcoal leading-relaxed">{order.instrucciones}</p>
                  </div>
                )}

                {/* Comparación Visual: Foto Inicial vs Foto Resolución */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {fullInitialPhoto && (
                    <div className="border border-mediumGray/30 rounded-2xl overflow-hidden p-2 bg-lotusWhite/30 space-y-1">
                      <span className="font-bold text-charcoal text-[11px] block">Evidencia Inicial (Ciudadano):</span>
                      <img
                        src={fullInitialPhoto}
                        alt="Evidencia ciudadana"
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    </div>
                  )}

                  {resolutionPhotoUrl && (
                    <div className="border border-emerald-300 bg-emerald-50/50 rounded-2xl overflow-hidden p-2 space-y-1">
                      <span className="font-bold text-emerald-800 text-[11px] block flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Evidencia de Resolución (Cuadrilla):
                      </span>
                      <img
                        src={resolutionPhotoUrl}
                        alt="Evidencia de resolución"
                        className="w-full h-32 object-cover rounded-xl"
                      />
                    </div>
                  )}
                </div>

                {/* Bitácora de Cuadrilla si ya concluyó */}
                {order.observaciones_cuadrilla && (
                  <div className="text-xs bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-emerald-900">
                    <span className="font-bold">Bitácora técnica de campo: </span>
                    <span>{order.observaciones_cuadrilla}</span>
                  </div>
                )}

                {/* Botones de Acción de Cuadrilla (HU-12 y HU-13) */}
                <div className="pt-2 border-t border-mediumGray/20 flex flex-wrap items-center justify-end gap-2.5">
                  {order.estatus_orden === 'Asignada' && (
                    <button
                      onClick={() => handleStartWork(order.id)}
                      disabled={actionLoading === order.id}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slateGray text-lotusWhite hover:bg-slateGray-600 border border-mediumGray/40 shadow-sm flex items-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-lotusWhite" />
                      <span>Iniciar Reparación (En Proceso)</span>
                    </button>
                  )}

                  {order.estatus_orden === 'En Proceso' && (
                    <button
                      onClick={() => handleOpenCompleteModal(order)}
                      disabled={actionLoading === order.id}
                      className="px-4 py-2.5 rounded-xl font-bold text-xs bg-charcoal text-lotusWhite hover:bg-charcoal-800 border-2 border-slateGray shadow-md flex items-center gap-1.5 transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Concluir y Subir Evidencia (HU-13)</span>
                    </button>
                  )}

                  {(order.estatus_orden === 'Atendida' || order.estatus_orden === 'Cerrada') && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Labor Concluida Satisfactoriamente
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Concluir Orden con Evidencia Fotográfica (HU-13) */}
      {completingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-lotusWhite rounded-3xl max-w-lg w-full p-6 border-2 border-slateGray shadow-2xl space-y-4 text-charcoal">
            
            <div className="flex items-center justify-between border-b border-mediumGray/30 pb-3">
              <div>
                <span className="font-mono text-xs font-bold bg-charcoal text-lotusWhite px-2.5 py-0.5 rounded">
                  {completingOrder.folio_orden}
                </span>
                <h3 className="font-display font-black text-lg text-charcoal mt-1">
                  Finalizar Reparación en Sitio
                </h3>
              </div>
              <button
                onClick={() => setCompletingOrder(null)}
                className="p-1 rounded-lg text-mediumGray hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-4">
              {/* Bitácora de trabajo */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Bitácora Técnica / Notas de Trabajo Realizado
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalla los trabajos realizados, materiales aplicados (ej. 2m² de asfalto templado) y pruebas realizadas..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>

              {/* Carga obligatoria de foto */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-charcoal">
                  Fotografía de Resolución Obligatoria (HU-13)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />

                {resolutionPhotoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slateGray bg-charcoal/10">
                    <img
                      src={resolutionPhotoPreview}
                      alt="Previsualización de resolución"
                      className="w-full h-44 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setResolutionPhoto(null);
                        setResolutionPhotoPreview(null);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-rose-600 text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-6 border-2 border-dashed border-mediumGray/50 hover:border-slateGray rounded-2xl flex flex-col items-center justify-center gap-2 bg-white/70 transition-colors"
                  >
                    <div className="p-3 rounded-full bg-charcoal text-lotusWhite">
                      <Camera className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-charcoal">
                      Tomar foto de la obra concluida o seleccionar archivo
                    </span>
                    <span className="text-[10px] text-mediumGray">
                      JPG, PNG o WEBP hasta 5MB
                    </span>
                  </button>
                )}
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {modalError}
                </div>
              )}

              <button
                type="submit"
                disabled={actionLoading === completingOrder.id}
                className="w-full py-3.5 rounded-xl font-bold bg-charcoal text-lotusWhite hover:bg-charcoal-800 border-2 border-slateGray shadow-xl text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                {actionLoading === completingOrder.id ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-lotusWhite border-t-transparent rounded-full animate-spin" />
                    <span>Cargando evidencia en PostgreSQL...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Registrar Cierre Oficial y Notificar a Municipio</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default CrewMobileView;
