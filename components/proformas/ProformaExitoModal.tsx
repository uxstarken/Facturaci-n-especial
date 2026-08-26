'use client';

import React from 'react';
import {
  CheckCircle2,
  Download,
  Mail,
  ArrowRight,
  X,
  AlertTriangle,
} from 'lucide-react';

interface ProformaExitoModalProps {
  isOpen: boolean;
  proformaId: string;
  clienteNombre: string;
  montoFormatted: string;
  totalOfsCount?: number;
  inconsistenciasCount?: number;
  clienteEmail?: string;
  buttonGradient?: string;
  onClose: () => void;
  onFinish: () => void;
}

export const ProformaExitoModal: React.FC<ProformaExitoModalProps> = ({
  isOpen,
  proformaId,
  clienteNombre,
  montoFormatted,
  totalOfsCount = 3345,
  inconsistenciasCount = 14,
  clienteEmail = 'facturacion@cliente.cl',
  buttonGradient = 'from-purple-600 to-indigo-600',
  onClose,
  onFinish,
}) => {
  if (!isOpen) return null;

  const handleDownloadExcel = () => {
    const element = document.createElement('a');
    const content = `==================================================\nPROFORMA COMERCIAL DE FACTURACIÓN ESPECIAL\n==================================================\nID Proforma: ${proformaId}\nCliente: ${clienteNombre}\nMonto Total Neto: ${montoFormatted}\nEstado: CREADA Y REGISTRADA EN EL SISTEMA\nFecha de emisión: ${new Date().toLocaleDateString('es-CL')}\n\nObservaciones: Se encontraron discrepancias en medidas en ${inconsistenciasCount} de las ${totalOfsCount.toLocaleString('es-CL')} OFs consultadas.\n==================================================\nOF,Largo(cm),Ancho(cm),Alto(cm),Peso(kg),Estado\nOF-901,120,80,100,45.5,Discrepancia Cubitaje\nOF-904,60,40,50,12.0,Discrepancia Volumen`;
    const file = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    element.href = URL.createObjectURL(file);
    element.download = `Proforma_${proformaId}_${clienteNombre.replace(/\s+/g, '_')}.xlsx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleOpenOutlook = () => {
    const subject = encodeURIComponent(`Proforma Comercial Validada ${proformaId} - Starken`);
    const body = encodeURIComponent(
      `Estimado cliente ${clienteNombre},\n\nAdjuntamos la Proforma Comercial ${proformaId} debidamente ajustada y validada por la Subgerencia de Facturación Especial Starken.\n\nMonto Final Neto: ${montoFormatted}\n\nQuedamos atentos a cualquier duda.\n\nSaludos cordiales,\nSubgerencia de Facturación Especial Starken`
    );
    window.location.href = `mailto:${clienteEmail}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-900/15 dark:border-white/10 shadow-2xl max-w-xl w-full p-6 space-y-6 relative overflow-hidden">
        {/* ENCABEZADO CON ICONO DE CHECK VERDE Y TEXTOS EXACTOS */}
        <div className="flex items-start justify-between border-b border-gray-100 dark:border-white/10 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-white/10 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 dark:text-gray-100 leading-tight">
                Proforma {proformaId} creada con éxito
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                La proforma comercial para <strong className="font-semibold text-gray-800 dark:text-gray-200">{clienteNombre}</strong> ha sido guardada y registrada en el sistema.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* HELPER / CAJA DE ALERTA DE INCIDENCIAS SEPARADA SOBRE EL CUADRADO MORADO */}
        <div className="p-3.5 bg-amber-50/80 dark:bg-amber-500/10 border border-amber-200/90 dark:border-white/10 rounded-xl text-caption text-amber-950 dark:text-amber-300 flex items-start gap-2.5 shadow-2xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="font-extrabold block text-amber-900 dark:text-amber-200 text-xs">Incidencias detectadas:</strong>
            <p className="leading-relaxed text-amber-900/90 dark:text-amber-300 text-caption">
              Se encontraron discrepancias en medidas en <strong className="font-semibold text-amber-950 dark:text-amber-100">{inconsistenciasCount} de las {totalOfsCount.toLocaleString('es-CL')} OFs</strong> consultadas de <strong className="font-semibold text-amber-950 dark:text-amber-100">{clienteNombre}</strong>.
            </p>
          </div>
        </div>

        {/* CAJA DE RESUMEN MORADA */}
        <div className="p-4 bg-purple-50/60 dark:bg-purple-500/10 border border-purple-100 dark:border-white/10 rounded-xl space-y-2.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Proforma generada:</span>
            <span className="font-extrabold font-mono text-purple-950 dark:text-purple-200 text-body">{proformaId}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Cliente:</span>
            <span className="font-bold text-gray-900 dark:text-gray-100">{clienteNombre}</span>
          </div>

          <div className="flex items-center justify-between pt-1.5 border-t border-purple-100 dark:border-white/10">
            <span className="text-gray-600 dark:text-gray-400 font-medium">Monto final neto:</span>
            <span className="font-extrabold text-purple-950 dark:text-purple-200 text-base font-mono">{montoFormatted}</span>
          </div>
        </div>

        {/* ACCIONES DISPONIBLES CON BOTONES PULIDOS */}
        <div className="space-y-3 pt-1">
          <span className="text-eyebrow font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
            ACCIONES DISPONIBLES
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* ENVIAR POR OUTLOOK (IZQUIERDA) */}
            <button
              type="button"
              onClick={handleOpenOutlook}
              className="p-3.5 bg-white dark:bg-slate-900/50 border border-purple-200/90 dark:border-white/10 hover:border-purple-600 rounded-xl text-xs font-bold text-purple-950 dark:text-purple-200 hover:bg-purple-50/80 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 shadow-2xs group cursor-pointer active:scale-[0.99]"
            >
              <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
              <span>Enviar por correo (Outlook)</span>
            </button>

            {/* DESCARGAR PROFORMA EN EXCEL (DERECHA) */}
            <button
              type="button"
              onClick={handleDownloadExcel}
              className={`p-3.5 bg-gradient-to-r ${buttonGradient} text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.99] group cursor-pointer`}
            >
              <Download className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Descargar proforma (.xlsx)</span>
            </button>
          </div>

          {/* 3ER CTA: FINALIZAR E IR AL INICIO AL PIE */}
          <button
            type="button"
            onClick={onFinish}
            className="w-full mt-2 py-3 px-4 bg-gray-100/90 dark:bg-slate-700/60 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl hover:bg-purple-50 dark:hover:bg-slate-700 hover:text-purple-900 dark:hover:text-purple-300 transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <span>Finalizar e ir al inicio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
