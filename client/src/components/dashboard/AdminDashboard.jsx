import React, { useState, useEffect } from 'react';
import { reportApi } from '../../api/reportApi';
import { catalogApi } from '../../api/catalogApi';
import { userApi } from '../../api/userApi';
import { workOrderApi } from '../../api/workOrderApi';
import { useAuth } from '../../context/AuthContext';
import GisMapViewer from '../gis/GisMapViewer';
import { 
  BarChart3, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Filter, 
  Camera, 
  Wrench, 
  Layers, 
  ShieldCheck,
  RefreshCw,
  Users,
  Building2,
  FolderKanban,
  Check,
  X,
  Plus,
  Edit,
  Power,
  TrendingUp,
  FileText,
  ThumbsUp
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'gis' | 'orders' | 'users' | 'catalogs'
  const [loading, setLoading] = useState(true);

  // Datos globales
  const [analytics, setAnalytics] = useState(null);
  const [reports, setReports] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modales
  const [inspectOrder, setInspectOrder] = useState(null);
  const [inspectReport, setInspectReport] = useState(null);

  // CRUD Usuarios
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userRole, setUserRole] = useState(2); // Operador por defecto
  const [userDept, setUserDept] = useState(1);
  const [userPhone, setUserPhone] = useState('');
  const [userCrudError, setUserCrudError] = useState('');

  // CRUD Catálogos
  const [catalogSubTab, setCatalogSubTab] = useState('categories'); // 'categories' | 'departments'
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catDeptId, setCatDeptId] = useState(1);
  const [catHours, setCatHours] = useState(48);
  const [catColor, setCatColor] = useState('#151719');
  const [catIcon, setCatIcon] = useState('Wrench');

  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptSiglas, setDeptSiglas] = useState('');
  const [deptTitular, setDeptTitular] = useState('');
  const [deptTelefono, setDeptTelefono] = useState('');

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [
        statsRes,
        repRes,
        woRes,
        usrRes,
        roleRes,
        deptRes,
        catRes
      ] = await Promise.all([
        reportApi.getAnalytics(),
        reportApi.getReports(),
        workOrderApi.getWorkOrders(),
        userApi.getUsers(),
        catalogApi.getRoles(),
        catalogApi.getDepartments(),
        catalogApi.getCategories(),
      ]);

      if (statsRes.success) setAnalytics(statsRes.data);
      if (repRes.success) setReports(repRes.data);
      if (woRes.success) setWorkOrders(woRes.data);
      if (usrRes.success) setUsersList(usrRes.data);
      if (roleRes.success) setRoles(roleRes.data);
      if (deptRes.success) setDepartments(deptRes.data);
      if (catRes.success) setCategories(catRes.data);
    } catch (err) {
      console.error('Error al sincronizar datos administrativos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers Usuario
  const handleOpenUserModal = (u = null) => {
    setEditingUser(u);
    if (u) {
      setUserName(u.nombre);
      setUserEmail(u.email);
      setUserPassword('');
      setUserRole(u.rol_id);
      setUserDept(u.dependencia_id || 1);
      setUserPhone(u.telefono || '');
    } else {
      setUserName('');
      setUserEmail('');
      setUserPassword('');
      setUserRole(2);
      setUserDept(1);
      setUserPhone('');
    }
    setUserCrudError('');
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setUserCrudError('');
    try {
      const payload = {
        nombre: userName,
        email: userEmail,
        rol_id: Number(userRole),
        dependencia_id: Number(userDept),
        telefono: userPhone,
      };
      if (userPassword) payload.password = userPassword;

      if (editingUser) {
        await userApi.updateUser(editingUser.id, payload);
      } else {
        if (!userPassword) {
          setUserCrudError('La contraseña es requerida para nuevos usuarios.');
          return;
        }
        await userApi.createUser(payload);
      }
      setUserModalOpen(false);
      loadAllData();
    } catch (err) {
      setUserCrudError(err.response?.data?.message || 'Error al guardar usuario.');
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await userApi.toggleUserStatus(userId);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo actualizar estatus.');
    }
  };

  // Handlers Aprobación de Orden
  const handleApproveWorkOrder = async (orderId) => {
    try {
      const res = await workOrderApi.approveWorkOrder(orderId);
      if (res.success) {
        setInspectOrder(null);
        loadAllData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error al aprobar orden de trabajo.');
    }
  };

  // Handlers Catálogos
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await catalogApi.createCategory({
        nombre: catName,
        descripcion: catDesc,
        dependencia_id: Number(catDeptId),
        dias_horas_atencion: Number(catHours),
        color_hex: catColor,
        icono: catIcon,
      });
      setCategoryModalOpen(false);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear categoría.');
    }
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    try {
      await catalogApi.createDepartment({
        nombre: deptName,
        siglas: deptSiglas,
        titular: deptTitular,
        telefono: deptTelefono,
      });
      setDeptModalOpen(false);
      loadAllData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear dependencia.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado Principal del Panel */}
      <div className="bg-charcoal rounded-3xl p-6 text-lotusWhite shadow-xl border border-slateGray flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slateGray border border-mediumGray/40 flex items-center justify-center text-lotusWhite shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-slateGray text-lotusWhite">
              Gobierno Municipal de Oaxaca de Juárez &bull; Consola Master
            </span>
            <h1 className="font-display font-black text-xl sm:text-2xl text-lotusWhite mt-1">
              Panel Integral de Administración SIGIU
            </h1>
            <p className="text-xs text-softSlate">
              Supervisión de órdenes, despacho de cuadrillas, cartografía PostGIS y gobernanza de catálogos
            </p>
          </div>
        </div>

        <button
          onClick={loadAllData}
          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slateGray text-lotusWhite hover:bg-slateGray-600 font-bold text-xs border border-mediumGray/40 self-start md:self-auto transition-colors shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sincronizar Datos</span>
        </button>
      </div>

      {/* Navegación por Pestañas del Administrador */}
      <div className="flex flex-wrap gap-2 bg-white/70 p-2 rounded-2xl border border-mediumGray/30 shadow-sm">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-charcoal text-lotusWhite shadow-md'
              : 'text-charcoal hover:bg-slateGray/20'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-softSlate" />
          <span>Analítica & Rendición de Cuentas (HU-11)</span>
        </button>

        <button
          onClick={() => setActiveTab('gis')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'gis'
              ? 'bg-charcoal text-lotusWhite shadow-md'
              : 'text-charcoal hover:bg-slateGray/20'
          }`}
        >
          <MapPin className="w-4 h-4 text-softSlate" />
          <span>Mapeo GIS & Despacho</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-charcoal text-lotusWhite shadow-md'
              : 'text-charcoal hover:bg-slateGray/20'
          }`}
        >
          <FolderKanban className="w-4 h-4 text-softSlate" />
          <span>Supervisión de Órdenes ({workOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-charcoal text-lotusWhite shadow-md'
              : 'text-charcoal hover:bg-slateGray/20'
          }`}
        >
          <Users className="w-4 h-4 text-softSlate" />
          <span>Gestión de Usuarios</span>
        </button>

        <button
          onClick={() => setActiveTab('catalogs')}
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'catalogs'
              ? 'bg-charcoal text-lotusWhite shadow-md'
              : 'text-charcoal hover:bg-slateGray/20'
          }`}
        >
          <Building2 className="w-4 h-4 text-softSlate" />
          <span>Catálogos Municipales</span>
        </button>
      </div>

      {/* 1. SECCIÓN: ANALÍTICA Y RENDICIÓN DE CUENTAS (HU-11) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Tarjetas KPI Superiores */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-mediumGray/30 shadow-md text-charcoal">
              <span className="text-xs font-bold text-mediumGray uppercase">Total Incidencias</span>
              <p className="text-3xl font-black text-charcoal mt-1">
                {analytics?.kpis?.total_reportes || reports.length}
              </p>
              <span className="text-[11px] text-slateGray font-semibold mt-1 block">
                {analytics?.kpis?.reportes_recibidos || 0} recibidos recientemente
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-mediumGray/30 shadow-md text-charcoal">
              <span className="text-xs font-bold text-emerald-700 uppercase">% Eficiencia de Resolución</span>
              <p className="text-3xl font-black text-emerald-700 mt-1">
                {analytics?.kpis?.tasa_resolucion_porcentaje || 0}%
              </p>
              <span className="text-[11px] text-mediumGray font-semibold mt-1 block">
                {analytics?.kpis?.reportes_atendidos || 0} concluidos con éxito
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-mediumGray/30 shadow-md text-charcoal">
              <span className="text-xs font-bold text-slateGray uppercase">Tiempo Promedio Atención</span>
              <p className="text-3xl font-black text-slateGray mt-1">
                {analytics?.kpis?.tiempo_promedio_resolucion_horas || 18.5} hrs
              </p>
              <span className="text-[11px] text-mediumGray font-semibold mt-1 block">
                Meta municipal: &lt; 48 hrs
              </span>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-mediumGray/30 shadow-md text-charcoal">
              <span className="text-xs font-bold text-charcoal uppercase">Respaldo Ciudadano</span>
              <p className="text-3xl font-black text-charcoal mt-1">
                {analytics?.kpis?.total_apoyos_ciudadanos || 0}
              </p>
              <span className="text-[11px] text-slateGray font-semibold mt-1 block">
                "A mí también me afecta" emitidos
              </span>
            </div>
          </div>

          {/* Gráficos y Desgloses Estadísticos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Top 5 Colonias con Mayor Incidencia */}
            <div className="bg-white rounded-3xl p-6 border border-mediumGray/30 shadow-md space-y-4 text-charcoal">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-base text-charcoal">
                  Top 5 Colonias con Incidencias
                </h3>
                <span className="text-[10px] font-bold text-mediumGray uppercase">Frecuencia Barrial</span>
              </div>

              <div className="space-y-3">
                {analytics?.top_colonias && analytics.top_colonias.length > 0 ? (
                  analytics.top_colonias.map((c, idx) => {
                    const max = Math.max(...analytics.top_colonias.map((x) => Number(x.conteo))) || 1;
                    const percent = (Number(c.conteo) / max) * 100;
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span>{c.colonia}</span>
                          <span className="font-mono text-slateGray">{c.conteo} reportes</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-lotusWhite overflow-hidden">
                          <div
                            className="h-full bg-charcoal rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-mediumGray">Sin datos de colonias aún.</p>
                )}
              </div>
            </div>

            {/* Distribución por Estado Operativo */}
            <div className="bg-white rounded-3xl p-6 border border-mediumGray/30 shadow-md space-y-4 text-charcoal">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-black text-base text-charcoal">
                  Balance General de Estatus
                </h3>
                <span className="text-[10px] font-bold text-mediumGray uppercase">Flujo de Atención</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-lotusWhite/70 border border-mediumGray/20">
                  <span className="text-xs font-bold text-mediumGray">1. Recibidos</span>
                  <p className="text-xl font-bold text-charcoal mt-1">
                    {reports.filter((r) => r.estado?.nombre === 'Recibido').length}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-lotusWhite/70 border border-mediumGray/20">
                  <span className="text-xs font-bold text-slateGray">2. En Validación</span>
                  <p className="text-xl font-bold text-slateGray mt-1">
                    {reports.filter((r) => r.estado?.nombre === 'En Validación').length}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-lotusWhite/70 border border-mediumGray/20">
                  <span className="text-xs font-bold text-amber-600">3. En Campo / Proceso</span>
                  <p className="text-xl font-bold text-amber-600 mt-1">
                    {reports.filter((r) => r.estado?.nombre === 'En Proceso' || r.estado?.nombre === 'Asignado').length}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800">4. Atendidos / Resueltos</span>
                  <p className="text-xl font-bold text-emerald-800 mt-1">
                    {reports.filter((r) => r.estado?.nombre === 'Atendido').length}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-mediumGray">
                Información auditada en tiempo real según los principios de Transparencia Activa y Rendición de Cuentas (HU-11).
              </p>
            </div>

          </div>

        </div>
      )}

      {/* 2. SECCIÓN: MAPEO GIS & DESPACHO URBANO (HU-10) */}
      {activeTab === 'gis' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 border border-mediumGray/30 shadow-md space-y-3">
            <h3 className="font-display font-black text-base text-charcoal flex items-center gap-2">
              <MapPin className="w-5 h-5 text-slateGray" />
              Cartografía Urbana Municipal (PostGIS WGS84)
            </h3>
            <p className="text-xs text-mediumGray">
              Explora las incidencias georreferenciadas con filtros de capas dinámicos y clústeres espaciales.
            </p>
            <GisMapViewer height="560px" showControls={true} />
          </div>
        </div>
      )}

      {/* 3. SECCIÓN: SUPERVISIÓN DE ÓRDENES DE TRABAJO (HU-09 / HU-13) */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-mediumGray/30 shadow-md overflow-hidden text-charcoal">
            <div className="p-5 border-b border-mediumGray/20 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <h3 className="font-display font-black text-base text-charcoal">
                  Órdenes de Trabajo Despachadas ({workOrders.length})
                </h3>
                <p className="text-xs text-mediumGray">
                  Supervisión de cuadrillas de campo y aprobación de cierre definitivo con evidencia fotográfica.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-charcoal text-lotusWhite uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3.5 px-4">Folio OT</th>
                    <th className="py-3.5 px-4">Incidencia Vinculada</th>
                    <th className="py-3.5 px-4">Cuadrilla Asignada</th>
                    <th className="py-3.5 px-4">Estatus OT</th>
                    <th className="py-3.5 px-4">Fecha Límite</th>
                    <th className="py-3.5 px-4 text-right">Supervisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mediumGray/20 text-charcoal">
                  {workOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-lotusWhite/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-charcoal">
                        {order.folio_orden}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-charcoal block">{order.reporte?.titulo}</span>
                        <span className="text-[11px] text-mediumGray font-mono">{order.reporte?.folio}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-charcoal block">{order.cuadrilla?.nombre || 'Cuadrilla 1'}</span>
                        <span className="text-[10px] text-mediumGray">{order.cuadrilla?.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white ${
                            order.estatus_orden === 'Atendida' || order.estatus_orden === 'Cerrada'
                              ? 'bg-emerald-700'
                              : order.estatus_orden === 'En Proceso'
                              ? 'bg-amber-600'
                              : 'bg-slateGray'
                          }`}
                        >
                          {order.estatus_orden}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-mediumGray">
                        {order.fecha_limite ? new Date(order.fecha_limite).toLocaleString('es-MX') : 'SLA Estándar'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setInspectOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-slateGray text-lotusWhite hover:bg-slateGray-600 font-bold text-[11px] border border-mediumGray/40 shadow-xs transition-colors"
                        >
                          Inspeccionar Evidencias
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Inspección de Orden: Comparador Antes vs Después */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-lotusWhite rounded-3xl max-w-2xl w-full p-6 border-2 border-slateGray shadow-2xl space-y-4 text-charcoal">
            <div className="flex items-start justify-between border-b border-mediumGray/30 pb-3">
              <div>
                <span className="font-mono text-xs font-bold bg-charcoal text-lotusWhite px-2.5 py-0.5 rounded">
                  {inspectOrder.folio_orden}
                </span>
                <h3 className="font-display font-black text-lg text-charcoal mt-1">
                  Inspección y Aprobación de Cierre Definitivo
                </h3>
                <p className="text-xs text-mediumGray">
                  Reporte: <span className="font-bold text-charcoal">{inspectOrder.reporte?.titulo}</span> ({inspectOrder.reporte?.colonia})
                </p>
              </div>
              <button
                onClick={() => setInspectOrder(null)}
                className="p-1 rounded-lg text-mediumGray hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparación Visual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-2xl border border-mediumGray/30 space-y-2">
                <span className="text-xs font-bold text-charcoal block">1. Evidencia Inicial (Ciudadano):</span>
                {inspectOrder.reporte?.evidencias?.[0]?.url_imagen ? (
                  <img
                    src={
                      inspectOrder.reporte.evidencias[0].url_imagen.startsWith('http')
                        ? inspectOrder.reporte.evidencias[0].url_imagen
                        : `http://localhost:5000${inspectOrder.reporte.evidencias[0].url_imagen}`
                    }
                    alt="Evidencia ciudadana"
                    className="w-full h-44 object-cover rounded-xl"
                  />
                ) : (
                  <div className="h-44 bg-lotusWhite rounded-xl flex items-center justify-center text-mediumGray text-xs">
                    Sin foto inicial adjunta
                  </div>
                )}
              </div>

              <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200 space-y-2">
                <span className="text-xs font-bold text-emerald-900 block flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-700" />
                  2. Evidencia de Resolución (Cuadrilla):
                </span>
                {inspectOrder.foto_resolucion ? (
                  <img
                    src={
                      inspectOrder.foto_resolucion.startsWith('http')
                        ? inspectOrder.foto_resolucion
                        : `http://localhost:5000${inspectOrder.foto_resolucion}`
                    }
                    alt="Evidencia de resolución"
                    className="w-full h-44 object-cover rounded-xl"
                  />
                ) : (
                  <div className="h-44 bg-white/70 rounded-xl flex items-center justify-center text-mediumGray text-xs">
                    Aún sin foto de resolución en campo
                  </div>
                )}
              </div>
            </div>

            {/* Notas Técnicas */}
            {inspectOrder.observaciones_cuadrilla && (
              <div className="bg-white p-3.5 rounded-2xl border border-mediumGray/30 text-xs">
                <span className="font-bold text-charcoal block mb-0.5">Bitácora de Cuadrilla:</span>
                <p className="text-mediumGray">{inspectOrder.observaciones_cuadrilla}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex justify-end gap-2 pt-2 border-t border-mediumGray/20">
              <button
                onClick={() => setInspectOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-lotusWhite text-charcoal hover:bg-slateGray/20 transition-colors"
              >
                Cerrar
              </button>

              {inspectOrder.estatus_orden === 'Atendida' && (
                <button
                  onClick={() => handleApproveWorkOrder(inspectOrder.id)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Aprobar Cierre Definitivo</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SECCIÓN: GESTIÓN DE USUARIOS (CRUD COMPLETO) */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-mediumGray/30 shadow-md overflow-hidden text-charcoal">
            <div className="p-5 border-b border-mediumGray/20 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div>
                <h3 className="font-display font-black text-base text-charcoal">
                  Directorio de Cuentas Municipales ({usersList.length})
                </h3>
                <p className="text-xs text-mediumGray">
                  Administración de roles: Administrador, Operador, Cuadrilla y Ciudadano.
                </p>
              </div>
              <button
                onClick={() => handleOpenUserModal()}
                className="px-4 py-2.5 rounded-xl bg-charcoal text-lotusWhite hover:bg-charcoal-800 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 text-softSlate" />
                <span>Crear Nuevo Usuario</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-charcoal text-lotusWhite uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3.5 px-4">Usuario</th>
                    <th className="py-3.5 px-4">Rol Asignado</th>
                    <th className="py-3.5 px-4">Dependencia</th>
                    <th className="py-3.5 px-4">Teléfono</th>
                    <th className="py-3.5 px-4">Estatus</th>
                    <th className="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-mediumGray/20 text-charcoal">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-lotusWhite/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-charcoal block">{u.nombre}</span>
                        <span className="text-[11px] text-mediumGray">{u.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slateGray text-lotusWhite">
                          {u.rol?.nombre || 'Ciudadano'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-mediumGray font-medium">
                        {u.dependencia?.siglas || u.dependencia?.nombre || 'General'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-mediumGray">
                        {u.telefono || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.activo
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenUserModal(u)}
                          className="p-1.5 rounded-lg bg-lotusWhite hover:bg-slateGray/20 text-charcoal transition-colors border border-mediumGray/30"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            u.activo
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                          }`}
                          title={u.activo ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Usuario */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-lotusWhite rounded-3xl max-w-md w-full p-6 border-2 border-slateGray shadow-2xl space-y-4 text-charcoal">
            <div className="flex items-center justify-between border-b border-mediumGray/30 pb-3">
              <h3 className="font-display font-black text-lg text-charcoal">
                {editingUser ? 'Editar Cuenta de Usuario' : 'Crear Nueva Cuenta'}
              </h3>
              <button
                onClick={() => setUserModalOpen(false)}
                className="p-1 rounded-lg text-mediumGray hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">
                  Contraseña {editingUser && '(dejar en blanco para conservar actual)'}
                </label>
                <input
                  type="password"
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Rol</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Dependencia</label>
                  <select
                    value={userDept}
                    onChange={(e) => setUserDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.siglas}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="951-501-5500"
                  className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>

              {userCrudError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                  {userCrudError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-charcoal text-lotusWhite hover:bg-charcoal-800 border-2 border-slateGray shadow-lg text-xs"
              >
                {editingUser ? 'Guardar Cambios' : 'Registrar Cuenta en Base de Datos'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. SECCIÓN: CATÁLOGOS MUNICIPALES (DEPENDENCIAS Y CATEGORÍAS) */}
      {activeTab === 'catalogs' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="flex gap-2 bg-white/70 p-1.5 rounded-2xl border border-mediumGray/30 shadow-sm">
            <button
              onClick={() => setCatalogSubTab('categories')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                catalogSubTab === 'categories'
                  ? 'bg-charcoal text-lotusWhite shadow-md'
                  : 'text-charcoal hover:bg-slateGray/20'
              }`}
            >
              Categorías de Incidencias ({categories.length})
            </button>
            <button
              onClick={() => setCatalogSubTab('departments')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                catalogSubTab === 'departments'
                  ? 'bg-charcoal text-lotusWhite shadow-md'
                  : 'text-charcoal hover:bg-slateGray/20'
              }`}
            >
              Dependencias Municipales ({departments.length})
            </button>
          </div>

          {/* Sub-Pestaña Categorías */}
          {catalogSubTab === 'categories' && (
            <div className="bg-white rounded-3xl border border-mediumGray/30 shadow-md p-5 space-y-4 text-charcoal">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-display font-black text-sm text-charcoal">
                    Catálogo de Incidencias Urbanas
                  </h4>
                  <p className="text-xs text-mediumGray">Tiempos de respuesta SLA configurados</p>
                </div>
                <button
                  onClick={() => setCategoryModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slateGray text-lotusWhite hover:bg-slateGray-600 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Categoría</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl border border-mediumGray/30 bg-lotusWhite/40 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-charcoal">{c.nombre}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slateGray text-lotusWhite">
                        ~{c.dias_horas_atencion}h SLA
                      </span>
                    </div>
                    <p className="text-xs text-mediumGray line-clamp-2">{c.descripcion}</p>
                    <div className="text-[11px] font-semibold text-slateGray pt-1 border-t border-mediumGray/20">
                      {c.dependencia?.siglas || 'Municipio'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Pestaña Dependencias */}
          {catalogSubTab === 'departments' && (
            <div className="bg-white rounded-3xl border border-mediumGray/30 shadow-md p-5 space-y-4 text-charcoal">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-display font-black text-sm text-charcoal">
                    Dependencias y Direcciones Municipales
                  </h4>
                  <p className="text-xs text-mediumGray">Órganos responsables de la atención en Oaxaca</p>
                </div>
                <button
                  onClick={() => setDeptModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-slateGray text-lotusWhite hover:bg-slateGray-600 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nueva Dependencia</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {departments.map((d) => (
                  <div key={d.id} className="p-4 rounded-2xl border border-mediumGray/30 bg-lotusWhite/40 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-xs text-charcoal">{d.nombre}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-charcoal text-lotusWhite">
                        {d.siglas}
                      </span>
                    </div>
                    <p className="text-xs text-mediumGray">Titular: <span className="font-semibold text-charcoal">{d.titular || 'Por asignar'}</span></p>
                    <p className="text-[11px] text-mediumGray">Tel: {d.telefono || 'N/A'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Nueva Categoría */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-lotusWhite rounded-3xl max-w-md w-full p-6 border-2 border-slateGray shadow-2xl space-y-4 text-charcoal">
            <div className="flex items-center justify-between border-b border-mediumGray/30 pb-3">
              <h3 className="font-display font-black text-lg text-charcoal">Nueva Categoría de Incidencia</h3>
              <button onClick={() => setCategoryModalOpen(false)} className="p-1 text-mediumGray">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Desazolve de Drenaje"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Descripción</label>
                <textarea
                  rows={2}
                  required
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Dependencia</label>
                  <select
                    value={catDeptId}
                    onChange={(e) => setCatDeptId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.siglas}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Horas SLA</label>
                  <input
                    type="number"
                    value={catHours}
                    onChange={(e) => setCatHours(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-charcoal text-lotusWhite hover:bg-charcoal-800 text-xs shadow-md"
              >
                Crear Categoría
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nueva Dependencia */}
      {deptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-lotusWhite rounded-3xl max-w-md w-full p-6 border-2 border-slateGray shadow-2xl space-y-4 text-charcoal">
            <div className="flex items-center justify-between border-b border-mediumGray/30 pb-3">
              <h3 className="font-display font-black text-lg text-charcoal">Nueva Dependencia Municipal</h3>
              <button onClick={() => setDeptModalOpen(false)} className="p-1 text-mediumGray">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveDepartment} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Dirección de Alumbrado Público"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Siglas</label>
                  <input
                    type="text"
                    required
                    placeholder="DAP"
                    value={deptSiglas}
                    onChange={(e) => setDeptSiglas(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="951-501-5500"
                    value={deptTelefono}
                    onChange={(e) => setDeptTelefono(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Titular Responsable</label>
                <input
                  type="text"
                  placeholder="Ing. Juan Carlos Morales"
                  value={deptTitular}
                  onChange={(e) => setDeptTitular(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-charcoal text-lotusWhite hover:bg-charcoal-800 text-xs shadow-md"
              >
                Crear Dependencia
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
