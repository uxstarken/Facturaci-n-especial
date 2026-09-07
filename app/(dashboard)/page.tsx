'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Hourglass,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Pencil,
  Sparkles,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
  FileImage,
  Download,
  Layers,
  ShieldCheck,
  Check,
  Tag,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/context/theme-context';
import { useToast } from '@/context/toast-context';
import { MOCK_PROFORMAS } from '@/lib/mock-data';
import { Proforma, VersionProforma } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { RespuestaClienteModal } from '@/components/proformas/RespuestaClienteModal';

export default function DashboardHome() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  const [proformas, setProformas] = useState<Proforma[]>(MOCK_PROFORMAS);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Dropdown de cambio de estado en el badge
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<string | null>(null);

  // Fila expandida para ver proformas anteriores (Línea de tiempo horizontal inline)
  const [expandedProformaId, setExpandedProformaId] = useState<string | null>(null);

  // Modal para Respuesta Cliente (con tipo pre-seleccionado: Aprobada o Rechazada)
  const [selectedRespuesta, setSelectedRespuesta] = useState<{
    proforma: Proforma;
    tipo: 'Aprobada' | 'Rechazada';
  } | null>(null);

  const hasShownToastRef = useRef(false);

  // HANDLER: SIMULAR AUTORIZACIÓN DE SUPERVISOR / JEFATURA
  const handleAutorizarSupervisor = (proformaId: string) => {
    setProformas((prev) =>
      prev.map((p) => {
        if (p.id === proformaId) {
          const prevHist = p.historialVersiones || [];
          const updatedHist = prevHist.map((h, i) =>
            i === prevHist.length - 1
              ? {
                  ...h,
                  estadoSupervision: 'Autorizada' as const,
                  aprobadoPorSupervisor: 'Carlos Muñoz (Jefatura)',
                  fechaSupervision: new Date().toLocaleDateString('es-CL'),
                }
              : h
          );
          return {
            ...p,
            estadoSupervision: 'Autorizada',
            estado: 'Pendiente', // Pasa a estado de enviada formalmente al cliente
            historialVersiones: updatedHist,
          };
        }
        return p;
      })
    );
    showToast(
      `Versión de ${proformaId} aprobada por Jefatura (Carlos Muñoz). Lista para validación comercial con el cliente.`,
      'success',
      5500,
      'V°B° Jefatura Concedido'
    );
  };

  // HANDLER: SIMULAR RESOLUCIÓN DE PRICING
  const handleResolverPricing = (proformaId: string) => {
    setProformas((prev) =>
      prev.map((p) => {
        if (p.id === proformaId) {
          return {
            ...p,
            estado: 'Tarifas Corregidas por Pricing',
            estadoSupervision: 'Pricing_Resuelto',
          };
        }
        return p;
      })
    );
    showToast(
      `Tarifas corregidas por Pricing para ${proformaId}. El analista ya puede editar la proforma con los nuevos precios.`,
      'info',
      6500,
      'Tarifas Corregidas por Pricing'
    );
  };

  // HANDLER: SIMULAR DEVOLUCIÓN DE SUPERVISOR A ANALISTA
  const handleDevolverSupervisor = (proformaId: string) => {
    setProformas((prev) =>
      prev.map((p) => {
        if (p.id === proformaId) {
          return {
            ...p,
            estadoSupervision: 'Devuelta_Analista',
            estado: 'Pendiente de validación',
          };
        }
        return p;
      })
    );
    showToast(
      `Proforma ${proformaId} devuelta al analista con observaciones para nuevo ajuste de medidas.`,
      'warning',
      5500,
      'Devuelta por Jefatura'
    );
  };

  useEffect(() => {
    const highlightParam = searchParams.get('highlight');
    const toastParam = searchParams.get('toast');
    const v2Param = searchParams.get('v2');
    const montoParam = searchParams.get('monto');

    if (highlightParam) {
      setHighlightedId(highlightParam);

      if (toastParam === 'solicitada' || v2Param === 'true') {
        const nuevoMonto = montoParam ? Number(montoParam) : 6560000;
        setProformas((prev) =>
          prev.map((p) => {
            if (p.id === highlightParam) {
              const prevHist = p.historialVersiones || [];
              const nextVerNum = prevHist.length + 1;
              const nextVer = (nextVerNum === 2 ? 'v2' : nextVerNum >= 3 ? 'v3' : 'v2') as VersionProforma;

              const yaTieneVer = prevHist.some((h) => h.version === nextVer);
              // Si se avanza a una versión superior (ej: V2 -> V3), todas las versiones previas necesariamente fueron rechazadas
              const sanitizedPrevHist = prevHist.map((h, i) => ({
                ...h,
                estado: 'Rechazada' as const,
                fechaRechazo: h.fechaRechazo || new Date().toLocaleDateString('es-CL'),
                motivo:
                  h.motivo ||
                  (h.version === 'v1'
                    ? 'Diferencia en recubitaje / medidas de SKUs'
                    : 'Rechazo comercial por cliente / Ajuste de medidas'),
                respaldoCorreoUrl: h.respaldoCorreoUrl || '/demo_email_rechazado.png',
              }));

              const nuevoHist = yaTieneVer
                ? prevHist
                : [
                    ...sanitizedPrevHist,
                    {
                      version: nextVer,
                      fechaCreacion: new Date().toLocaleDateString('es-CL'),
                      monto: nuevoMonto,
                      estado: 'Pendiente de validación',
                      estadoSupervision: 'Pendiente_Autorizacion' as const,
                    },
                  ];

              return {
                ...p,
                versionActual: nextVer,
                estadoSupervision: 'Pendiente_Autorizacion',
                estado: 'Pendiente de validación',
                monto: nuevoMonto,
                montoFormatted: formatCurrency(nuevoMonto),
                historialVersiones: nuevoHist,
              };
            }
            return p;
          })
        );

        // Auto desplegar la línea de tiempo para ver la nueva versión V2/V3
        setExpandedProformaId(highlightParam);

        if (!hasShownToastRef.current) {
          hasShownToastRef.current = true;
          showToast(
            `Proforma ${highlightParam} actualizada exitosamente. Se generó nueva versión con solicitud de V°B° enviada a Jefatura.`,
            'success',
            6000,
            'Nueva Versión en Supervisión'
          );
        }
      } else if ((toastParam === 'created' || toastParam === 'true') && !hasShownToastRef.current) {
        hasShownToastRef.current = true;
        showToast(
          `La proforma ${highlightParam} fue creada y registrada correctamente.`,
          'success',
          5500,
          'Proforma Creada con Éxito'
        );
      }

      const timer = setTimeout(() => {
        setHighlightedId(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [searchParams, showToast]);

  const filteredProformas = proformas.filter(
    (p) =>
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProformaActualizada = (proformaActualizada: Proforma) => {
    setProformas((prev) =>
      prev.map((p) => (p.id === proformaActualizada.id ? proformaActualizada : p))
    );
    setSelectedRespuesta(null);
  };

  const toggleExpandProforma = (id: string) => {
    setExpandedProformaId((prev) => (prev === id ? null : id));
  };

  const handleDescargarVersion = (proformaId: string, version: string) => {
    const filename = `${proformaId}_${version.toUpperCase()}.pdf`;
    const blobContent = `--- PROFORMA DE FACTURACIÓN ESPECIAL STARKEN ---\nDocumento: ${proformaId}\nVersión: ${version.toUpperCase()}\nFecha de Emisión: ${new Date().toLocaleDateString('es-CL')}\nEstado: Documento oficial generado\nSistema: Plataforma FE Starken`;
    const blob = new Blob([blobContent], { type: 'application/pdf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(
      `Se ha descargado el documento ${filename} correctamente.`,
      'info',
      4000,
      'Descarga Completada'
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100">
          Hola, {user?.name.split(' ')[0] || 'Analista'} 👋
        </h1>
        <p className="text-caption text-gray-600 dark:text-gray-400">
          Rol: <span className="font-semibold text-purple-700 dark:text-purple-400">{user?.role || 'Analista'}</span> · Gestión de proformas y validación comercial
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Totales */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-purple-900/10 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-micro font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-full">
              General
            </span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 leading-none mb-1">
            {proformas.length}
          </p>
          <p className="text-caption text-gray-600 dark:text-gray-400 font-medium">Proformas registradas</p>
        </div>

        {/* KPI 2: Pendientes */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-purple-900/10 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Hourglass className="w-5 h-5" />
            </div>
            <span className="text-micro font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
              En espera
            </span>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 leading-none mb-1">
            {proformas.filter((p) => p.estado === 'Pendiente' || p.estado === 'En revisión').length}
          </p>
          <p className="text-caption text-gray-600 dark:text-gray-400 font-medium">Pendientes de respuesta</p>
        </div>

        {/* KPI 3: Aprobadas */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-purple-900/10 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-micro font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Listas
            </span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none mb-1">
            {proformas.filter((p) => p.estado === 'Aprobada' || p.estado === 'Aprobada por Cliente').length}
          </p>
          <p className="text-caption text-gray-600 dark:text-gray-400 font-medium">Aprobadas por clientes</p>
        </div>

        {/* KPI 4: CAM / Rechazadas */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-purple-900/10 dark:border-white/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <span className="text-micro font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full">
              Escaladas
            </span>
          </div>
          <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 leading-none mb-1">
            {proformas.filter((p) => p.estado === 'Derivada a CAM' || (p.conteoRechazos || 0) >= 3).length}
          </p>
          <p className="text-caption text-gray-600 dark:text-gray-400 font-medium">Derivadas al CAM (3 rechazos / V3)</p>
        </div>
      </div>

      {/* Tabla de Proformas */}
      <div className="bg-white dark:bg-slate-800 border border-purple-900/10 dark:border-white/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-purple-900/10 dark:border-white/10 bg-purple-50/30 dark:bg-white/5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-h2 font-semibold text-gray-900 dark:text-gray-100">
              Proformas y Control de Versiones (V1, V2, V3)
            </h2>
            <p className="text-caption text-gray-500 dark:text-gray-400">
              Visualización de doble estado: Validación de Jefatura vs. Ciclo Comercial con Cliente
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente o N°..."
                className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900/50 border border-purple-900/15 dark:border-white/10 rounded-lg text-body text-gray-800 dark:text-gray-200 outline-none focus:border-purple-600 shadow-xs text-caption"
              />
            </div>

            <Link
              href="/proformas/nueva"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r ${theme.buttonGradient} text-white rounded-lg text-caption font-semibold shadow-sm transition-all`}
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva Proforma
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-body">
            <thead className="bg-purple-50/50 dark:bg-white/5 border-b border-purple-900/10 dark:border-white/10 text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider text-micro">
              <tr>
                <th className="py-3.5 px-5">N° Proforma</th>
                <th className="py-3.5 px-5">Cliente & RUT</th>
                <th className="py-3.5 px-5">Monto Neto</th>
                <th className="py-3.5 px-5">Fecha Creación</th>
                <th className="py-3.5 px-5">Versión & Doble Estado (Interno / Comercial)</th>
                <th className="py-3.5 px-5 text-right">Gestionar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredProformas.map((p) => {
                const isNewlyCreated = highlightedId === p.id;
                const esEnviadoPricing = p.estado === 'Enviado a Pricing';
                const esPricingResuelto = p.estado === 'Tarifas Corregidas por Pricing' || p.estadoSupervision === 'Pricing_Resuelto';
                const esDerivadaCAM = p.estado === 'Derivada a CAM' || (p.conteoRechazos || 0) >= 3;
                const esAprobada = p.estado === 'Aprobada por Cliente' || p.estado === 'Aprobada';
                const editarBloqueado = esDerivadaCAM || esAprobada || esEnviadoPricing;
                const isExpanded = expandedProformaId === p.id;
                const isStatusMenuOpen = openStatusDropdownId === p.id;

                const versionesLista =
                  p.historialVersiones && p.historialVersiones.length > 0
                    ? p.historialVersiones
                    : [{ version: 'v1' as const, fechaCreacion: p.fecha, monto: p.monto }];

                const currentVersion =
                  versionesLista[versionesLista.length - 1]?.version.toUpperCase() ||
                  p.versionActual?.toUpperCase() ||
                  'V1';

                const estadoTexto = esDerivadaCAM
                  ? 'Derivada a CAM'
                  : esAprobada
                  ? 'Aprobada por Cliente'
                  : esEnviadoPricing
                  ? 'Enviado a Pricing'
                  : esPricingResuelto
                  ? 'Tarifas Corregidas'
                  : p.estado === 'Rechazada v1' || p.estado === 'Rechazada'
                  ? 'Rechazada v1'
                  : p.estado === 'Rechazada v2'
                  ? 'Rechazada v2'
                  : 'Pendiente de validación';

                return (
                  <React.Fragment key={p.id}>
                    <tr
                      className={`transition-all duration-300 ${
                        isNewlyCreated
                          ? 'bg-emerald-100/90 dark:bg-emerald-500/20 border-l-4 border-l-emerald-600 font-semibold'
                          : isExpanded
                          ? 'bg-purple-50/40 dark:bg-purple-950/20 border-l-4 border-l-purple-600'
                          : 'hover:bg-purple-50/30 dark:hover:bg-white/5'
                      }`}
                    >
                      {/* N° Proforma */}
                      <td className="py-3.5 px-5 font-bold">
                        <div className="flex items-center gap-2">
                          {isNewlyCreated && <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />}
                          <span className="font-mono text-purple-900 dark:text-purple-300">{p.id}</span>
                        </div>
                      </td>

                      {/* Cliente & RUT (Incluye cuenta corriente en subtexto) */}
                      <td className="py-3.5 px-5 font-medium text-gray-900 dark:text-gray-100">
                        <div>
                          <span className="font-bold">{p.cliente}</span>
                          <span className="text-micro font-mono text-gray-500 dark:text-gray-400 block">
                            RUT: {p.rut} · {p.cuentaCorrienteId || 'CTA-001'}
                          </span>
                        </div>
                      </td>

                      {/* Monto */}
                      <td className="py-3.5 px-5 font-mono font-bold text-gray-900 dark:text-gray-100">
                        {p.montoFormatted}
                      </td>

                      {/* Fecha */}
                      <td className="py-3.5 px-5 text-gray-600 dark:text-gray-400 font-medium font-mono text-caption whitespace-nowrap">
                        {p.fecha}
                      </td>

                      {/* ══════════════════════════════════════════════════════════════════════
                          OPCIÓN 1: 1 COLUMNA COMPUESTA JERÁRQUICA (VERSIÓN + DOBLE ESTADO)
                         ══════════════════════════════════════════════════════════════════════ */}
                      <td className="py-3.5 px-5">
                        <div className="space-y-1.5">
                          {/* Fila 1: Pastilla de Versión + Estado de Supervisión / Pricing */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-extrabold ${
                                currentVersion === 'V1'
                                  ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                                  : currentVersion === 'V2'
                                  ? 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800'
                                  : 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                              }`}
                            >
                              <Layers className="w-3 h-3" />
                              {currentVersion}
                            </span>

                            {/* Estado Supervisión / Pricing / Jefatura */}
                            {esEnviadoPricing ? (
                              <div className="inline-flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-micro font-extrabold bg-blue-50 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-300 animate-pulse">
                                  <Hourglass className="w-3 h-3 text-blue-600" /> Pendiente Pricing
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleResolverPricing(p.id)}
                                  title="⚡ Simular resolución y corrección de tarifas por el equipo de Pricing"
                                  className="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Resuelto</span>
                                </button>
                              </div>
                            ) : esPricingResuelto ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-micro font-extrabold bg-sky-50 dark:bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-300">
                                <Tag className="w-3 h-3 text-sky-600" /> Tarifas Corregidas por Pricing
                              </span>
                            ) : p.estadoSupervision === 'Pendiente_Autorizacion' ? (
                              <div className="inline-flex items-center gap-1.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-micro font-extrabold bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 animate-pulse">
                                  <Hourglass className="w-3 h-3 text-amber-600" /> Pendiente V°B° Jefatura
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleAutorizarSupervisor(p.id)}
                                  title="⚡ Simular aprobación de Jefatura para esta versión"
                                  className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                                >
                                  <Check className="w-2.5 h-2.5" />
                                  <span>Autorizar</span>
                                </button>
                              </div>
                            ) : p.estadoSupervision === 'Autorizada' && currentVersion !== 'V1' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-micro font-extrabold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Autorizada para Envío
                              </span>
                            ) : p.estadoSupervision === 'Devuelta_Analista' && currentVersion !== 'V1' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-micro font-extrabold bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-300">
                                <XCircle className="w-3 h-3 text-rose-600" /> Devuelta para Corrección
                              </span>
                            ) : null}
                          </div>

                          {/* Fila 2: Sub-estado Comercial con Cliente */}
                          {esPricingResuelto ? (
                            <div className="flex items-center gap-1.5 text-caption">
                              <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                                Cliente:
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-micro font-bold bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 border border-sky-200">
                                ✏️ Requiere actualización del analista
                              </span>
                            </div>
                          ) : (
                            p.estadoSupervision !== 'Pendiente_Autorizacion' && p.estadoSupervision !== 'Devuelta_Analista' && !esEnviadoPricing && (
                              <div className="flex items-center gap-1.5 text-caption">
                                <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                                  Cliente:
                                </span>
                                <div className="relative inline-block text-left">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (editarBloqueado) {
                                        showToast(
                                          esAprobada
                                            ? 'Esta proforma ya fue aprobada por el cliente.'
                                            : esDerivadaCAM
                                            ? 'Esta proforma fue derivada al CAM (Gestión bloqueada).'
                                            : 'Esta proforma está en revisión de Pricing (Gestión bloqueada).',
                                          'info'
                                        );
                                        return;
                                      }
                                      setOpenStatusDropdownId(isStatusMenuOpen ? null : p.id);
                                    }}
                                    title={
                                      editarBloqueado
                                        ? esAprobada
                                          ? 'Aprobada (Bloqueada)'
                                          : esDerivadaCAM
                                          ? 'Derivada a CAM'
                                          : 'Enviada a Pricing'
                                        : 'Haga clic para cambiar estado a: Aprobada o Rechazada'
                                    }
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-micro font-extrabold transition-all cursor-pointer hover:shadow-xs active:scale-95 ${
                                      esAprobada
                                        ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                                        : esDerivadaCAM
                                        ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-400'
                                        : esEnviadoPricing
                                        ? 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-300'
                                        : p.estado === 'Rechazada v1' || p.estado === 'Rechazada'
                                        ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-300'
                                        : p.estado === 'Rechazada v2'
                                        ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-300'
                                        : 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300'
                                    }`}
                                  >
                                    <span>{estadoTexto}</span>
                                    {!editarBloqueado && (
                                      <ChevronDown
                                        className={`w-3 h-3 opacity-80 transition-transform duration-200 ${
                                          isStatusMenuOpen ? 'rotate-180' : ''
                                        }`}
                                      />
                                    )}
                                  </button>

                                  {/* Dropdown Menú Comercial */}
                                  {isStatusMenuOpen && !editarBloqueado && (
                                    <>
                                      <div
                                        className="fixed inset-0 z-20"
                                        onClick={() => setOpenStatusDropdownId(null)}
                                      />
                                      <div className="absolute left-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-800 border border-purple-200 dark:border-white/10 rounded-xl shadow-xl z-30 p-1.5 space-y-1 animate-in fade-in slide-in-from-top-1 text-left">
                                        <div className="px-2.5 py-1 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                          Registrar Respuesta Cliente:
                                        </div>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenStatusDropdownId(null);
                                            setSelectedRespuesta({ proforma: p, tipo: 'Aprobada' });
                                          }}
                                          className="w-full px-2.5 py-2 text-left text-caption font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/15 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                          <div className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <span className="block leading-tight font-extrabold text-emerald-900 dark:text-emerald-200">
                                              Aprobada por Cliente
                                            </span>
                                            <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400">
                                              Adjuntar respaldo de correo
                                            </span>
                                          </div>
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setOpenStatusDropdownId(null);
                                            setSelectedRespuesta({ proforma: p, tipo: 'Rechazada' });
                                          }}
                                          className="w-full px-2.5 py-2 text-left text-caption font-bold text-rose-800 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/15 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                          <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                            <XCircle className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <span className="block leading-tight font-extrabold text-rose-900 dark:text-rose-200">
                                              Rechazada por Cliente
                                            </span>
                                            <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400">
                                              Generará iteración a siguiente versión
                                            </span>
                                          </div>
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </td>

                      {/* ─── Columna: Gestionar (Pencil para editar + Layers para versiones) ─── */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Icono 1: Actualizar Proforma (Pencil) */}
                          {editarBloqueado && !esPricingResuelto ? (
                            <button
                              type="button"
                              disabled
                              title={
                                esAprobada
                                  ? 'Proforma aprobada (Edición bloqueada)'
                                  : esDerivadaCAM
                                  ? 'Derivada a CAM (Edición bloqueada)'
                                  : esEnviadoPricing
                                  ? 'Enviada a Pricing (Edición bloqueada hasta resolución)'
                                  : 'Edición bloqueada'
                              }
                              className="p-2 rounded-lg border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-slate-900 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60 inline-flex items-center justify-center"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          ) : esPricingResuelto ? (
                            <Link
                              href={`/proformas/editar?id=${p.id}`}
                              title="✏️ Actualizar proforma con nuevas tarifas corregidas por Pricing"
                              className="p-2 rounded-lg border border-sky-300 dark:border-sky-500/30 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 hover:bg-sky-100 hover:border-sky-400 transition-all inline-flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-sky-300/40"
                            >
                              <Pencil className="w-4 h-4 text-sky-700 dark:text-sky-300" />
                            </Link>
                          ) : (
                            <Link
                              href={`/proformas/editar?id=${p.id}`}
                              title="Actualizar / Editar Proforma"
                              className="p-2 rounded-lg border border-purple-200 dark:border-white/10 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:border-purple-400 transition-all inline-flex items-center justify-center shadow-2xs hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Icono 2: Ver Historial / Versiones (Layers) */}
                          <button
                            type="button"
                            onClick={() => toggleExpandProforma(p.id)}
                            title={
                              isExpanded
                                ? 'Ocultar historial de versiones'
                                : `Ver historial de versiones (${versionesLista.length} versión/es)`
                            }
                            className={`px-2.5 py-1.5 rounded-lg border transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 text-micro font-extrabold ${
                              isExpanded
                                ? 'bg-purple-700 border-purple-700 text-white shadow-sm ring-2 ring-purple-400/30'
                                : 'border-purple-200 dark:border-white/10 bg-white dark:bg-slate-800 text-purple-800 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/20 hover:border-purple-400 hover:scale-105'
                            }`}
                          >
                            <Layers className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* ─── Acordeón: Línea de tiempo horizontal ─── */}
                    {isExpanded && (
                      <tr className="bg-purple-50/30 dark:bg-slate-900/60 border-b-2 border-purple-200 dark:border-purple-900/50">
                        <td colSpan={6} className="p-0">
                          <div className="p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            {/* Cabecera del acordeón */}
                            <div className="flex items-center justify-between pb-3 border-b border-purple-100 dark:border-white/10">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                                  <Layers className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="text-caption font-extrabold text-gray-900 dark:text-gray-100">
                                    Línea de Tiempo y Versiones Anteriores —{' '}
                                    <span className="font-mono text-purple-700 dark:text-purple-300">
                                      {p.id}
                                    </span>
                                  </h4>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Trazabilidad completa de iteraciones, fechas y descarga de documentos emitidos
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleExpandProforma(p.id)}
                                className="text-[12px] font-semibold text-purple-700 dark:text-purple-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                                Cerrar detalle
                              </button>
                            </div>

                            {/* Alerta de derivación si aplica */}
                            {esDerivadaCAM && (
                              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 rounded-xl flex items-center gap-3">
                                <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                                <p className="text-caption text-amber-900 dark:text-amber-200">
                                  <strong>Límite de 2 rechazos alcanzado:</strong> Esta proforma ha pasado al flujo de resolución CAM.
                                </p>
                              </div>
                            )}

                            {/* Línea de tiempo horizontal */}
                            <div className="pt-2">
                              <div className="flex items-stretch gap-4 overflow-x-auto pb-3">
                                {versionesLista.map((hist, hIdx) => {
                                  const esUltima = hIdx === versionesLista.length - 1;
                                  const esAnterior = !esUltima;
                                  const esAprob = !!hist.fechaAprobacion && !esAnterior;
                                  const esRech = !!hist.fechaRechazo || esAnterior;
                                  const motivoTexto =
                                    hist.motivo ||
                                    (esAnterior
                                      ? hist.version === 'v1'
                                        ? 'Diferencia en recubitaje / medidas de SKUs'
                                        : 'Rechazo comercial por cliente / Ajuste de medidas'
                                      : undefined);
                                  const respaldoUrl =
                                    hist.respaldoCorreoUrl || (esAnterior ? '/demo_email_rechazado.png' : undefined);
                                  const fechaRespuesta =
                                    hist.fechaAprobacion ||
                                    hist.fechaRechazo ||
                                    (esAnterior ? hist.fechaCreacion : '— Pendiente de validación');

                                  return (
                                    <React.Fragment key={hIdx}>
                                      {/* Tarjeta de la versión en formato horizontal */}
                                      <div className="min-w-[290px] max-w-[360px] flex-1 bg-white dark:bg-slate-800 border border-purple-100 dark:border-white/10 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between relative group">
                                        {/* Cabecera de la versión */}
                                        <div className="space-y-3">
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                              <div
                                                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[11px] font-extrabold shrink-0 shadow-xs ${
                                                  esAprob
                                                    ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400'
                                                    : esRech
                                                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-400'
                                                    : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-400'
                                                }`}
                                              >
                                                {hist.version.toUpperCase()}
                                              </div>
                                              <div>
                                                <span className="font-extrabold text-body text-gray-900 dark:text-gray-100 block leading-tight">
                                                  Versión {hist.version.toUpperCase()}
                                                </span>
                                                {esUltima && (
                                                  <span className="text-[10px] font-extrabold text-purple-700 dark:text-purple-300">
                                                    ★ Versión Vigente
                                                  </span>
                                                )}
                                              </div>
                                            </div>

                                            <span
                                              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shrink-0 ${
                                                esAprob
                                                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                                                  : esRech
                                                  ? 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-200'
                                                  : 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200'
                                              }`}
                                            >
                                              {esAprob ? 'Aprobada' : esRech ? 'Rechazada' : hist.estado || 'Pendiente de validación'}
                                            </span>
                                          </div>

                                          {/* Monto Neto */}
                                          <div className="bg-purple-50/50 dark:bg-white/5 p-2.5 rounded-lg border border-purple-900/5 dark:border-white/5 flex items-center justify-between">
                                            <span className="text-micro font-medium text-gray-500 dark:text-gray-400">
                                              Monto Neto:
                                            </span>
                                            <span className="font-mono font-bold text-body text-gray-900 dark:text-gray-100">
                                              {formatCurrency(hist.monto)}
                                            </span>
                                          </div>

                                          {/* Fechas de Creación y Respuesta */}
                                          <div className="space-y-1.5 text-caption pt-1 border-t border-gray-100 dark:border-white/5">
                                            <div className="flex items-center justify-between text-micro">
                                              <span className="text-gray-500 dark:text-gray-400 font-medium">
                                                Fecha Creación:
                                              </span>
                                              <span className="font-mono text-gray-800 dark:text-gray-200 font-semibold">
                                                {hist.fechaCreacion}
                                              </span>
                                            </div>
                                            <div className="flex items-center justify-between text-micro">
                                              <span className="text-gray-500 dark:text-gray-400 font-medium">
                                                Respuesta Cliente:
                                              </span>
                                              <span
                                                className={`font-mono font-semibold ${
                                                  esAprob
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : esRech
                                                    ? 'text-rose-600 dark:text-rose-400'
                                                    : 'text-amber-700 dark:text-amber-400'
                                                }`}
                                              >
                                                {fechaRespuesta}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Motivo de rechazo si aplica */}
                                          {motivoTexto && (
                                            <div className="p-2 bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg text-micro text-rose-800 dark:text-rose-300 flex items-start gap-1.5">
                                              <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                              <div>
                                                <strong>Motivo:</strong> {motivoTexto}
                                              </div>
                                            </div>
                                          )}

                                          {/* Respaldo de correo si aplica */}
                                          {respaldoUrl && (
                                            <a
                                              href={respaldoUrl}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="inline-flex items-center gap-1.5 text-purple-700 dark:text-purple-400 hover:underline font-semibold text-micro"
                                            >
                                              <FileImage className="w-3.5 h-3.5" />
                                              Ver pantallazo correo ↗
                                            </a>
                                          )}
                                        </div>

                                        {/* Botón de descarga en el pie de la tarjeta */}
                                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                                          <button
                                            type="button"
                                            onClick={() => handleDescargarVersion(p.id, hist.version)}
                                            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-600 hover:text-white text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-lg text-micro font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Descargar Proforma ({hist.version.toUpperCase()})</span>
                                          </button>
                                        </div>
                                      </div>

                                      {/* Conector horizontal flecha si hay más versiones */}
                                      {hIdx < versionesLista.length - 1 && (
                                        <div className="hidden sm:flex items-center text-purple-300 dark:text-purple-800 shrink-0 self-center">
                                          <div className="w-6 h-0.5 bg-purple-200 dark:bg-purple-800/50" />
                                        </div>
                                      )}
                                    </React.Fragment>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Cambiar Estado — Respuesta del Cliente (con pantallazo de respaldo) */}
      {selectedRespuesta && (
        <RespuestaClienteModal
          proforma={selectedRespuesta.proforma}
          initialTipo={selectedRespuesta.tipo}
          onClose={() => setSelectedRespuesta(null)}
          onSuccess={handleProformaActualizada}
        />
      )}
    </div>
  );
}
