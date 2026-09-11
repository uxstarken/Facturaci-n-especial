'use client';

import React from 'react';
import { Coins, CheckCircle2, RotateCcw, Pencil, AlertCircle } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

interface CargaValoradaSectionProps {
  valorUf: string;
  montoCargaValoradaUf: string;
  detalleCargaValorada: string;
  cargaValoradaPrecargada: {
    aplica: 'SI' | 'NO';
    valorUf: string;
    montoUf: string;
    detalle: string;
  };
  isCargaValoradaEditada: boolean;
  isEditingCargaValorada: boolean;
  onChangeValorUf: (val: string) => void;
  onChangeMontoCargaValoradaUf: (val: string) => void;
  onResetCargaValorada: () => void;
  onToggleEditCargaValorada: () => void;
}

export const CargaValoradaSection: React.FC<CargaValoradaSectionProps> = ({
  valorUf,
  montoCargaValoradaUf,
  detalleCargaValorada,
  cargaValoradaPrecargada,
  isCargaValoradaEditada,
  isEditingCargaValorada,
  onChangeValorUf,
  onChangeMontoCargaValoradaUf,
  onResetCargaValorada,
  onToggleEditCargaValorada,
}) => {
  const { theme } = useTheme();

  return (
    <div className="bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
      {/* HEADER DE LA CARD VISUAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Coins className={`w-5 h-5 ${theme.accentText}`} />
          <div>
            <h3 className="text-eyebrow font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Carga Valorada (en UF)
            </h3>
            <span className="text-caption text-gray-600 dark:text-gray-400 font-medium block">
              Parámetros y valorización en UF asignados para la cuenta corriente del cliente
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isCargaValoradaEditada ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 border border-amber-300 dark:border-white/10">
              Modificado
            </span>
          ) : isEditingCargaValorada ? (
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
          <span className={`text-[11px] ${theme.accentText} font-medium`}>UF Referencial Hoy: ${valorUf}</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed bg-white dark:bg-slate-900/50 p-3 rounded-md border border-purple-100 dark:border-white/10 shadow-2xs">
          {detalleCargaValorada}
        </p>

        {/* CAMPOS (ACTIVACIÓN EN EL MISMO LUGAR) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="bg-white dark:bg-slate-900/50 p-3 rounded-md border border-purple-100 dark:border-white/10 space-y-1">
            <label className="text-gray-600 dark:text-gray-400 font-bold block text-[11px] uppercase tracking-wider">
              Valor UF Aplicable ($ CLP)
            </label>
            {isEditingCargaValorada ? (
              <input
                type="text"
                value={valorUf}
                onChange={(e) => onChangeValorUf(e.target.value)}
                placeholder="ej: 40844.00"
                className="w-full h-9 px-2.5 bg-purple-50/40 dark:bg-white/5 border border-purple-300 dark:border-white/10 rounded text-sm font-extrabold text-gray-900 dark:text-gray-100 font-mono focus:border-purple-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
                autoFocus
              />
            ) : (
              <span className="font-extrabold text-gray-900 dark:text-gray-100 text-sm font-mono block">
                ${valorUf} CLP
              </span>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900/50 p-3 rounded-md border border-purple-100 dark:border-white/10 space-y-1">
            <label className="text-gray-600 dark:text-gray-400 font-bold block text-[11px] uppercase tracking-wider">
              Tasa / Cobertura Carga Valorada (%)
            </label>
            {isEditingCargaValorada ? (
              <input
                type="text"
                value={montoCargaValoradaUf}
                onChange={(e) => onChangeMontoCargaValoradaUf(e.target.value)}
                placeholder="ej: 0.80%"
                className="w-full h-9 px-2.5 bg-purple-50/40 dark:bg-white/5 border border-purple-300 dark:border-white/10 rounded text-sm font-extrabold text-purple-950 dark:text-purple-200 font-mono focus:border-purple-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all"
              />
            ) : (
              <span className="font-extrabold text-purple-950 dark:text-purple-200 text-sm font-mono block">
                {montoCargaValoradaUf}%
              </span>
            )}
          </div>
        </div>

        {/* ACCIONES A LA DERECHA ABAJO DE LOS CAMPOS */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-purple-100/60 dark:border-white/10">
          {isCargaValoradaEditada && (
            <button
              type="button"
              onClick={onResetCargaValorada}
              className="text-xs font-bold text-purple-700 dark:text-purple-400 underline hover:text-purple-950 dark:hover:text-purple-300 transition-colors py-0.5 px-1.5 rounded hover:bg-purple-50 dark:hover:bg-white/5"
            >
              Restablecer Carga Valorada
            </button>
          )}
          <button
            type="button"
            onClick={onToggleEditCargaValorada}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all border ${isEditingCargaValorada
              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-white/10 hover:bg-purple-200 dark:hover:bg-purple-500/30 shadow-2xs font-extrabold'
              : 'bg-white dark:bg-slate-900/50 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-white/5 shadow-2xs'
              }`}
          >
            {isEditingCargaValorada ? 'Listo / Finalizar Edición' : 'Editar Carga Valorada'}
          </button>
        </div>
      </div>
    </div>
  );
};
