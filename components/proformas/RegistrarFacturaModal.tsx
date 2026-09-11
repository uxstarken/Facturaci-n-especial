'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  FileText,
  Receipt,
  Hash,
  Trash2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { Proforma } from '@/lib/types';
import { useToast } from '@/context/toast-context';

interface RegistrarFacturaModalProps {
  proforma: Proforma;
  onClose: () => void;
  onSuccess: (proformaActualizada: Proforma) => void;
}

export function RegistrarFacturaModal({
  proforma,
  onClose,
  onSuccess,
}: RegistrarFacturaModalProps) {
  const { showToast } = useToast();

  const [numeroFactura, setNumeroFactura] = useState('');
  const [fechaFacturacion, setFechaFacturacion] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [archivoFactura, setArchivoFactura] = useState<File | null>(null);
  const [archivoNombreDemo, setArchivoNombreDemo] = useState<string | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArchivoFactura(file);
      setArchivoNombreDemo(file.name);
      setErrorMsg('');
    }
  };

  const handleSimularArchivo = () => {
    const defaultDocName = `Factura_${numeroFactura || 'Oficial'}_${proforma.cliente.replace(/\s+/g, '_')}.pdf`;
    setArchivoNombreDemo(defaultDocName);
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroFactura.trim()) {
      setErrorMsg('Por favor ingresa el número oficial de la factura.');
      return;
    }

    if (!archivoFactura && !archivoNombreDemo) {
      setErrorMsg('Debes adjuntar el documento PDF o imagen de la factura emitida.');
      return;
    }

    setIsSubmitting(true);

    const docFinal =
      archivoFactura?.name ||
      archivoNombreDemo ||
      `Factura_${numeroFactura.trim()}_${proforma.id}.pdf`;

    const fechaFormateada = (() => {
      try {
        const [yyyy, mm, dd] = fechaFacturacion.split('-');
        return `${dd}/${mm}/${yyyy}`;
      } catch {
        return new Date().toLocaleDateString('es-CL');
      }
    })();

    const proformaActualizada: Proforma = {
      ...proforma,
      estado: 'Facturado',
      estadoComercial: 'Facturado',
      numeroFactura: numeroFactura.trim(),
      fechaFacturacion: fechaFormateada,
      archivoFacturaNombre: docFinal,
    };

    showToast(
      `Factura ${numeroFactura.trim()} registrada exitosamente. La proforma ${proforma.id} ha quedado en estado final FACTURADO.`,
      'success',
      5500,
      'Proceso de Facturación Completado'
    );

    onSuccess(proformaActualizada);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Cabecera */}
        <div className="p-5 bg-gradient-to-r from-purple-700 to-indigo-800 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs shadow-inner">
              <Receipt className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-purple-200 block">
                Cierre del ciclo comercial
              </span>
              <h2 className="text-lg font-bold leading-tight">
                Registrar factura emitida
              </h2>
            </div>
          </div>
        </div>

        {/* Resumen Proforma */}
        <div className="px-5 py-3 bg-purple-50/60 dark:bg-purple-950/20 border-b border-purple-100 dark:border-purple-900/30 flex items-center justify-between text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
              <Building2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>{proforma.cliente}</span>
            </div>
            <div className="text-gray-500 dark:text-gray-400 font-mono text-[11px]">
              {proforma.id} · RUT: {proforma.rut}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 uppercase font-semibold block">Monto facturable</span>
            <span className="font-mono font-extrabold text-purple-700 dark:text-purple-300 text-sm">
              {proforma.montoFormatted}
            </span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Número de Factura */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Número de factura oficial <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Hash className="w-4 h-4 absolute left-3 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={numeroFactura}
                onChange={(e) => {
                  setNumeroFactura(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Ej: FAC-894210 o 1092834"
                className="w-full h-10 pl-9 pr-3 text-xs font-mono font-bold bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all"
                required
              />
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">
              Ingresa el folio o número correlativo generado en el sistema de facturación.
            </span>
          </div>

          {/* Adjuntar Documento de Respaldo */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Documento de Factura (PDF / Imagen) <span className="text-rose-500">*</span>
            </label>
            
            {archivoFactura || archivoNombreDemo ? (
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <span className="text-xs font-bold text-purple-950 dark:text-purple-200 block truncate">
                      {archivoFactura?.name || archivoNombreDemo}
                    </span>
                    <span className="text-[10px] text-purple-700 dark:text-purple-400 font-mono">
                      {archivoFactura ? `${(archivoFactura.size / 1024).toFixed(1)} KB` : 'Documento adjunto listo'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setArchivoFactura(null);
                    setArchivoNombreDemo(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar archivo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-gray-50/50 dark:bg-slate-800/40 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400 group-hover:text-purple-600" />
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 text-center">
                    Haz clic para subir o arrastra el documento de la factura
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">PDF, PNG o JPG (Máx 10 MB)</span>
                  <input
                    type="file"
                    accept=".pdf,image/png,image/jpeg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSimularArchivo}
                    className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 hover:text-purple-800 hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <span>⚡ Simular documento de factura automática</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Observaciones Opcionales */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Observaciones / Comentarios Adicionales (Opcional)
            </label>
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej: Factura enviada a tesorería y cliente notificado..."
              rows={2}
              className="w-full p-2.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-white/10 rounded-xl text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all resize-none"
            />
          </div>

          {/* Footer de Acciones */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-extrabold shadow-md shadow-purple-700/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Finalizar'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
