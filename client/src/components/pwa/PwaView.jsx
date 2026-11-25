import React, { useState } from 'react';
import IncidentForm from './IncidentForm';
import CitizenFeed from './CitizenFeed';
import GisMapViewer from '../gis/GisMapViewer';
import CitizenHistory from './CitizenHistory';
import { PlusCircle, ListFilter, Map, Sparkles, FolderClock } from 'lucide-react';

const PwaView = ({ onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'feed' | 'map' | 'history'
  const [refreshCounter, setRefreshCounter] = useState(0);

  const handleReportCreated = () => {
    setRefreshCounter((prev) => prev + 1);
    setActiveTab('feed');
  };

  return (
    <div className="space-y-6">
      
      {/* Banner Cívico Municipal */}
      <div className="relative overflow-hidden rounded-3xl bg-charcoal p-6 text-lotusWhite shadow-xl border border-slateGray">
        <div className="relative z-10 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slateGray text-lotusWhite border border-mediumGray/40 text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-softSlate" />
            Atención Municipal en Tiempo Real
          </div>
          <h2 className="font-display font-black text-xl sm:text-2xl tracking-tight text-lotusWhite">
            Tu reporte transforma las calles de Oaxaca
          </h2>
          <p className="text-xs text-softSlate max-w-xl leading-relaxed">
            Levanta reportes de baches, luminarias, fugas y alcantarillas con geolocalización satelital y evidencia fotográfica directa para cuadrillas operativas.
          </p>
        </div>
      </div>

      {/* Selector de Pestañas Innovador */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white/70 p-2 rounded-2xl border border-mediumGray/30 shadow-sm">
        <button
          onClick={() => setActiveTab('report')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'report'
              ? 'bg-charcoal text-lotusWhite shadow-md'
              : 'text-charcoal hover:bg-slateGray/20'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-softSlate" />
          <span>Reportar</span>
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'feed'
              ? 'bg-charcoal text-lotusWhite shadow-md'
              : 'text-charcoal hover:bg-slateGray/20'
          }`}
        >
          <ListFilter className="w-4 h-4 text-softSlate" />
          <span>Muro ({refreshCounter >= 0 ? 'En vivo' : ''})</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'map'
              ? 'bg-charcoal text-lotusWhite shadow-md'
              : 'text-charcoal hover:bg-slateGray/20'
          }`}
        >
          <Map className="w-4 h-4 text-softSlate" />
          <span>Mapa GIS</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'history'
              ? 'bg-charcoal text-lotusWhite shadow-md'
              : 'text-charcoal hover:bg-slateGray/20'
          }`}
        >
          <FolderClock className="w-4 h-4 text-softSlate" />
          <span>Mis Reportes</span>
        </button>
      </div>

      {/* Contenido Dinámico por Pestaña */}
      {activeTab === 'report' && (
        <IncidentForm onReportCreated={handleReportCreated} />
      )}

      {activeTab === 'feed' && (
        <CitizenFeed refreshTrigger={refreshCounter} />
      )}

      {activeTab === 'map' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1 text-charcoal">
            <span className="font-bold">
              Visor Geoespacial Urbano de Oaxaca de Juárez
            </span>
            <span className="text-[11px] text-slateGray font-mono font-semibold">
              WGS84 &bull; PostGIS Activo
            </span>
          </div>
          <GisMapViewer height="520px" showControls={true} />
        </div>
      )}

      {activeTab === 'history' && (
        <CitizenHistory onOpenAuth={onOpenAuth} />
      )}

    </div>
  );
};

export default PwaView;
