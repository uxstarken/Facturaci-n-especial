'use client';

import React from 'react';
import {
  AlertTriangle,
  Sparkles,
  Download,
  CheckCircle2,
  X,
} from 'lucide-react';

interface InconsistenciasVolumetricasModalProps {
  isOpen: boolean;
  proformaId: string;
  clienteNombre: string;
  totalOfsCount: number;
  buttonGradient?: string;
  onClose: () => void;
  onDownload: () => void;
  onEnviarProforma: () => void;
}

export const InconsistenciasVolumetricasModal: React.FC<InconsistenciasVolumetricasModalProps> = ({
  isOpen,
  proformaId,
  clienteNombre,
  totalOfsCount,
  buttonGradient = 'from-purple-600 to-indigo-600',
  onClose,
  onDownload,
  onEnviarProforma,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-900/15 dark:border-white/10 shadow-2xl max-w-lg w-full p-6 space-y-5 relative overflow-hidden">
        
        {/* BOTÓN DE CIERRE (✕) */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ENCABEZADO DE CONFIRMACIÓN DE PROFORMA CREADA */}
        <div className="text-center space-y-2 py-1">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
            ¡Proforma {proformaId} Creada Exitosamente!
          </h2>
          <p className="text-caption text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            La proforma comercial para <strong className="text-gray-900 dark:text-gray-100">{clienteNombre}</strong> ha sido guardada y registrada en el sistema.
          </p>
        </div>

        {/* CAJA DE ADVERTENCIA DE INCONSISTENCIAS / VOLUMETRÍA */}
        <div className="p-3.5 bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/90 dark:border-white/10 rounded-xl text-caption text-amber-950 dark:text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-extrabold block text-amber-900 dark:text-amber-200">Nota de Volumetría:</strong>
            <p className="leading-relaxed text-amber-900/90 dark:text-amber-300">
              Se encontraron discrepancias en medidas en 14 de las {totalOfsCount.toLocaleString('es-CL')} OFs consultadas.
            </p>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN DIRECTA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* BOTÓN 1: DESCARGAR PROFORMA */}
          <button
            type="button"
            onClick={onDownload}
            className="p-3 bg-white dark:bg-slate-900/50 border border-purple-200 dark:border-white/10 hover:border-purple-600 rounded-xl text-xs font-bold text-purple-900 dark:text-purple-200 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 shadow-2xs group cursor-pointer"
          >
            <Download className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
            <span>Descargar Proforma</span>
          </button>

          {/* BOTÓN 2: ENVIAR VÍA OUTLOOK */}
          <button
            type="button"
            onClick={onEnviarProforma}
            className={`p-3 bg-gradient-to-r ${buttonGradient} text-white font-bold text-xs rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Enviar vía Outlook</span>
          </button>
        </div>

      </div>
    </div>
  );
};
