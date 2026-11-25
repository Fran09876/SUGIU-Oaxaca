import React, { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, X, Check, UploadCloud } from 'lucide-react';

const CameraUpload = ({ selectedFile, onFileSelect, onFileRemove }) => {
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Solo se admiten archivos de imagen (JPG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen excede el límite permitido de 5 Megabytes.');
      return;
    }

    onFileSelect(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearSelection = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    onFileRemove();
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <div className="bg-white/90 rounded-2xl p-4 sm:p-5 border border-mediumGray/30 shadow-sm space-y-3">
      
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slateGray text-lotusWhite shadow-sm">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-charcoal flex items-center gap-1.5">
              Evidencia Fotográfica
              <span className="px-1.5 py-0.5 text-[9px] uppercase font-bold bg-slateGray/15 text-slateGray rounded">
                HU-07
              </span>
            </h4>
            <p className="text-[11px] text-mediumGray">
              Captura con la cámara de tu teléfono o sube una fotografía del lugar
            </p>
          </div>
        </div>

        {selectedFile && (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            <Check className="w-3 h-3 text-emerald-600" />
            Adjuntada
          </span>
        )}
      </div>

      {/* Inputs Ocultos de Cámara y Galería */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />

      {/* Previsualización o Zona de Carga */}
      {previewUrl && selectedFile ? (
        <div className="relative rounded-xl overflow-hidden border-2 border-slateGray bg-charcoal/5 group">
          <img
            src={previewUrl}
            alt="Evidencia seleccionada"
            className="w-full h-48 sm:h-56 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end justify-between p-3 text-white">
            <div className="text-xs">
              <p className="font-semibold truncate max-w-[200px]">{selectedFile.name}</p>
              <p className="text-[10px] text-softSlate">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; {selectedFile.type}
              </p>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-lg"
              title="Quitar fotografía"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
            isDragging
              ? 'border-slateGray bg-slateGray/10 scale-[0.99]'
              : 'border-mediumGray/40 hover:border-slateGray bg-white/60'
          }`}
        >
          <div className="mx-auto w-12 h-12 rounded-full bg-lotusWhite flex items-center justify-center text-slateGray mb-3 shadow-sm border border-mediumGray/30">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-charcoal">
            Arrastra tu fotografía aquí o utiliza los accesos directos
          </p>
          <p className="text-[11px] text-mediumGray mt-0.5">
            Formatos admitidos: JPG, PNG o WEBP (Máximo 5MB)
          </p>

          {/* Botones de Selección */}
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-charcoal text-lotusWhite hover:bg-charcoal-800 transition-colors shadow-sm"
            >
              <Camera className="w-3.5 h-3.5 text-softSlate" />
              <span>Abrir Cámara</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slateGray text-lotusWhite hover:bg-slateGray-600 transition-colors shadow-sm"
            >
              <ImageIcon className="w-3.5 h-3.5 text-softSlate" />
              <span>Galería de Archivos</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CameraUpload;
