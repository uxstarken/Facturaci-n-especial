'use client';

import React from 'react';
import { Layers, CheckCircle2, RotateCcw, Pencil, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

interface ConsolidacionOfsSectionProps {
  consolidarOfs: 'SI-EXACTO' | 'SI-SOLO NOMBRE' | 'NO';
  consolidarOfsPrecargado: 'SI-EXACTO' | 'SI-SOLO NOMBRE' | 'NO';
  detalleConsolidado: string;
  isConsolidadoEditado: boolean;
  isEditingConsolidado: boolean;
  buttonGradient?: string;
  onSelectOption: (opt: 'SI-EXACTO' | 'SI-SOLO NOMBRE' | 'NO') => void;
  onResetConsolidado: () => void;
  onToggleEditConsolidado: () => void;
  onGoPrevStep?: () => void;
  onGoNextStep?: () => void;
}

export const ConsolidacionOfsSection: React.FC<ConsolidacionOfsSectionProps> = ({
  consolidarOfs,
  consolidarOfsPrecargado,
  detalleConsolidado,
  isConsolidadoEditado,
  isEditingConsolidado,
  buttonGradient = 'from-purple-600 to-indigo-600',
  onSelectOption,
  onResetConsolidado,
  onToggleEditConsolidado,
  onGoPrevStep,
  onGoNextStep,
}) => {
  const { theme } = useTheme();

  return (
    <div className="bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
      {/* HEADER DE LA CARD VISUAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Layers className={`w-5 h-5 ${theme.accentText}`} />
          <div>
            <h3 className="text-eyebrow font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Consolidación de Órdenes de Flete (OFs)
            </h3>
            <span className="text-caption text-gray-600 dark:text-gray-400 font-medium block">
              Modalidad de agrupación y consolidado de envíos según acuerdo comercial del cliente
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isConsolidadoEditado ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 border border-amber-300 dark:border-white/10">
              Modificado
            </span>
          ) : isEditingConsolidado ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-400 border border-purple-300 dark:border-white/10">
              En Edición
            </span>
          ) : (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${theme.badgeBg}`}>
              Precargado del Cliente
            </span>
          )}
        </div>
      </div>

      {/* VISTA Y EDICIÓN IN-PLACE */}
      <div className="p-4 bg-purple-50/50 dark:bg-purple-500/10 border border-purple-100/90 dark:border-white/10 rounded-lg text-xs space-y-3">
        <div className="flex items-center justify-between font-bold text-purple-950 dark:text-purple-200">
          <span>Condición Comercial Registrada:</span>
          <span className={`text-[11px] ${theme.accentText} font-medium`}>Acuerdo Consolidación</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed bg-white dark:bg-slate-900/50 p-3 rounded-md border border-purple-100 dark:border-white/10 shadow-2xs">
          {detalleConsolidado}
        </p>

        {/* MODALIDAD ACTIVA (SIEMPRE VISIBLE) */}
        <div className="bg-white dark:bg-slate-900/50 p-3 rounded-md border border-purple-100 dark:border-white/10 text-xs space-y-1">
          <span className="text-gray-500 dark:text-gray-400 font-medium block text-[11px]">Modalidad de Consolidación Activa:</span>
          <span className="font-extrabold text-purple-950 dark:text-purple-200 text-sm block">
            {consolidarOfs === 'SI-EXACTO' && 'Mismo Destino & Fecha de Entrega'}
            {consolidarOfs === 'SI-SOLO NOMBRE' && 'Por Cliente Final'}
            {consolidarOfs === 'NO' && 'No Consolidar (OFs Individuales)'}
          </span>
        </div>

        {/* OPCIONES DE EDICIÓN (SE DESPLIEGAN ABAJO AL EDITAR) */}
        {isEditingConsolidado && (
          <div className="space-y-2 pt-2 border-t border-purple-100/60 dark:border-white/10">
            <label className="block text-eyebrow font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[11px]">
              Selecciona Nueva Modalidad de Consolidación:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => onSelectOption('SI-EXACTO')}
                className={`p-2.5 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center ${consolidarOfs === 'SI-EXACTO'
                  ? 'bg-purple-100/90 dark:bg-purple-500/20 text-purple-900 dark:text-purple-200 border border-purple-600 dark:border-emerald-400 shadow-2xs'
                  : 'bg-white dark:bg-slate-900/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-white/5'
                  }`}
              >
                <span>Mismo Destino & Fecha</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectOption('SI-SOLO NOMBRE')}
                className={`p-2.5 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center ${consolidarOfs === 'SI-SOLO NOMBRE'
                  ? 'bg-purple-100/90 dark:bg-purple-500/20 text-purple-900 dark:text-purple-200 border border-purple-600 dark:border-emerald-400 shadow-2xs'
                  : 'bg-white dark:bg-slate-900/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-white/5'
                  }`}
              >
                <span>Por Cliente Final</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectOption('NO')}
                className={`p-2.5 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center ${consolidarOfs === 'NO'
                  ? 'bg-purple-100/90 dark:bg-purple-500/20 text-purple-900 dark:text-purple-200 border border-purple-600 dark:border-emerald-400 shadow-2xs'
                  : 'bg-white dark:bg-slate-900/50 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-white/5'
                  }`}
              >
                <span>No Consolidar</span>
              </button>
            </div>
          </div>
        )}

        {/* BOTÓN EDITAR CONSOLIDACIÓN / RESTABLECER A LA DERECHA */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-100/60 dark:border-white/10">
          {isConsolidadoEditado && (
            <button
              type="button"
              onClick={onResetConsolidado}
              className="text-xs font-bold text-purple-700 dark:text-purple-400 underline hover:text-purple-950 dark:hover:text-purple-300 transition-colors py-0.5 px-1.5 rounded hover:bg-purple-50 dark:hover:bg-white/5"
            >
              Restablecer Consolidación precargada
            </button>
          )}
          <button
            type="button"
            onClick={onToggleEditConsolidado}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all border ${isEditingConsolidado
              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-white/10 hover:bg-purple-200 dark:hover:bg-purple-500/30 shadow-2xs font-extrabold'
              : 'bg-white dark:bg-slate-900/50 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-white/5 shadow-2xs'
              }`}
          >
            {isEditingConsolidado ? 'Listo / Finalizar Edición' : 'Editar Consolidación'}
          </button>
        </div>
      </div>

      {/* BOTONES NAVEGACIÓN DENTRO DE LA CARD (OPCIONAL) */}
      {(onGoPrevStep || onGoNextStep) && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/10">
          {onGoPrevStep && (
            <button
              type="button"
              onClick={onGoPrevStep}
              className="px-4 h-10 border border-purple-900/20 dark:border-white/10 text-gray-700 dark:text-gray-300 text-body font-semibold rounded-lg hover:bg-purple-50 dark:hover:bg-white/5 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
          )}

          {onGoNextStep && (
            <button
              type="button"
              onClick={onGoNextStep}
              className={`px-6 h-11 bg-gradient-to-r ${buttonGradient} text-white text-body font-bold rounded-lg transition-all inline-flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99]`}
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
