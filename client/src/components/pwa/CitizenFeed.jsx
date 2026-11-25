import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';
import { useAuth } from '../../context/AuthContext';
import { 
  MapPin, 
  Search, 
  CheckCircle, 
  Camera, 
  ThumbsUp,
  X
} from 'lucide-react';

const CitizenFeed = ({ refreshTrigger }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [supportingId, setSupportingId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filterCategory) params.categoria_id = filterCategory;

      const res = await reportApi.getReports(params);
      if (res.success && res.data) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Error al cargar reporte ciudadano:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [refreshTrigger, filterCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleSupport = async (reportId) => {
    try {
      setSupportingId(reportId);
      const ciudadanoId = user?.id || '34196c94-3f9d-4183-8981-246c4106dffd'; // Fallback a ciudadano demo si no hay sesión
      const res = await reportApi.supportReport(reportId, ciudadanoId);
      if (res.success) {
        setReports((prev) =>
          prev.map((r) =>
            r.id === reportId ? { ...r, votos_apoyo: res.votos_apoyo } : r
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Ya registraste tu apoyo a este reporte.');
    } finally {
      setSupportingId(null);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Modal de Previsualización de Evidencia Fotográfica */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/85 backdrop-blur-sm animate-in fade-in"
        >
          <div className="max-w-2xl w-full bg-charcoal rounded-2xl overflow-hidden border border-slateGray p-3 relative text-lotusWhite shadow-2xl">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg text-softSlate hover:text-lotusWhite hover:bg-slateGray/40 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewImage}
              alt="Evidencia en resolución completa"
              className="w-full max-h-[75vh] object-contain rounded-xl bg-black/40"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="mt-3 w-full py-2.5 bg-slateGray text-lotusWhite hover:bg-slateGray-600 font-bold text-xs rounded-xl border border-mediumGray/40"
            >
              Cerrar Visualizador
            </button>
          </div>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white/80 p-3 rounded-2xl border border-mediumGray/30 shadow-sm space-y-2">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-mediumGray" />
            <input
              type="text"
              placeholder="Buscar por folio, calle o colonia de Oaxaca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-mediumGray/40 text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-charcoal text-lotusWhite font-semibold text-xs hover:bg-charcoal-800 transition-colors shadow-sm"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Indicador de Conteo */}
      <div className="flex items-center justify-between px-1 text-xs text-charcoal">
        <span className="font-semibold">
          Incidencias Reportadas en la Comunidad ({reports.length})
        </span>
        <button
          onClick={fetchReports}
          className="text-slateGray font-bold hover:underline text-[11px]"
        >
          Actualizar lista
        </button>
      </div>

      {/* Lista de Tarjetas de Reportes */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 bg-softSlate/30 rounded-2xl" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-10 bg-white/70 rounded-2xl border border-mediumGray/30 p-6 space-y-2">
          <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-charcoal text-sm">No se encontraron reportes coincidentes</h4>
          <p className="text-xs text-mediumGray">
            Puedes ser el primero en levantar un reporte ciudadano utilizando la pestaña "Reportar".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const hasEvidence = report.evidencias && report.evidencias.length > 0;
            const evidenceUrl = hasEvidence 
              ? (report.evidencias[0].url_imagen.startsWith('http') 
                  ? report.evidencias[0].url_imagen 
                  : `http://localhost:5000${report.evidencias[0].url_imagen}`)
              : null;

            return (
              <div
                key={report.id}
                className="bg-white/95 rounded-2xl p-4 border border-mediumGray/30 shadow-md hover:border-slateGray transition-all space-y-3 text-charcoal"
              >
                {/* Cabecera de la tarjeta: Folio, Categoría y Estado */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-charcoal bg-lotusWhite px-2 py-0.5 rounded border border-mediumGray/40">
                      {report.folio}
                    </span>
                    <span className="text-[11px] font-semibold text-slateGray bg-slateGray/10 px-2 py-0.5 rounded-full">
                      {report.categoria?.nombre || 'General'}
                    </span>
                  </div>

                  <span
                    className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full text-white shadow-xs"
                    style={{ backgroundColor: report.estado?.color_hex || '#3F4B48' }}
                  >
                    {report.estado?.nombre || 'Recibido'}
                  </span>
                </div>

                {/* Título y Descripción */}
                <div>
                  <h4 className="font-bold text-sm text-charcoal leading-snug">
                    {report.titulo}
                  </h4>
                  <p className="text-xs text-mediumGray mt-1 line-clamp-2 leading-relaxed">
                    {report.descripcion}
                  </p>
                </div>

                {/* Ubicación y Coordenadas */}
                <div className="flex items-center gap-2 text-[11px] text-charcoal bg-lotusWhite/70 p-2 rounded-xl border border-mediumGray/20">
                  <MapPin className="w-3.5 h-3.5 text-slateGray flex-shrink-0" />
                  <span className="font-medium truncate">
                    {report.colonia} &bull; {report.direccion_referencia || 'Oaxaca de Juárez'}
                  </span>
                </div>

                {/* Evidencia fotográfica miniatura (si existe) y Acciones */}
                <div className="flex items-center justify-between pt-1 border-t border-mediumGray/20">
                  
                  {/* Botón de ver foto */}
                  {evidenceUrl ? (
                    <button
                      type="button"
                      onClick={() => setPreviewImage(evidenceUrl)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slateGray hover:text-charcoal transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-slateGray" />
                      <span>Ver Fotografía ({report.evidencias.length})</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-mediumGray">Sin fotografía</span>
                  )}

                  {/* Sistema de Apoyo "A mí también me afecta" (HU-10) */}
                  <button
                    type="button"
                    onClick={() => handleSupport(report.id)}
                    disabled={supportingId === report.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-lotusWhite text-charcoal border border-mediumGray/50 hover:bg-slateGray hover:text-lotusWhite transition-all active:scale-95 shadow-xs"
                    title="Apoyar este reporte para elevar la prioridad municipal"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>A mí también me afecta ({report.votos_apoyo || 0})</span>
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default CitizenFeed;
