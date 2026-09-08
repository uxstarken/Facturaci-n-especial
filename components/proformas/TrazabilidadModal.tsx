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
  Receipt,
  Download,
  DollarSign,
} from 'lucide-react';
import { Proforma } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/context/toast-context';

interface TrazabilidadModalProps {
  proforma: Proforma;
  onClose: () => void;
}

export function TrazabilidadModal({ proforma, onClose }: TrazabilidadModalProps) {
  const { showToast } = useToast();

  const historial = proforma.historialVersiones || [
    {
      version: 'v1' as const,
      fechaCreacion: proforma.fecha,
      monto: proforma.monto,
    },
  ];

  const esDerivadaCAM = proforma.estado === 'Derivada a CAM' || (proforma.conteoRechazos || 0) >= 3;
  const esFacturado = proforma.estado === 'Facturado' || !!proforma.numeroFactura;

  const handleDescargarFactura = () => {
    const docNombre =
      proforma.archivoFacturaNombre ||
      `Factura_${proforma.numeroFactura || 'Oficial'}_${proforma.cliente.replace(/\s+/g, '_')}.pdf`;

    // Simular descarga de PDF oficial
    const dummyContent = `%PDF-1.4 Factura Oficial Starken\nFolio: ${proforma.numeroFactura || 'N/A'}\nCliente: ${proforma.cliente}\nRUT: ${proforma.rut}\nMonto: ${proforma.montoFormatted || formatCurrency(proforma.monto)}\nFecha: ${proforma.fechaFacturacion || proforma.fecha}`;
    const blob = new Blob([dummyContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docNombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(
      `Descargando documento oficial: ${docNombre}`,
      'success',
      4000,
      'Descarga de Factura Iniciada'
    );
  };

  const handleDescargarProformaVersion = (version: string) => {
    const docNombre = `Proforma_${proforma.id}_${version.toUpperCase()}.pdf`;
    const dummyContent = `%PDF-1.4 Proforma Starken Especial\nID: ${proforma.id}\nVersion: ${version.toUpperCase()}\nCliente: ${proforma.cliente}`;
    const blob = new Blob([dummyContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docNombre;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(
      `Descargando copia de proforma ${version.toUpperCase()}`,
      'info',
      3000
    );
  };

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
                esFacturado
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                  : esDerivadaCAM
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

                  {/* Botón Descargar Copia de Proforma */}
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDescargarProformaVersion(item.version)}
                      className="text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 hover:underline inline-flex items-center gap-1.5 cursor-pointer py-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar Proforma ({item.version.toUpperCase()})</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Hito Final: Card Dedicada de Facturación Registrada */}
          {esFacturado && (
            <div className="relative pl-12 space-y-2 pt-1 animate-in fade-in duration-300">
              {/* Node Icon de Facturación */}
              <div className="absolute left-2.5 top-1 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-xs">
                <Receipt className="w-3.5 h-3.5" />
              </div>

              <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50/40 dark:from-slate-900 dark:via-purple-950/20 dark:to-slate-900 border-2 border-purple-300 dark:border-purple-800/60 rounded-xl p-4 space-y-3 shadow-xs">
                {/* Cabecera de la Card de Facturación */}
                <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4" />
                    </span>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                        Hito Final · Cierre Comercial
                      </span>
                      <h4 className="font-extrabold text-sm text-gray-900 dark:text-gray-100 leading-tight">
                        Facturación Registrada
                      </h4>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-micro font-extrabold bg-emerald-100 text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Facturado · N° {proforma.numeroFactura || '890214'}
                  </span>
                </div>

                {/* Grid de Metadatos de la Factura */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-caption">
                  <div className="bg-white/80 dark:bg-slate-800 p-2.5 rounded-lg border border-purple-100 dark:border-white/10 space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-600" /> Fecha de Registro / Emisión
                    </span>
                    <strong className="text-gray-900 dark:text-gray-100 font-mono text-xs block">
                      {proforma.fechaFacturacion || proforma.fecha || new Date().toLocaleDateString('es-CL')}
                    </strong>
                  </div>

                  <div className="bg-white/80 dark:bg-slate-800 p-2.5 rounded-lg border border-purple-100 dark:border-white/10 space-y-0.5">
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-purple-600" /> Monto Facturado Oficial
                    </span>
                    <strong className="text-purple-700 dark:text-purple-300 font-mono text-xs font-extrabold block">
                      {proforma.montoFormatted || formatCurrency(proforma.monto)}
                    </strong>
                  </div>
                </div>

                {/* Ficha Documento Adjunto */}
                <div className="p-3 bg-white dark:bg-slate-800/90 border border-purple-200 dark:border-purple-800/40 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 block truncate">
                        {proforma.archivoFacturaNombre || `Factura_${proforma.numeroFactura || proforma.id}.pdf`}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                        Documento oficial adjunto (PDF)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botón Principal para Descargar Factura */}
                <button
                  type="button"
                  onClick={handleDescargarFactura}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-extrabold shadow-md shadow-purple-700/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Factura Emitida (PDF)</span>
                </button>
              </div>
            </div>
          )}
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
