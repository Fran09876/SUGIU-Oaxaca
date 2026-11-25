import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';
import { workOrderApi } from '../../api/workOrderApi';
import { userApi } from '../../api/userApi';
import { catalogApi } from '../../api/catalogApi';
import { getFullImageUrl } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { 
  Wrench, 
  Filter, 
  Search, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Send, 
  AlertTriangle,
  Camera,
  X,
  FileText,
  UserCheck,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const OperatorDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [crews, setCrews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [inspectingReport, setInspectingReport] = useState(null);
  const [dispatchReport, setDispatchReport] = useState(null);
  const [selectedCrew, setSelectedCrew] = useState('');
  const [deadline, setDeadline] = useState('');
  const [instructions, setInstructions] = useState('');
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchError, setDispatchError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.estado_id = statusFilter;
      if (priorityFilter) params.prioridad = priorityFilter;
      if (searchTerm) params.search = searchTerm;

      const [repRes, crewRes, catRes] = await Promise.all([
        reportApi.getReports(params),
        userApi.getCrews(),
        catalogApi.getCategories()
      ]);

      if (repRes.success && repRes.data) {
        setReports(repRes.data);
      }
      if (crewRes.success && crewRes.data) {
        setCrews(crewRes.data);
        if (crewRes.data.length > 0) {
          setSelectedCrew(crewRes.data[0].id);
        }
      }
      if (catRes.success && catRes.data) {
        setCategories(catRes.data);
      }
    } catch (err) {
      console.error('Error al cargar datos del operador:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenDispatchModal = (report) => {
    setDispatchReport(report);
    // Establecer fecha límite por defecto a 48 horas en el futuro
    const d = new Date();
    d.setHours(d.getHours() + (report.categoria?.dias_horas_atencion || 48));
    setDeadline(d.toISOString().slice(0, 16));
    setInstructions(`Atención urgente de ${report.titulo}. Inspeccionar perímetro y reparar conforme a normativa municipal.`);
    setDispatchError('');
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCrew) {
      setDispatchError('Debes seleccionar una cuadrilla operativa para asignar la labor.');
      return;
    }

    try {
      setDispatchLoading(true);
      const payload = {
        reporte_id: dispatchReport.id,
        cuadrilla_id: selectedCrew,
        instrucciones: instructions.trim(),
        fecha_limite: deadline,
      };

      const res = await workOrderApi.createWorkOrder(payload);
      if (res.success) {
        setDispatchReport(null);
        await loadData();
      }
    } catch (err) {
      setDispatchError(err.response?.data?.message || 'Error al despachar orden de trabajo.');
    } finally {
      setDispatchLoading(false);
    }
  };

  const kpis = {
    recibidos: reports.filter((r) => r.estado?.nombre === 'Recibido').length,
    asignados: reports.filter((r) => r.estado?.nombre === 'Asignado' || r.estado?.nombre === 'En Validación').length,
    enProceso: reports.filter((r) => r.estado?.nombre === 'En Proceso').length,
    atendidos: reports.filter((r) => r.estado?.nombre === 'Atendido').length,
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Operativo */}
      <div className="bg-charcoal rounded-3xl p-6 text-lotusWhite shadow-xl border border-slateGray flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slateGray border border-mediumGray/40 flex items-center justify-center text-lotusWhite shadow-md">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slateGray text-lotusWhite">
              Mesa de Despacho & Control Operativo (HU-08 / HU-09)
            </span>
            <h2 className="font-display font-black text-xl text-lotusWhite mt-1">
              Consola del Operador: {user?.nombre}
            </h2>
            <p className="text-xs text-softSlate">
              {user?.dependencia?.nombre || 'Dirección de Obras Públicas y Servicios Municipales'}
            </p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slateGray text-lotusWhite hover:bg-slateGray-600 font-bold text-xs border border-mediumGray/40 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sincronizar Tablero</span>
        </button>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-mediumGray/30 shadow-sm text-charcoal">
          <span className="text-[11px] font-bold text-mediumGray uppercase">Recibidos Nuevos</span>
          <p className="text-2xl font-black text-charcoal mt-1">{kpis.recibidos}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-mediumGray/30 shadow-sm text-charcoal">
          <span className="text-[11px] font-bold text-slateGray uppercase">Asignados</span>
          <p className="text-2xl font-black text-slateGray mt-1">{kpis.asignados}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-mediumGray/30 shadow-sm text-charcoal">
          <span className="text-[11px] font-bold text-amber-600 uppercase">En Proceso Campo</span>
          <p className="text-2xl font-black text-amber-600 mt-1">{kpis.enProceso}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-mediumGray/30 shadow-sm text-charcoal">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Resueltos</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{kpis.atendidos}</p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white/80 p-4 rounded-2xl border border-mediumGray/30 shadow-sm flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-mediumGray" />
            <input
              type="text"
              placeholder="Buscar por folio, calle o colonia..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-mediumGray/40 text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-charcoal text-lotusWhite font-bold text-xs hover:bg-charcoal-800 transition-colors"
          >
            Filtrar
          </button>
        </form>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-mediumGray/40 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
          >
            <option value="">Todos los Estados</option>
            <option value="1">1. Recibido</option>
            <option value="2">2. En Validación</option>
            <option value="3">3. Asignado</option>
            <option value="4">4. En Proceso</option>
            <option value="5">5. Atendido</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-mediumGray/40 text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
          >
            <option value="">Todas las Prioridades</option>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
            <option value="Urgente">Urgente</option>
          </select>
        </div>
      </div>

      {/* Tabla de Incidencias Operativas (HU-08) */}
      <div className="bg-white rounded-3xl border border-mediumGray/30 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-charcoal text-lotusWhite uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3.5 px-4">Folio / Fecha</th>
                <th className="py-3.5 px-4">Incidencia / Categoría</th>
                <th className="py-3.5 px-4">Colonia / Ubicación</th>
                <th className="py-3.5 px-4">Prioridad</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4">Apoyos</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mediumGray/20 text-charcoal">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-mediumGray">
                    Cargando reportes desde PostgreSQL...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-mediumGray">
                    No hay incidencias que coincidan con los criterios seleccionados.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-lotusWhite/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-bold text-charcoal block">{report.folio}</span>
                      <span className="text-[10px] text-mediumGray">
                        {new Date(report.createdAt).toLocaleDateString('es-MX')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <span className="font-bold text-charcoal block truncate">{report.titulo}</span>
                      <span className="text-[11px] text-slateGray font-semibold">
                        {report.categoria?.nombre || 'General'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-charcoal block">{report.colonia}</span>
                      <span className="text-[10px] text-mediumGray block truncate max-w-[180px]">
                        {report.direccion_referencia || 'Sin referencias'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          report.prioridad === 'Urgente'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : report.prioridad === 'Alta'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slateGray/15 text-slateGray'
                        }`}
                      >
                        {report.prioridad}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs"
                        style={{ backgroundColor: report.estado?.color_hex || '#3F4B48' }}
                      >
                        {report.estado?.nombre || 'Recibido'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-charcoal">
                      {report.votos_apoyo || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setInspectingReport(report)}
                        className="p-1.5 rounded-lg bg-lotusWhite hover:bg-slateGray/20 text-charcoal font-semibold border border-mediumGray/30 transition-colors"
                        title="Ver detalles"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      {report.estado?.nombre !== 'Atendido' && (
                        <button
                          onClick={() => handleOpenDispatchModal(report)}
                          className="px-2.5 py-1.5 rounded-lg bg-slateGray text-lotusWhite hover:bg-slateGray-600 font-bold text-[11px] transition-colors border border-mediumGray/40 shadow-xs inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Despachar OT (HU-09)</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalle / Inspección de Reporte */}
      {inspectingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-lotusWhite rounded-3xl max-w-lg w-full p-6 border-2 border-slateGray shadow-2xl space-y-4 text-charcoal">
            <div className="flex items-start justify-between border-b border-mediumGray/30 pb-3">
              <div>
                <span className="font-mono text-xs font-bold bg-charcoal text-lotusWhite px-2.5 py-0.5 rounded">
                  {inspectingReport.folio}
                </span>
                <h3 className="font-bold text-base text-charcoal mt-1">{inspectingReport.titulo}</h3>
              </div>
              <button
                onClick={() => setInspectingReport(null)}
                className="p-1 rounded-lg text-mediumGray hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="bg-white p-3 rounded-xl border border-mediumGray/30 leading-relaxed">
                {inspectingReport.descripcion}
              </p>
              <div className="grid grid-cols-2 gap-2 bg-white/70 p-3 rounded-xl border border-mediumGray/20">
                <div>
                  <span className="font-bold text-mediumGray block">Colonia:</span>
                  <span>{inspectingReport.colonia}</span>
                </div>
                <div>
                  <span className="font-bold text-mediumGray block">Dirección:</span>
                  <span>{inspectingReport.direccion_referencia || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-bold text-mediumGray block">Coordenadas:</span>
                  <span className="font-mono">{inspectingReport.latitud}, {inspectingReport.longitud}</span>
                </div>
                <div>
                  <span className="font-bold text-mediumGray block">Apoyos Ciudadanos:</span>
                  <span className="font-bold">{inspectingReport.votos_apoyo || 0}</span>
                </div>
              </div>

              {inspectingReport.evidencias && inspectingReport.evidencias.length > 0 && (
                <div>
                  <span className="font-bold block mb-1">Evidencia Fotográfica Ciudadana:</span>
                  <img
                    src={getFullImageUrl(inspectingReport.evidencias[0].url_imagen)}
                    alt="Evidencia"
                    className="w-full h-44 object-cover rounded-xl border border-mediumGray/30"
                  />
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const rep = inspectingReport;
                setInspectingReport(null);
                handleOpenDispatchModal(rep);
              }}
              className="w-full py-2.5 rounded-xl font-bold bg-slateGray text-lotusWhite hover:bg-slateGray-600 transition-colors text-xs"
            >
              Proceder a Despachar Orden de Trabajo
            </button>
          </div>
        </div>
      )}

      {/* Modal de Despacho de Orden de Trabajo (HU-09) */}
      {dispatchReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-lotusWhite rounded-3xl max-w-lg w-full p-6 border-2 border-slateGray shadow-2xl space-y-4 text-charcoal">
            <div className="flex items-start justify-between border-b border-mediumGray/30 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slateGray text-lotusWhite">
                  Generación de Orden de Trabajo (HU-09)
                </span>
                <h3 className="font-display font-black text-lg text-charcoal mt-1">
                  Despachar Incidencia a Cuadrilla de Campo
                </h3>
                <p className="text-xs text-mediumGray">
                  Folio: <span className="font-mono font-bold text-charcoal">{dispatchReport.folio}</span> &bull; {dispatchReport.titulo}
                </p>
              </div>
              <button
                onClick={() => setDispatchReport(null)}
                className="p-1 rounded-lg text-mediumGray hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-3.5">
              {/* Selección de Cuadrilla */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Seleccionar Cuadrilla Operativa Asignada
                </label>
                <select
                  required
                  value={selectedCrew}
                  onChange={(e) => setSelectedCrew(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-mediumGray/40 bg-white text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                >
                  {crews.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} &bull; {c.email} ({c.dependencia?.siglas || 'Obras'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha Límite */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Fecha y Hora Límite de Cumplimiento (SLA)
                </label>
                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-mediumGray/40 bg-white text-xs font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>

              {/* Instrucciones Técnicas */}
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Instrucciones Técnicas Específicas para Cuadrilla
                </label>
                <textarea
                  rows={3}
                  required
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Instrucciones sobre maquinaria requerida, precauciones de tráfico o materiales a emplear..."
                  className="w-full px-3.5 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>

              {dispatchError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {dispatchError}
                </div>
              )}

              <button
                type="submit"
                disabled={dispatchLoading}
                className="w-full py-3.5 rounded-xl font-bold bg-charcoal text-lotusWhite hover:bg-charcoal-800 border-2 border-slateGray shadow-xl text-xs flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
              >
                {dispatchLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-lotusWhite border-t-transparent rounded-full animate-spin" />
                    <span>Generando Orden de Trabajo en PostgreSQL...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-softSlate" />
                    <span>Generar Orden de Trabajo y Notificar a Cuadrilla</span>
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

export default OperatorDashboard;
