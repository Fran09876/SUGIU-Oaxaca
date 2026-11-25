import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import PwaView from './components/pwa/PwaView';
import AdminDashboard from './components/dashboard/AdminDashboard';
import OperatorDashboard from './components/dashboard/OperatorDashboard';
import CrewMobileView from './components/crew/CrewMobileView';
import AuthModal from './components/auth/AuthModal';

const MainContent = () => {
  const { user, isAuthenticated, isAdmin, isOperator, isCrew, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-lotusWhite text-charcoal flex flex-col font-sans selection:bg-slateGray selection:text-lotusWhite">
      
      {/* Encabezado Institucional Oficial */}
      <Header onOpenAuth={() => setIsAuthModalOpen(true)} />

      {/* Modal de Autenticación / Registro */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Contenedor Principal Responsivo */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* CASO 1: ADMINISTRADOR LOGUEADO -> DASHBOARD ADMINISTRATIVO */}
        {isAuthenticated && isAdmin ? (
          <AdminDashboard />
        ) : isAuthenticated && isOperator ? (
          /* CASO 2: OPERADOR LOGUEADO -> CONSOLA DE DESPACHO HU-08 Y HU-09 */
          <OperatorDashboard />
        ) : isAuthenticated && isCrew ? (
          /* CASO 3: CUADRILLA LOGUEADA -> APP MÓVIL DE CAMPO HU-12 Y HU-13 */
          <CrewMobileView />
        ) : (
          /* CASO 4: CIUDADANO (SIN SESIÓN O CON SESIÓN CIUDADANA) -> PORTAL DE REPORTES Y SEGUIMIENTO */
          <div className="max-w-4xl mx-auto w-full transition-all duration-200">
            <PwaView onOpenAuth={() => setIsAuthModalOpen(true)} />
          </div>
        )}

      </main>

      {/* Pie de Página Institucional */}
      <footer className="bg-charcoal text-lotusWhite/80 border-t border-slateGray/40 py-6 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slateGray text-lotusWhite flex items-center justify-center font-bold text-xs border border-mediumGray/40">
              O
            </div>
            <span>
              <b>SIGIU</b> &bull; Municipio de Oaxaca de Juárez &bull; Dirección de Obras Públicas y Desarrollo Urbano
            </span>
          </div>

          <div className="flex items-center gap-3 text-softSlate text-[11px]">
            <span>Metodología Extreme Programming (XP)</span>
            <span>&bull;</span>
            <span className="text-lotusWhite font-semibold">Iteraciones 0 a 5 Concluidas</span>
            <span>&bull;</span>
            <span>PostgreSQL & PostGIS WGS84</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
