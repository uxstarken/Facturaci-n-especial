'use client';

import React from 'react';
import { FileText, CheckCircle2, AlertCircle, UploadCloud, X, FileSpreadsheet } from 'lucide-react';
import { useTheme } from '@/context/theme-context';

interface AcuerdoComercialSectionProps {
  tipoAcuerdo: string;
  acuerdoPrecargado: string;
  isAcuerdoEditado: boolean;
  archivoExcelTarifa: { nombre: string; tamano: string } | null;
  onSelectTipoAcuerdo: (val: string) => void;
  onToggleEditAcuerdo: () => void;
  onExcelUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveExcel: () => void;
  excelInputRef: React.RefObject<HTMLInputElement | null>;
}

export const AcuerdoComercialSection: React.FC<AcuerdoComercialSectionProps> = ({
  tipoAcuerdo,
  acuerdoPrecargado,
  isAcuerdoEditado,
  archivoExcelTarifa,
  onSelectTipoAcuerdo,
  onToggleEditAcuerdo,
  onExcelUpload,
  onRemoveExcel,
  excelInputRef,
}) => {
  const { theme } = useTheme();

  return (
    <div className="bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-xl p-6 shadow-sm space-y-4">
      {/* HEADER DE LA CARD VISUAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 dark:border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <FileText className={`w-5 h-5 ${theme.accentText}`} />
          <div>
            <h3 className="text-eyebrow font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              Tipo de Acuerdo Comercial
            </h3>
            <span className="text-caption text-gray-600 dark:text-gray-400 font-medium block">
              Modalidad de tarifa y condiciones comerciales pactadas con el cliente
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isAcuerdoEditado ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-500/10 text-amber-900 dark:text-amber-400 border border-amber-300 dark:border-white/10">
              Modificado
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-500/10 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-white/10">
              Precargado del Cliente
            </span>
          )}
        </div>
      </div>

      {/* SELECTOR DE ACUERDO */}
      <div>
        <label className="block text-eyebrow font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
          Seleccionar Tipo de Acuerdo Comercial *
        </label>
        <select
          value={tipoAcuerdo}
          onChange={(e) => onSelectTipoAcuerdo(e.target.value)}
          className="w-full h-10 px-3 bg-gray-50/50 dark:bg-slate-900/50 border border-purple-900/15 dark:border-white/10 rounded-md text-body text-gray-900 dark:text-gray-100 focus:border-purple-600 focus:bg-white dark:focus:bg-slate-800 outline-none cursor-pointer font-medium"
          required
        >
          <option value="Tarifa diferenciada">Tarifa diferenciada</option>
          <option value="Descuento volumétrico">Descuento volumétrico</option>
          <option value="Acuerdo marco">Acuerdo marco</option>
          <option value="Tarifa especial regional">Tarifa especial regional</option>
          <option value="Tarifa Especial Personalizada (vía Excel)">
            Tarifa Especial Personalizada (vía Excel)
          </option>
        </select>

        <div className="flex items-center justify-between mt-2.5 pt-0.5 text-xs">
          <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">
            Base precargada: <strong className="text-gray-900 dark:text-gray-100 font-bold">{acuerdoPrecargado}</strong>
          </span>
          <button
            type="button"
            onClick={onToggleEditAcuerdo}
            className="text-xs font-bold text-purple-700 dark:text-purple-400 underline hover:text-purple-950 dark:hover:text-purple-300 transition-colors py-0.5 px-1.5 rounded hover:bg-purple-50 dark:hover:bg-white/5"
          >
            {isAcuerdoEditado ? 'Restablecer precargado' : 'Modificar tipo de acuerdo'}
          </button>
        </div>
      </div>

      {/* CARGA DE TARIFA ESPECIAL EN EXCEL */}
      {isAcuerdoEditado && (
        <div className="p-4 bg-purple-50/50 dark:bg-purple-500/10 border border-purple-200 dark:border-white/10 rounded-xl space-y-3 shadow-2xs mt-2">
          <div>
            <label className="text-eyebrow font-bold text-purple-950 dark:text-purple-200 uppercase tracking-wider block">
              Carga de Tarifario por Modificación de Acuerdo Comercial
            </label>
            <span className="text-caption text-gray-600 dark:text-gray-400 font-medium">
              Al modificar el tipo de acuerdo comercial precargado del cliente, puedes adjuntar la plantilla o archivo Excel (.xlsx, .xls) con las tarifas especiales acordadas.
            </span>
          </div>

          <div className="pt-1">
            <input
              type="file"
              ref={excelInputRef}
              onChange={onExcelUpload}
              className="hidden"
              accept=".xlsx,.xls"
            />
            {archivoExcelTarifa ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-200 dark:border-white/10 rounded-lg text-body">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-950 dark:text-emerald-300 block">{archivoExcelTarifa.nombre}</span>
                    <span className="text-micro text-emerald-700 dark:text-emerald-400 font-medium">
                      Plantilla de Tarifa Especial ({archivoExcelTarifa.tamano})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onRemoveExcel}
                  className="text-emerald-700 hover:text-red-600 p-1 font-bold text-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => excelInputRef.current?.click()}
                className="border-2 border-dashed border-purple-300 dark:border-white/20 hover:border-purple-600 dark:hover:border-emerald-400 bg-white dark:bg-slate-900/50 hover:bg-purple-50/50 dark:hover:bg-white/5 p-3.5 rounded-lg text-center cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4.5 h-4.5 text-purple-700 dark:text-purple-400" />
                <span className="text-body font-bold text-purple-950 dark:text-purple-200">
                  + Subir Archivo de Tarifario Especial en formato Excel (.xlsx, .xls)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
