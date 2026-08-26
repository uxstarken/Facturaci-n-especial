'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Upload,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Check,
  ShieldAlert,
  Trash2,
  FileCheck,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import { Proforma, ProformaEstado } from '@/lib/types';
import { useToast } from '@/context/toast-context';

interface RespuestaClienteModalProps {
  proforma: Proforma;
  initialTipo?: 'Aprobada' | 'Rechazada';
  onClose: () => void;
  onSuccess: (proformaActualizada: Proforma) => void;
}

const MOTIVOS_RECHAZO_PREDETERMINADOS = [
  'Inconsistencia en Tarifas / Descuentos negociados (Precio)',
  'Diferencia en recubitaje / medidas de SKUs (Medidas/Cubitaje)',
  'Falta documentación o respaldo de cliente',
  'Error en la selección de Cuentas Corrientes',
  'Solicitud duplicada o emitida por error',
  'Otro motivo (Especificar)',
];

export function RespuestaClienteModal({
  proforma,
  initialTipo = 'Aprobada',
  onClose,
  onSuccess,
}: RespuestaClienteModalProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [tipoRespuesta, setTipoRespuesta] = useState<'Aprobada' | 'Rechazada'>(initialTipo);
  const [motivoRechazoSelect, setMotivoRechazoSelect] = useState(MOTIVOS_RECHAZO_PREDETERMINADOS[0]);
  const [motivoSelectOpen, setMotivoSelectOpen] = useState(false);
  const [archivoRespaldo, setArchivoRespaldo] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    proforma.respaldoCorreo ? '/demo_email_aprobado.png' : null
  );

  // Popup de aviso informativo posterior
  const [popupAviso, setPopupAviso] = useState<{
    tipo: 'medidas' | 'pricing';
    proforma: Proforma;
  } | null>(null);

  const conteoActual = proforma.conteoRechazos || 0;
  const esPorMedidas =
    motivoRechazoSelect.toLowerCase().includes('recubitaje') ||
    motivoRechazoSelect.toLowerCase().includes('medidas');
  const esPorPrecio =
    motivoRechazoSelect.toLowerCase().includes('tarifas') ||
    motivoRechazoSelect.toLowerCase().includes('precio') ||
    motivoRechazoSelect.toLowerCase().includes('descuentos');

  const esSegundoRechazo = tipoRespuesta === 'Rechazada' && !esPorPrecio && conteoActual >= 1;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArchivoRespaldo(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSimulateDefaultFile = () => {
    setPreviewUrl(
      tipoRespuesta === 'Aprobada' ? '/demo_email_aprobado.png' : '/demo_email_rechazado.png'
    );
    setArchivoRespaldo(
      new File(['demo'], tipoRespuesta === 'Aprobada' ? 'correo_aprobacion_cliente.png' : 'correo_rechazo_cliente.png', {
        type: 'image/png',
      })
    );
  };

  const handleGuardar = () => {
    if (!archivoRespaldo && !previewUrl) {
      showToast('Por favor adjunta el pantallazo o respaldo del correo del cliente.', 'error');
      return;
    }

    const ahora = new Date();
    const fechaActualFormateada = `${ahora.getDate().toString().padStart(2, '0')}/${(ahora.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${ahora.getFullYear()} ${ahora.getHours().toString().padStart(2, '0')}:${ahora
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;

    let nuevoEstado: ProformaEstado = 'Aprobada por Cliente';
    let nuevoConteo = conteoActual;

    if (tipoRespuesta === 'Rechazada') {
      nuevoConteo = conteoActual + 1;
      if (esPorPrecio) {
        nuevoEstado = 'Enviado a Pricing';
      } else if (nuevoConteo >= 2) {
        nuevoEstado = 'Derivada a CAM';
      } else {
        nuevoEstado = 'Rechazada v1';
      }
    }

    const versionNombre = `v${(proforma.historialVersiones?.length || 0) + 1}` as 'v1' | 'v2' | 'v3';

    const nuevaIteracion = {
      version: versionNombre,
      fechaCreacion: proforma.fecha || fechaActualFormateada,
      fechaAprobacion: tipoRespuesta === 'Aprobada' ? fechaActualFormateada : undefined,
      fechaRechazo: tipoRespuesta === 'Rechazada' ? fechaActualFormateada : undefined,
      motivo: tipoRespuesta === 'Rechazada' ? motivoRechazoSelect : undefined,
      monto: proforma.monto,
      respaldoCorreoUrl: previewUrl || '/demo_email_aprobado.png',
    };

    const proformaActualizada: Proforma = {
      ...proforma,
      estado: nuevoEstado,
      conteoRechazos: nuevoConteo,
      respaldoCorreo: archivoRespaldo ? archivoRespaldo.name : 'correo_respaldo_cliente.png',
      historialVersiones: [...(proforma.historialVersiones || []), nuevaIteracion],
    };

    // Si es por Medidas o por Pricing, abrimos el popup de aviso dedicado
    if (tipoRespuesta === 'Rechazada' && esPorMedidas && nuevoEstado !== 'Derivada a CAM') {
      setPopupAviso({ tipo: 'medidas', proforma: proformaActualizada });
      return;
    }

    if (tipoRespuesta === 'Rechazada' && esPorPrecio) {
      setPopupAviso({ tipo: 'pricing', proforma: proformaActualizada });
      return;
    }

    // Otros casos: Notificar y cerrar
    if (nuevoEstado === 'Derivada a CAM') {
      showToast(
        `Proforma ${proforma.id} superó 2 rechazos del cliente y fue derivada automáticamente al CAM.`,
        'warning',
        7000,
        'Derivada a CAM'
      );
    } else if (tipoRespuesta === 'Aprobada') {
      showToast(
        `Respuesta registrada: Proforma ${proforma.id} Aprobada por el cliente.`,
        'success',
        5500,
        'Aprobación Registrada'
      );
    } else {
      showToast(
        `Rechazo registrado para Proforma ${proforma.id}. Habilitada para edición v2.`,
        'info',
        5500,
        'Rechazo Registrado'
      );
    }

    onSuccess(proformaActualizada);
  };

  return (
    <>
      {/* Modal Principal de Respuesta */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 border border-purple-900/10 dark:border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 relative flex flex-col max-h-[90vh]">
          
          {/* Header Limpio */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/10 flex items-start justify-between bg-gradient-to-b from-purple-50/40 to-transparent dark:from-white/5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-micro bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded-md">
                  {proforma.id}
                </span>
                <span className="text-micro text-gray-500 font-medium">Validación de Cliente</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Registrar Respuesta del Cliente
              </h3>
              <p className="text-caption text-gray-500 dark:text-gray-400">
                {proforma.cliente} <span className="text-gray-400">·</span> RUT: {proforma.rut}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Contenido con scroll limpio */}
          <div className="p-6 space-y-5 overflow-y-auto">
            
            {/* Selector de Estado: Tarjetas Claras */}
            <div className="space-y-2">
              <label className="text-caption font-bold text-gray-700 dark:text-gray-300 block">
                Resultado de la respuesta <span className="text-purple-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoRespuesta('Aprobada')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    tipoRespuesta === 'Aprobada'
                      ? 'bg-emerald-50/80 dark:bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950 dark:text-emerald-200 shadow-xs'
                      : 'bg-white dark:bg-slate-900/40 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-emerald-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    tipoRespuesta === 'Aprobada'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-caption block">Cliente Aprobó</span>
                    <span className="text-micro text-gray-500 dark:text-gray-400">Proforma aceptada</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoRespuesta('Rechazada')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    tipoRespuesta === 'Rechazada'
                      ? 'bg-rose-50/80 dark:bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/20 text-rose-950 dark:text-rose-200 shadow-xs'
                      : 'bg-white dark:bg-slate-900/40 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-rose-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    tipoRespuesta === 'Rechazada'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600'
                  }`}>
                    <XCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-caption block">Cliente Rechazó</span>
                    <span className="text-micro text-gray-500 dark:text-gray-400">Requiere ajustes</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Selector de Motivo de Rechazo */}
            {tipoRespuesta === 'Rechazada' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <div className="relative space-y-1.5">
                  <label className="text-caption font-bold text-gray-700 dark:text-gray-300 block">
                    Motivo del rechazo <span className="text-rose-500">*</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setMotivoSelectOpen(!motivoSelectOpen)}
                    className="w-full p-3 bg-white dark:bg-slate-900/60 border border-purple-900/20 dark:border-white/15 hover:border-purple-600 rounded-xl text-body text-gray-900 dark:text-gray-100 font-semibold text-left outline-none shadow-2xs flex items-center justify-between cursor-pointer transition-all"
                  >
                    <span className="truncate pr-2">{motivoRechazoSelect}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 transition-transform duration-200 ${
                        motivoSelectOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {motivoSelectOpen && (
                    <>
                      <div className="fixed inset-0 z-20" onClick={() => setMotivoSelectOpen(false)} />
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-xl shadow-xl z-30 p-1.5 space-y-1 max-h-48 overflow-y-auto animate-in fade-in duration-150">
                        {MOTIVOS_RECHAZO_PREDETERMINADOS.map((motivo) => {
                          const isSelected = motivo === motivoRechazoSelect;
                          return (
                            <button
                              key={motivo}
                              type="button"
                              onClick={() => {
                                setMotivoRechazoSelect(motivo);
                                setMotivoSelectOpen(false);
                              }}
                              className={`w-full p-2.5 text-left text-body rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-purple-50 dark:bg-purple-500/20 text-purple-950 dark:text-purple-200 font-bold'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50/60 dark:hover:bg-white/5 font-medium'
                              }`}
                            >
                              <span className="truncate">{motivo}</span>
                              {isSelected && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 ml-2" />}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Advertencia si es 2do Rechazo (CAM) */}
                {esSegundoRechazo && (
                  <div className="p-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-xl text-caption text-amber-900 dark:text-amber-300 flex items-start gap-2.5 animate-in fade-in duration-200">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Segundo rechazo consecutivo</strong>
                      <p className="mt-0.5 leading-relaxed text-micro text-amber-800 dark:text-amber-300">
                        La proforma será derivada automáticamente a la <strong>Subgerencia / Ejecutivo CAM</strong> y se bloqueará la emisión de una versión v3 estándar.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Adjunto de Pantallazo del Correo */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-caption font-bold text-gray-700 dark:text-gray-300 block">
                  Pantallazo del correo de respaldo <span className="text-purple-600">*</span>
                </label>
                <span className="text-micro text-gray-400">PNG, JPG o PDF</span>
              </div>

              {previewUrl || archivoRespaldo ? (
                /* Tarjeta limpia de archivo cargado */
                <div className="p-3.5 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200 dark:border-white/10 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-200 dark:border-emerald-500/30">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-caption text-gray-900 dark:text-gray-100 truncate">
                        {archivoRespaldo ? archivoRespaldo.name : 'correo_aprobacion_cliente.png'}
                      </p>
                      <p className="text-micro text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Respaldo adjunto correctamente
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setArchivoRespaldo(null);
                      setPreviewUrl(null);
                    }}
                    title="Eliminar archivo"
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Dropzone Minimalista */
                <div className="border border-dashed border-gray-300 dark:border-white/20 hover:border-purple-500 rounded-xl p-4 bg-gray-50/50 dark:bg-white/5 text-center transition-all">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pantallazo-upload-input"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-caption font-bold text-gray-800 dark:text-gray-200">
                        Arrastra tu pantallazo o selecciónalo
                      </p>
                      <p className="text-micro text-gray-400 mt-0.5">Máximo 10 MB</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <label
                        htmlFor="pantallazo-upload-input"
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-micro rounded-lg transition-all cursor-pointer shadow-2xs"
                      >
                        Examinar
                      </label>
                      <button
                        type="button"
                        onClick={handleSimulateDefaultFile}
                        className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 hover:bg-gray-50 text-gray-700 dark:text-gray-200 font-bold text-micro rounded-lg transition-all cursor-pointer"
                      >
                        Usar Imagen Demo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 font-bold text-caption rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-caption rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Respuesta y Respaldo</span>
            </button>
          </div>

        </div>
      </div>

      {/* ─── POPUP APARTE 1: Aviso de Medidas / Cubitaje ─── */}
      {popupAviso && popupAviso.tipo === 'medidas' && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-purple-900/10 dark:border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-5 text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-xs">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-micro font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                  {popupAviso.proforma.id}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight mt-0.5">
                  Actualización de Medidas Requerida
                </h3>
              </div>
            </div>

            <div className="space-y-2.5 text-body text-gray-700 dark:text-gray-300 bg-purple-50/50 dark:bg-white/5 p-4 rounded-xl border border-purple-100 dark:border-white/5 text-caption leading-relaxed">
              <p>
                El cliente rechazó la proforma por <strong>diferencias en recubitaje o medidas de SKUs</strong>.
              </p>
              <p>
                Para solucionar este caso, debes <strong>descargar la planilla</strong> de diferencias y realizar el proceso de <strong>actualización de proforma</strong> (validación por SKU).
              </p>
              <p className="text-micro text-gray-500 dark:text-gray-400 font-medium">
                💡 Puedes realizar esta actualización de inmediato o hacerla más adelante desde la opción de editar en el listado.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  showToast(
                    `Rechazo registrado para Proforma ${popupAviso.proforma.id}. Puedes actualizar las medidas cuando lo desees.`,
                    'info',
                    5500
                  );
                  onSuccess(popupAviso.proforma);
                }}
                className="w-full sm:w-1/2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/10 dark:hover:bg-white/15 text-gray-700 dark:text-gray-300 rounded-xl text-caption font-bold transition-all cursor-pointer text-center"
              >
                Entendido, lo haré después
              </button>

              <button
                type="button"
                onClick={() => {
                  onSuccess(popupAviso.proforma);
                  router.push(`/proformas/editar?id=${popupAviso.proforma.id}`);
                }}
                className="w-full sm:w-1/2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-caption font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Actualizar Ahora</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── POPUP APARTE 2: Aviso de Pricing ─── */}
      {popupAviso && popupAviso.tipo === 'pricing' && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-purple-900/10 dark:border-white/10 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-5 text-left">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0 font-bold text-xl shadow-xs">
                $
              </div>
              <div>
                <span className="font-mono text-micro font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                  {popupAviso.proforma.id}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight mt-0.5">
                  Derivación al Área de Pricing
                </h3>
              </div>
            </div>

            <div className="space-y-2.5 text-body text-gray-700 dark:text-gray-300 bg-blue-50/50 dark:bg-white/5 p-4 rounded-xl border border-blue-100 dark:border-white/5 text-caption leading-relaxed">
              <p>
                El rechazo por inconsistencia en tarifas o precios ha sido derivado automáticamente al área de <strong>Pricing</strong> para su análisis y ajuste.
              </p>
              <p>
                El estado de la proforma se ha registrado como <strong>Enviado a Pricing</strong>.
              </p>
              <p className="text-micro text-gray-500 dark:text-gray-400 font-medium">
                ✏️ <strong>Nota:</strong> Este estado se mantiene <strong>habilitado para edición</strong> para que puedas aplicar las tarifas acordadas tan pronto recibas la respuesta.
              </p>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  showToast(
                    `Proforma ${popupAviso.proforma.id} enviada a Pricing. Estado registrado correctamente.`,
                    'info',
                    5500
                  );
                  onSuccess(popupAviso.proforma);
                }}
                className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-caption font-bold transition-all shadow-sm cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
