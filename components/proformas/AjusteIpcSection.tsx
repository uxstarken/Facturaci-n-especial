'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

interface AjusteIpcSectionProps {
  aplicaAjusteIpc: 'SI' | 'NO';
  porcentajeIpc: string;
  onToggleAjusteIpc: (val: 'SI' | 'NO') => void;
  onChangePorcentajeIpc: (val: string) => void;
}

export const AjusteIpcSection: React.FC<AjusteIpcSectionProps> = ({
  aplicaAjusteIpc,
  porcentajeIpc,
  onToggleAjusteIpc,
  onChangePorcentajeIpc,
}) => {
  const { theme } = useTheme();

  return (
    <div className="bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
      {/* HEADER DE LA CARD VISUAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-5 h-5 ${theme.accentText}`} />
          <div>
            <h3 className="text-eyebrow font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Ajuste o Aumento (IPC o similar)
            </h3>
            <span className="text-caption text-gray-600 dark:text-gray-400 font-medium block">
              Aplica porcentaje de reajuste tarifario anual o variación del IPC
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 dark:bg-white/5 p-1 rounded-lg border border-purple-900/10 dark:border-white/10">
          <button
            type="button"
            onClick={() => onToggleAjusteIpc('SI')}
            className={`px-3 py-1 rounded text-body font-bold transition-all ${aplicaAjusteIpc === 'SI'
              ? `${theme.accentBg} text-white shadow-xs`
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
          >
            SÍ
          </button>
          <button
            type="button"
            onClick={() => onToggleAjusteIpc('NO')}
            className={`px-3 py-1 rounded text-body font-bold transition-all ${aplicaAjusteIpc === 'NO'
              ? `${theme.accentBg} text-white shadow-xs`
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
          >
            NO
          </button>
        </div>
      </div>

      {aplicaAjusteIpc === 'SI' && (
        <div className="bg-purple-50/50 dark:bg-purple-500/10 p-3.5 rounded-lg border border-purple-100 dark:border-white/10 space-y-2">
          <label className="block text-eyebrow font-semibold text-gray-700 dark:text-gray-300 uppercase">
            Porcentaje de Ajuste / Reajuste IPC (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={porcentajeIpc}
            onChange={(e) => onChangePorcentajeIpc(e.target.value)}
            placeholder="ej: 3.5"
            className="w-full h-9 px-3 bg-white dark:bg-slate-900/50 border border-purple-900/15 dark:border-white/10 rounded-md text-body font-bold text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 max-w-xs"
          />
        </div>
      )}
    </div>
  );
};
