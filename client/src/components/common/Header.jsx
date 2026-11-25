import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Compass, 
  User as UserIcon, 
  LogOut, 
  ChevronDown,
  Building2,
  HardHat
} from 'lucide-react';

const Header = ({ onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const roleName = user?.rol?.nombre || user?.rol || 'Ciudadano';

  return (
    <header className="sticky top-0 z-40 bg-charcoal text-lotusWhite shadow-xl border-b border-slateGray/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Identidad Cívica e Institucional de Oaxaca de Juárez */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-slateGray to-charcoal-800 border border-mediumGray/40 flex items-center justify-center shadow-md flex-shrink-0">
              <Compass className="w-6 h-6 text-lotusWhite" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl sm:text-2xl tracking-tight text-lotusWhite">
                  SIGIU
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-slateGray/60 text-lotusWhite border border-mediumGray/40">
                  Municipio de Oaxaca de Juárez
                </span>
              </div>
              <p className="text-[11px] text-softSlate hidden md:block">
                Sistema Integral de Gestión de Incidencias Urbanas
              </p>
            </div>
          </div>

          {/* Menú de Acceso / Sesión */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slateGray/50 hover:bg-slateGray border border-mediumGray/30 text-xs text-lotusWhite transition-colors shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-charcoal border border-mediumGray/40 text-lotusWhite font-bold flex items-center justify-center text-xs shadow-inner">
                    {user?.nombre?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-semibold text-lotusWhite text-xs leading-none">
                      {user?.nombre?.split(' ')[0]}
                    </div>
                    <div className="text-[10px] text-softSlate font-bold uppercase tracking-wider mt-0.5">
                      {roleName}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-softSlate ml-1" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-charcoal rounded-2xl shadow-2xl border border-slateGray/60 py-2 z-50 text-xs">
                    <div className="px-3.5 py-2.5 border-b border-slateGray/40">
                      <p className="font-bold text-lotusWhite truncate">{user?.nombre}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-block px-2 py-0.5 rounded bg-slateGray text-lotusWhite text-[10px] font-bold uppercase tracking-wider">
                          {roleName}
                        </span>
                        {user?.dependencia && (
                          <span className="text-[10px] text-softSlate truncate">
                            {user.dependencia.siglas || user.dependencia.nombre}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-softSlate truncate mt-1">{user?.email}</p>
                    </div>
                    
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 flex items-center gap-2 text-rose-300 hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span className="font-semibold">Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slateGray text-lotusWhite hover:bg-slateGray-600 border border-mediumGray/50 transition-all shadow-md active:scale-95"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Ingresar al Sistema</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
