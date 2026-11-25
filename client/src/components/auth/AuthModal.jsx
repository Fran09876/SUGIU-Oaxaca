import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn, UserPlus, Shield, X, AlertCircle } from 'lucide-react';

const coloniasOaxaca = [
  'Centro Histórico',
  'Colonia Reforma',
  'Barrio de Jalatlaco',
  'Barrio del Ex-Marquesado',
  'San Felipe del Agua',
  'Cinco Señores',
  'Candiani',
  'Santa Rosa Panzacola',
  'La Cascada',
];

const AuthModal = ({ isOpen, onClose, defaultTab = 'login' }) => {
  const { login, register, loading, error } = useAuth();
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Campos Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Campos Register
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regColonia, setRegColonia] = useState('Centro Histórico');

  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!loginEmail || !loginPassword) {
      setFormError('Por favor ingresa tu correo y contraseña.');
      return;
    }

    const res = await login(loginEmail, loginPassword);
    if (res.success) {
      onClose();
    } else {
      setFormError(res.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!regNombre || !regEmail || !regPassword) {
      setFormError('Nombre, correo y contraseña son campos requeridos.');
      return;
    }

    const res = await register({
      nombre: regNombre,
      email: regEmail,
      password: regPassword,
      telefono: regTelefono,
      colonia: regColonia,
    });

    if (res.success) {
      onClose();
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-lotusWhite rounded-3xl max-w-md w-full p-6 border-2 border-slateGray shadow-2xl relative space-y-4 text-charcoal">
        
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-mediumGray hover:text-charcoal text-xl font-bold p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-charcoal text-lotusWhite flex items-center justify-center shadow-md border border-slateGray">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-display font-black text-xl text-charcoal">
            Portal SIGIU Oaxaca
          </h3>
          <p className="text-xs text-mediumGray font-medium">
            Ingreso y autenticación oficial en el sistema municipal
          </p>
        </div>

        {/* Selector de Pestaña */}
        <div className="flex bg-white/70 p-1 rounded-xl border border-mediumGray/30">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setFormError('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-charcoal text-lotusWhite shadow-sm'
                : 'text-mediumGray hover:text-charcoal'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setFormError('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-charcoal text-lotusWhite shadow-sm'
                : 'text-mediumGray hover:text-charcoal'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Registro Ciudadano</span>
          </button>
        </div>

        {/* Alerta de Error */}
        {(formError || error) && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{formError || error}</span>
          </div>
        )}

        {/* FORMULARIO LOGIN */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                placeholder="ejemplo@oaxaca.gob.mx"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold bg-slateGray text-lotusWhite hover:bg-slateGray-600 transition-all border border-mediumGray/40 shadow-sm text-xs flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-lotusWhite border-t-transparent rounded-full animate-spin" />
                  <span>Validando en PostgreSQL...</span>
                </>
              ) : (
                <span>Ingresar al Sistema</span>
              )}
            </button>
          </form>
        )}

        {/* FORMULARIO REGISTRO */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-2.5">
            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                placeholder="Ej. José Francisco Pérez"
                value={regNombre}
                onChange={(e) => setRegNombre(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  placeholder="ciudadano@correo.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  placeholder="951-123-4567"
                  value={regTelefono}
                  onChange={(e) => setRegTelefono(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Colonia de Residencia (Municipio de Oaxaca)
              </label>
              <select
                value={regColonia}
                onChange={(e) => setRegColonia(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-slateGray"
              >
                {coloniasOaxaca.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">
                Crear Contraseña (mínimo 6 caracteres)
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-mediumGray/40 bg-white text-xs text-charcoal placeholder:text-softSlate focus:outline-none focus:ring-2 focus:ring-slateGray"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-1 rounded-xl font-bold bg-slateGray text-lotusWhite hover:bg-slateGray-600 transition-all border border-mediumGray/40 shadow-md text-xs flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-lotusWhite border-t-transparent rounded-full animate-spin" />
                  <span>Registrando en base de datos...</span>
                </>
              ) : (
                <span>Completar Registro Ciudadano</span>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default AuthModal;
