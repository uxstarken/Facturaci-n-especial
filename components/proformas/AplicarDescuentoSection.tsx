'use client';

import React from 'react';
import { Percent } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/context/theme-context';

interface AplicarDescuentoSectionProps {
  tipoDescuento: 'porcentaje' | 'monto' | 'ninguno';
  valorDescuento: string;
  montoBase: number;
  montoDescuentoCalculado: number;
  montoFinalConDescuento: number;
  onChangeTipoDescuento: (tipo: 'porcentaje' | 'monto' | 'ninguno') => void;
  onChangeValorDescuento: (val: string) => void;
}

export const AplicarDescuentoSection: React.FC<AplicarDescuentoSectionProps> = ({
  tipoDescuento,
  valorDescuento,
  montoBase,
  montoDescuentoCalculado,
  montoFinalConDescuento,
  onChangeTipoDescuento,
  onChangeValorDescuento,
}) => {
  const { theme } = useTheme();

  return (
    <div className="bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
      {/* HEADER DE LA CARD VISUAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Percent className={`w-5 h-5 ${theme.accentText}`} />
          <div>
            <h3 className="text-eyebrow font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Aplicar Descuento Especial
            </h3>
            <span className="text-caption text-gray-600 dark:text-gray-400 font-medium block">
              Descuentos comerciales en porcentaje o monto fijo CLP sobre el subtotal
            </span>
          </div>
        </div>

        <span className={`text-micro font-semibold px-2 py-0.5 rounded ${theme.badgeBg} shrink-0`}>
          Opcional
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-eyebrow font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
            Tipo de Descuento
          </label>
          <select
            value={tipoDescuento}
            onChange={(e) => onChangeTipoDescuento(e.target.value as any)}
            className="w-full h-10 px-3 bg-gray-50/50 dark:bg-slate-900/50 border border-purple-200 dark:border-white/10 rounded-md text-body text-gray-900 dark:text-gray-100 focus:border-purple-600 outline-none font-medium cursor-pointer"
          >
            <option value="porcentaje">Descuento Porcentual (%)</option>
            <option value="monto">Monto Fijo ($ CLP)</option>
            <option value="ninguno">Sin Descuento (0%)</option>
          </select>
        </div>

        {tipoDescuento !== 'ninguno' && (
          <div>
            <label className="block text-eyebrow font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
              {tipoDescuento === 'porcentaje' ? 'Porcentaje de Descuento (%)' : 'Monto de Descuento ($ CLP)'}
            </label>
            <input
              type="number"
              min="0"
              max={tipoDescuento === 'porcentaje' ? '100' : undefined}
              value={valorDescuento}
              onChange={(e) => onChangeValorDescuento(e.target.value)}
              placeholder={tipoDescuento === 'porcentaje' ? 'ej: 10' : 'ej: 500000'}
              className="w-full h-10 px-3 bg-white dark:bg-slate-900/50 border border-purple-200 dark:border-white/10 rounded-md text-body text-gray-900 dark:text-gray-100 focus:border-purple-600 outline-none font-medium"
            />
          </div>
        )}
      </div>

      {/* RESUMEN DE CÁLCULO NETO CON DESCUENTO */}
      <div className="pt-3 border-t border-purple-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between text-body gap-2 bg-purple-50/40 dark:bg-purple-500/10 p-3 rounded-lg">
        <div className="space-y-0.5">
          <span className="text-gray-600 dark:text-gray-400 text-caption">
            Monto Base Subtotal: <strong className="text-gray-800 dark:text-gray-200">{formatCurrency(montoBase)}</strong>
          </span>
          {montoDescuentoCalculado > 0 && (
            <p className="text-caption text-emerald-700 dark:text-emerald-400 font-semibold">
              Descuento aplicado: -{formatCurrency(montoDescuentoCalculado)}{' '}
              {tipoDescuento === 'porcentaje' ? `(${valorDescuento}%)` : ''}
            </p>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900/50 px-3.5 py-1.5 rounded-lg border border-purple-200 dark:border-white/10 text-right shadow-2xs">
          <span className="text-eyebrow text-gray-700 dark:text-gray-300 font-bold uppercase block">Monto Final Neto</span>
          <span className="text-lg font-extrabold text-purple-950 dark:text-purple-200 font-mono">
            {formatCurrency(montoFinalConDescuento)}
          </span>
        </div>
      </div>
    </div>
  );
};
