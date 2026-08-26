'use client';

import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  XCircle,
  FileImage,
  ShieldAlert,
  ArrowRight,
  FileText,
  Calendar,
} from 'lucide-react';
import { Proforma } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface TrazabilidadModalProps {
  proforma: Proforma;
  onClose: () => void;
}

export function TrazabilidadModal({ proforma, onClose }: TrazabilidadModalProps) {
  const historial = proforma.historialVersiones || [
    {
      version: 'v1' as const,
      fechaCreacion: proforma.fecha,
      monto: proforma.monto,
    },
  ];

  const esDerivadaCAM = proforma.estado === 'Derivada a CAM' || (proforma.conteoRechazos || 0) >= 2;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-150 relative max-h-[90vh] overflow-y-auto">
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b border-gray-100 dark:border-white/10 pb-3 pr-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-micro font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Historial de Iteraciones & Auditoría
            </span>
            <span
              className={`text-micro font-bold px-2 py-0.5 rounded-full border ${
                esDerivadaCAM
                  ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300'
                  : proforma.estado === 'Aprobada por Cliente'
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                  : 'bg-purple-50 dark:bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-300'
              }`}
            >
              {proforma.estado}
            </span>
          </div>
          <h3 className="text-title-2 font-extrabold text-gray-900 dark:text-gray-100">
            Trazabilidad de Proforma: {proforma.id}
          </h3>
          <p className="text-caption text-gray-500 font-medium">
            Cliente: <strong className="text-gray-800 dark:text-gray-200">{proforma.cliente}</strong> · RUT: {proforma.rut}
          </p>
        </div>

        {/* Banner Especial si fue Derivada a CAM */}
        {esDerivadaCAM && (
          <div className="p-4 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-400 dark:border-amber-500/30 rounded-xl space-y-1.5 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-caption">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <span>PROFORMA DERIVADA AUTOMÁTICAMENTE A CAM (2 RECHAZOS ALCANZADOS)</span>
            </div>
            <p className="text-body text-gray-700 dark:text-gray-300 leading-relaxed pl-7">
              Esta proforma acumuló 2 rechazos consecutivos por parte del cliente. Conforme a las normas de gobernanza de Facturación Especial, la emisión de una <strong>Proforma v3 estándar está bloqueada</strong> y la gestión comercial fue traspasada directamente a la <strong>Subgerencia / Ejecutivo CAM</strong>.
            </p>
          </div>
        )}

        {/* Timeline de Versiones */}
        <div className="space-y-4 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-purple-200 dark:before:bg-white/10">
          {historial.map((item, idx) => {
            const isRechazado = !!item.fechaRechazo;
            const isAprobado = !!item.fechaAprobacion;

            return (
              <div key={idx} className="relative pl-12 space-y-2">
                {/* Node Icon */}
                <div
                  className={`absolute left-2.5 top-0 -translate-x-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-micro shadow-2xs ${
                    isAprobado
                      ? 'bg-emerald-500 border-white text-white'
                      : isRechazado
                      ? 'bg-rose-500 border-white text-white'
                      : 'bg-purple-600 border-white text-white'
                  }`}
                >
                  {idx + 1}
                </div>

                {/* Card de la Versión */}
                <div className="bg-purple-50/40 dark:bg-slate-900/50 border border-purple-900/10 dark:border-white/10 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-caption uppercase tracking-wider text-purple-950 dark:text-purple-200">
                        Proforma {item.version.toUpperCase()}
                      </span>
                      <span className="font-mono text-caption font-extrabold text-purple-900 dark:text-purple-300">
                        ({formatCurrency(item.monto)})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-micro font-bold">
                      {isAprobado ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 rounded-md inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Aprobada
                        </span>
                      ) : isRechazado ? (
                        <span className="px-2 py-0.5 bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 rounded-md inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rechazada por Cliente
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 rounded-md inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> En Validación
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Grid de Fechas Auditables */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-caption">
                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-purple-900/10 dark:border-white/10 space-y-1">
                      <span className="text-micro font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-600" /> Fecha y Hora de Creación
                      </span>
                      <strong className="text-gray-900 dark:text-gray-100 font-mono block">
                        {item.fechaCreacion}
                      </strong>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-purple-900/10 dark:border-white/10 space-y-1">
                      <span className="text-micro font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-600" /> Fecha y Hora de Respuesta
                      </span>
                      <strong
                        className={`font-mono block ${
                          isAprobado
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : isRechazado
                            ? 'text-rose-700 dark:text-rose-400'
                            : 'text-gray-400 italic'
                        }`}
                      >
                        {item.fechaAprobacion || item.fechaRechazo || 'Pendiente de registro'}
                      </strong>
                    </div>
                  </div>

                  {/* Motivo de rechazo si aplica */}
                  {item.motivo && (
                    <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg text-caption text-rose-800 dark:text-rose-300">
                      <strong>Motivo registrado por el cliente:</strong> {item.motivo}
                    </div>
                  )}

                  {/* Comprobante del Correo */}
                  {item.respaldoCorreoUrl && (
                    <div className="p-2.5 bg-white dark:bg-slate-800 border border-purple-900/10 dark:border-white/10 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="text-caption font-bold text-gray-800 dark:text-gray-200">
                          Respaldo Correo del Cliente ({item.version})
                        </span>
                      </div>
                      <a
                        href={item.respaldoCorreoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-micro font-bold text-purple-700 hover:text-purple-900 dark:text-purple-300 underline inline-flex items-center gap-1"
                      >
                        Ver pantallazo <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie del Modal */}
        <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-body rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
