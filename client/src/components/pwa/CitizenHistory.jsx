import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';
import { useAuth } from '../../context/AuthContext';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin, 
  Camera, 
  ArrowRight,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronRight,
  UserCheck
} from 'lucide-react';

const steps = [
  { id: 1, name: 'Recibido' },
  { id: 2, name: 'En Validación' },
  { id: 3, name: 'Asignado' },
  { id: 4, name: 'En Proceso' },
  { id: 5, name: 'Atendido' }
];

const CitizenHistory = ({ onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folioSearch, setFolioSearch] = useState('');
  const [searchedReport, setSearchedReport] = useState(null);
  const [searchError, setSearchError] = useState('');

  const fetchMyReports = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await reportApi.getMyReports();
      if (res.success && res.data) {
        setReports(res.data);
      }
    } catch (err) {
      console.error('Error al cargar historial de reportes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [isAuthenticated]);

  const handleSearchFolio = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchedReport(null);
    if (!folioSearch.trim()) return;

    try {
      const res = await reportApi.getReports({ search: folioSearch.trim() });
      if (res.success && res.data && res.data.length > 0) {
        setSearchedReport(res.data[0]);
      } else {
        setSearchError(`No se encontró ningún reporte con el folio "${folioSearch.trim()}".`);
      }
    } catch (err) {
      setSearchError('Error al consultar el folio en los servidores.');
    }
  };

  const getStepStatus = (currentStepName, stepName) => {
    const stepOrder = ['Recibido', 'En Validación', 'Asignado', 'En Proceso', 'Atendido'];
    const currentIndex = stepOrder.indexOf(currentStepName);
    const targetIndex = stepOrder.indexOf(stepName);

    if (currentStepName === 'Rechazado') return 'rejected';
    if (currentIndex > targetIndex) return 'completed';
    if (currentIndex === targetIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="space-y-6">
      
      {/* Buscador de Folio Directo */}
      <div className="bg-white/90 p-4 rounded-2xl border border-mediumGray/30 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider flex items-center gap-1.5">
          <Search className="w-4 h-4 text-slateGray" />
          Consulta Directa por Folio de Incidencia
        </h4>
        <form onSubmit={handleSearchFolio} className="flex gap-2">
          <input
            type="text"
            placeholder="Ej. REP-2026-0001"
            value={folioSearch}
            onChange={(e) => setFolioSearch(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-mediumGray/40 bg-white text-xs font-mono text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-charcoal text-lotusWhite font-bold text-xs hover:bg-charcoal-800 transition-colors shadow-sm"
          >
            Rastrear
          </button>
        </form>

        {searchError && (
          <p className="text-xs text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
            {searchError}
          </p>
        )}
      </div>

      {/* Resultado de Búsqueda Individual */}
      {searchedReport && (
        <div className="bg-white rounded-2xl p-5 border-2 border-slateGray shadow-lg space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="font-mono text-xs font-bold bg-charcoal text-lotusWhite px-2.5 py-0.5 rounded">
                {searchedReport.folio}
              </span>
              <h3 className="font-bold text-base text-charcoal mt-2">{searchedReport.titulo}</h3>
              <p className="text-xs text-mediumGray mt-0.5">{searchedReport.colonia} &bull; {searchedReport.direccion_referencia}</p>
            </div>
            <span
              className="text-xs font-bold px-3 py-1 rounded-full text-white"
              style={{ backgroundColor: searchedReport.estado?.color_hex || '#3F4B48' }}
            >
              {searchedReport.estado?.nombre || 'Recibido'}
            </span>
          </div>

          {/* Línea de Tiempo */}
          <div className="pt-2">
            <p className="text-xs font-bold text-charcoal mb-2">Evolución de Atención Municipal:</p>
            <div className="grid grid-cols-5 gap-1.5 text-center">
              {steps.map((st) => {
                const status = getStepStatus(searchedReport.estado?.nombre, st.name);
                let bgClass = 'bg-lotusWhite text-mediumGray border border-mediumGray/30';
                if (status === 'completed') bgClass = 'bg-slateGray text-lotusWhite';
                if (status === 'current') bgClass = 'bg-charcoal text-lotusWhite ring-2 ring-slateGray font-bold';
                return (
                  <div key={st.id} className={`p-2 rounded-xl text-[10px] ${bgClass}`}>
                    {st.name}
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-charcoal bg-lotusWhite/70 p-3 rounded-xl border border-mediumGray/20">
            {searchedReport.descripcion}
          </p>
        </div>
      )}

      {/* Historial de la Cuenta Autenticada */}
      {!isAuthenticated ? (
        <div className="bg-white/80 rounded-2xl p-6 text-center border border-mediumGray/30 space-y-3">
          <UserCheck className="w-10 h-10 text-slateGray mx-auto" />
          <h4 className="font-bold text-sm text-charcoal">Inicia sesión para ver tu historial personal</h4>
          <p className="text-xs text-mediumGray max-w-sm mx-auto">
            Podrás consultar todos tus reportes ciudadanos, recibir notificaciones y dar seguimiento en tiempo real.
          </p>
          <button
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-xl bg-slateGray text-lotusWhite font-bold text-xs hover:bg-slateGray-600 transition-colors shadow-sm"
          >
            Iniciar Sesión / Registro
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-charcoal uppercase tracking-wider">
              Mis Reportes Registrados ({reports.length})
            </h4>
            <button
              onClick={fetchMyReports}
              className="text-xs text-slateGray font-bold hover:underline"
            >
              Actualizar
            </button>
          </div>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-softSlate/30 rounded-2xl" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white/80 rounded-2xl p-6 text-center border border-mediumGray/30 space-y-2">
              <CheckCircle className="w-8 h-8 text-slateGray mx-auto" />
              <p className="font-bold text-xs text-charcoal">Aún no has registrado ninguna incidencia</p>
              <p className="text-[11px] text-mediumGray">Tus folios aparecerán aquí cuando levantes tu primer reporte.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white rounded-2xl p-4 border border-mediumGray/30 shadow-md space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold bg-charcoal text-lotusWhite px-2 py-0.5 rounded">
                        {rep.folio}
                      </span>
                      <h4 className="font-bold text-sm text-charcoal mt-1.5">{rep.titulo}</h4>
                      <p className="text-xs text-mediumGray">{rep.colonia}</p>
                    </div>
                    <span
                      className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: rep.estado?.color_hex || '#3F4B48' }}
                    >
                      {rep.estado?.nombre || 'Recibido'}
                    </span>
                  </div>

                  {/* Pasos */}
                  <div className="grid grid-cols-5 gap-1 pt-1">
                    {steps.map((st) => {
                      const status = getStepStatus(rep.estado?.nombre, st.name);
                      let style = 'bg-lotusWhite text-mediumGray';
                      if (status === 'completed') style = 'bg-slateGray text-lotusWhite';
                      if (status === 'current') style = 'bg-charcoal text-lotusWhite font-bold ring-1 ring-slateGray';
                      return (
                        <div key={st.id} className={`p-1.5 rounded-lg text-center text-[9px] ${style}`}>
                          {st.name}
                        </div>
                      );
                    })}
                  </div>

                  {rep.ordenTrabajo && (
                    <div className="text-[11px] bg-lotusWhite/60 p-2 rounded-xl border border-mediumGray/20 text-charcoal">
                      <span className="font-bold">Orden de Trabajo: </span>
                      <span className="font-mono">{rep.ordenTrabajo.folio_orden}</span> &bull; 
                      <span className="font-semibold text-slateGray ml-1">Estatus: {rep.ordenTrabajo.estatus_orden}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default CitizenHistory;
