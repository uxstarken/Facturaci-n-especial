'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  ChevronDown,
  FileText,
  X,
  Check,
  Sparkles,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { useTheme } from '@/context/theme-context';
import { useToast } from '@/context/toast-context';
import { formatCurrency, getInitials } from '@/lib/utils';

export interface SolicitudAprobacion {
  id: string;
  analista: {
    nombre: string;
    email: string;
    rol: string;
  };
  cliente: {
    razonSocial: string;
    rutFormateado: string;
    cuentas: string;
  };
  fechaSolicitud: string;
  montoNeto: number;
  totalOfs: number;
  ofsObservadas: number;
  estado: 'Pendiente' | 'Autorizada' | 'Rechazada';
  condiciones: {
    cargaValorada: string;
    consolidado: string;
    descuento: string;
  };
  observacionesAnalista: string;
  motivoRechazo?: string;
}

const MOCK_SOLICITUDES_INICIALES: SolicitudAprobacion[] = [
  {
    id: 'PF-2026-0150',
    analista: {
      nombre: 'Rodrigo Morales',
      email: 'rodrigo.morales@starken.cl',
      rol: 'Analista Sénior FE',
    },
    cliente: {
      razonSocial: 'Falabella Retail S.A.',
      rutFormateado: '76.123.456-7',
      cuentas: 'CTA-9021 (Retail) | CTA-9022 (E-commerce)',
    },
    fechaSolicitud: '20/08/2026 09:45',
    montoNeto: 14500900,
    totalOfs: 1420,
    ofsObservadas: 18,
    estado: 'Pendiente',
    condiciones: {
      cargaValorada: '1.2% del declarado',
      consolidado: 'Tramo 1,000+ envíos (Frecuencia semanal)',
      descuento: '15% Descuento Volumen E-commerce',
    },
    observacionesAnalista:
      'Se aplicó regularización por re-cubitaje en 18 OFs con discrepancias de volumen. Cliente aceptó ajuste de tarifa negociada para entregas nocturnas.',
  },
  {
    id: 'PF-2026-0148',
    analista: {
      nombre: 'Camila Sepúlveda',
      email: 'camila.sepulveda@starken.cl',
      rol: 'Analista de Tarificaciones',
    },
    cliente: {
      razonSocial: 'Ripley Chile S.A.',
      rutFormateado: '89.432.100-K',
      cuentas: 'CTA-4410 (Corporativo)',
    },
    fechaSolicitud: '20/08/2026 09:10',
    montoNeto: 8920400,
    totalOfs: 850,
    ofsObservadas: 5,
    estado: 'Pendiente',
    condiciones: {
      cargaValorada: '1.5% estándar',
      consolidado: 'Sin consolidado especial',
      descuento: '10% Cliente Preferente',
    },
    observacionesAnalista:
      'Proforma generada según acuerdo comercial marco Q3. Se regularizaron 5 OFs sin registro previo de peso en balanza.',
  },
  {
    id: 'PF-2026-0145',
    analista: {
      nombre: 'Gonzalo Henríquez',
      email: 'gonzalo.henriquez@starken.cl',
      rol: 'Analista Operaciones FE',
    },
    cliente: {
      razonSocial: 'Cencosud Shopping Centers',
      rutFormateado: '96.888.770-3',
      cuentas: 'CTA-8801 (Mall Costanera) | CTA-8802 (Jumbo)',
    },
    fechaSolicitud: '19/08/2026 17:30',
    montoNeto: 23150000,
    totalOfs: 2300,
    ofsObservadas: 42,
    estado: 'Pendiente',
    condiciones: {
      cargaValorada: '0.9% Especial Gran Volumen',
      consolidado: 'Consolidación Diaria Automatizada',
      descuento: '18% Descuento Especial Subgerencia',
    },
    observacionesAnalista:
      'Ajuste por sobrecargas en pallets no estandarizados. Requiere aprobación de subgerencia por superar los 20M de pesos netos.',
  },
  {
    id: 'PF-2026-0139',
    analista: {
      nombre: 'Rodrigo Morales',
      email: 'rodrigo.morales@starken.cl',
      rol: 'Analista Sénior FE',
    },
    cliente: {
      razonSocial: 'Sodimac S.A.',
      rutFormateado: '96.792.000-8',
      cuentas: 'CTA-3011 (Constructor) | CTA-3012 (Hogar)',
    },
    fechaSolicitud: '19/08/2026 11:20',
    montoNeto: 12400000,
    totalOfs: 1100,
    ofsObservadas: 8,
    estado: 'Autorizada',
    condiciones: {
      cargaValorada: '1.0% Carga Pesada',
      consolidado: 'Consolidación Semanal Directa',
      descuento: '12% Convenio Marco',
    },
    observacionesAnalista:
      'Proforma revisada y aprobada por el supervisor previa facturación mensual de agosto.',
  },
  {
    id: 'PF-2026-0135',
    analista: {
      nombre: 'Camila Sepúlveda',
      email: 'camila.sepulveda@starken.cl',
      rol: 'Analista de Tarificaciones',
    },
    cliente: {
      razonSocial: 'Easy Retail Chile',
      rutFormateado: '77.200.400-1',
      cuentas: 'CTA-5501 (Distribución Regional)',
    },
    fechaSolicitud: '18/08/2026 16:40',
    montoNeto: 6750000,
    totalOfs: 620,
    ofsObservadas: 2,
    estado: 'Autorizada',
    condiciones: {
      cargaValorada: '1.4% estándar',
      consolidado: 'Consolidado Bi-semanal',
      descuento: '8% Preferencial',
    },
    observacionesAnalista:
      'Tarifas y descuentos validados conforme al contrato vigente.',
  },
  {
    id: 'PF-2026-0130',
    analista: {
      nombre: 'Valeria Orellana',
      email: 'valeria.orellana@starken.cl',
      rol: 'Analista Júnior FE',
    },
    cliente: {
      razonSocial: 'Unimarc Logística',
      rutFormateado: '81.500.300-5',
      cuentas: 'CTA-7710 (Supermercados)',
    },
    fechaSolicitud: '18/08/2026 14:05',
    montoNeto: 3120000,
    totalOfs: 290,
    ofsObservadas: 14,
    estado: 'Rechazada',
    condiciones: {
      cargaValorada: '1.5% estándar',
      consolidado: 'Sin consolidado',
      descuento: '5% Inicial',
    },
    observacionesAnalista:
      'Solicitud rechazada por discrepancias en medidas de SKUs no documentadas.',
    motivoRechazo: 'Diferencia en recubitaje / medidas de SKUs',
  },
];

const MOTIVOS_RECHAZO_PREDETERMINADOS = [
  'Inconsistencia en Tarifas / Descuentos negociados',
  'Diferencia en recubitaje / medidas de SKUs',
  'Falta documentación o respaldo de cliente',
  'Error en la selección de Cuentas Corrientes',
  'Solicitud duplicada o emitida por error',
  'Otro motivo (Especificar en observaciones)',
];

export default function AprobacionesPage() {
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [solicitudes, setSolicitudes] = useState<SolicitudAprobacion[]>(MOCK_SOLICITUDES_INICIALES);
  const [activeTab, setActiveTab] = useState<'Pendiente' | 'Autorizada' | 'Rechazada'>('Pendiente');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('PF-2026-0150');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // State para modales de Autorización y Rechazo
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudAprobacion | null>(null);
  const [showAutorizarModal, setShowAutorizarModal] = useState(false);
  const [showRechazarModal, setShowRechazarModal] = useState(false);
  const [motivoRechazoSelect, setMotivoRechazoSelect] = useState(MOTIVOS_RECHAZO_PREDETERMINADOS[0]);
  const [motivoSelectOpen, setMotivoSelectOpen] = useState(false);

  // Toggle expansión de detalle
  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Conteo de items por estado
  const pendientesCount = solicitudes.filter((s) => s.estado === 'Pendiente').length;
  const autorizadasCount = solicitudes.filter((s) => s.estado === 'Autorizada').length;
  const rechazadasCount = solicitudes.filter((s) => s.estado === 'Rechazada').length;

  // Filtrado de solicitudes según el Tab Activo y Término de Búsqueda
  const filteredSolicitudes = solicitudes.filter((s) => {
    const matchesTab = s.estado === activeTab;
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cliente.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cliente.rutFormateado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.analista.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Descargar proforma simulada
  const handleDownloadProforma = (solicitud: SolicitudAprobacion) => {
    showToast(`Descargando detalle en Excel para la proforma ${solicitud.id}...`, 'info');
    setTimeout(() => {
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        `Proforma,Cliente,Analista,MontoNeto,Fecha,Estado\n` +
        `"${solicitud.id}","${solicitud.cliente.razonSocial}","${solicitud.analista.nombre}","${solicitud.montoNeto}","${solicitud.fechaSolicitud}","${solicitud.estado}"`;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Proforma_${solicitud.id}_Detalle.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`Archivo Proforma_${solicitud.id}_Detalle.csv descargado correctamente.`, 'success');
    }, 600);
  };

  // Confirmar Autorización
  const handleConfirmAutorizar = () => {
    if (!selectedSolicitud) return;

    setSolicitudes((prev) =>
      prev.map((s) => (s.id === selectedSolicitud.id ? { ...s, estado: 'Autorizada' } : s))
    );

    showToast(
      `Proforma ${selectedSolicitud.id} autorizada con éxito y trasladada al panel de Autorizadas.`,
      'success',
      5500,
      'Proforma Movida a Autorizadas'
    );

    setShowAutorizarModal(false);
    setSelectedSolicitud(null);
  };

  // Confirmar Rechazo
  const handleConfirmRechazar = () => {
    if (!selectedSolicitud) return;

    setSolicitudes((prev) =>
      prev.map((s) =>
        s.id === selectedSolicitud.id
          ? { ...s, estado: 'Rechazada', motivoRechazo: motivoRechazoSelect }
          : s
      )
    );

    showToast(
      `Proforma ${selectedSolicitud.id} fue rechazada y trasladada al panel de Rechazadas. Motivo: ${motivoRechazoSelect}`,
      'warning',
      6000,
      'Proforma Movida a Rechazadas'
    );

    setShowRechazarModal(false);
    setMotivoRechazoSelect(MOTIVOS_RECHAZO_PREDETERMINADOS[0]);
    setSelectedSolicitud(null);
  };

  // Reabrir proforma (volver a Pendiente)
  const handleReabrirProforma = (solicitud: SolicitudAprobacion) => {
    setSolicitudes((prev) =>
      prev.map((s) => (s.id === solicitud.id ? { ...s, estado: 'Pendiente', motivoRechazo: undefined } : s))
    );

    showToast(
      `Proforma ${solicitud.id} reabierta y trasladada nuevamente a Solicitudes Pendientes.`,
      'info',
      5000,
      'Proforma Reabierta'
    );
  };

  return (
    <div className="max-w-[1560px] mx-auto space-y-6 pb-12">
      {/* Header de la Bandeja */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[26px] font-extrabold text-purple-950 dark:text-purple-100 tracking-tight">
              Bandeja de Aprobaciones de Proformas
            </h1>
            <span className="bg-purple-100 dark:bg-purple-500/20 text-purple-900 dark:text-purple-300 font-bold text-caption px-2.5 py-1 rounded-full border border-purple-200 dark:border-white/10">
              Módulo Supervisor
            </span>
          </div>
          <p className="text-body text-gray-500 dark:text-gray-400 mt-1">
            Haz clic en las tarjetas de estado para filtrar las proformas pendientes, autorizadas o rechazadas.
          </p>
        </div>
      </div>

      {/* TARJETAS KPI CLIQUEABLES / TABS DE NAVEGACIÓN */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Solicitudes Pendientes */}
        <button
          type="button"
          onClick={() => setActiveTab('Pendiente')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex items-center justify-between group ${
            activeTab === 'Pendiente'
              ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 shadow-md scale-[1.01]'
              : 'bg-white dark:bg-slate-800 border-purple-900/10 dark:border-white/10 hover:border-amber-400 hover:shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-caption text-gray-600 dark:text-gray-400 font-extrabold uppercase tracking-wider">
                Solicitudes Pendientes
              </span>
              {activeTab === 'Pendiente' && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              )}
            </div>
            <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 leading-none mt-2 block font-mono">
              {pendientesCount}
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
              activeTab === 'Pendiente'
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-white/10 group-hover:scale-105'
            }`}
          >
            <Clock className="w-6 h-6" />
          </div>
        </button>

        {/* Card 2: Proformas Autorizadas */}
        <button
          type="button"
          onClick={() => setActiveTab('Autorizada')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex items-center justify-between group ${
            activeTab === 'Autorizada'
              ? 'bg-emerald-500/10 dark:bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md scale-[1.01]'
              : 'bg-white dark:bg-slate-800 border-purple-900/10 dark:border-white/10 hover:border-emerald-400 hover:shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-caption text-gray-600 dark:text-gray-400 font-extrabold uppercase tracking-wider">
                Proformas Autorizadas
              </span>
              {activeTab === 'Autorizada' && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none mt-2 block font-mono">
              {autorizadasCount}
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
              activeTab === 'Autorizada'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-white/10 group-hover:scale-105'
            }`}
          >
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </button>

        {/* Card 3: Proformas Rechazadas */}
        <button
          type="button"
          onClick={() => setActiveTab('Rechazada')}
          className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex items-center justify-between group ${
            activeTab === 'Rechazada'
              ? 'bg-rose-500/10 dark:bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/30 shadow-md scale-[1.01]'
              : 'bg-white dark:bg-slate-800 border-purple-900/10 dark:border-white/10 hover:border-rose-400 hover:shadow-xs'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-caption text-gray-600 dark:text-gray-400 font-extrabold uppercase tracking-wider">
                Proformas Rechazadas
              </span>
              {activeTab === 'Rechazada' && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>
            <span className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 leading-none mt-2 block font-mono">
              {rechazadasCount}
            </span>
          </div>
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all ${
              activeTab === 'Rechazada'
                ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-white/10 group-hover:scale-105'
            }`}
          >
            <XCircle className="w-6 h-6" />
          </div>
        </button>
      </div>

      {/* Tabla Principal de Solicitudes */}
      <div className="bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-xl shadow-sm overflow-hidden space-y-0">
        {/* Buscador y Titular del Tab Activo */}
        <div className="p-4 border-b border-purple-900/10 dark:border-white/10 bg-purple-50/30 dark:bg-white/5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full ${
                activeTab === 'Pendiente'
                  ? 'bg-amber-500 animate-ping'
                  : activeTab === 'Autorizada'
                  ? 'bg-emerald-500'
                  : 'bg-rose-500'
              }`}
            />
            <h2 className="text-body font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
              {activeTab === 'Pendiente'
                ? 'Solicitudes Pendientes de Aprobación'
                : activeTab === 'Autorizada'
                ? 'Proformas Autorizadas'
                : 'Proformas Rechazadas'}
            </h2>
          </div>

          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por N° proforma, analista o cliente..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900/50 border border-purple-900/15 dark:border-white/10 rounded-lg text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 shadow-xs"
            />
          </div>

          <span className="text-caption text-gray-500 font-semibold">
            Mostrando {filteredSolicitudes.length} proformas
          </span>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          {filteredSolicitudes.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-white/5 mx-auto flex items-center justify-center text-purple-600 dark:text-purple-400">
                {activeTab === 'Pendiente' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <FileText className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <h3 className="text-body font-bold text-gray-800 dark:text-gray-200">
                {activeTab === 'Pendiente'
                  ? '¡Excelente! No hay solicitudes pendientes por revisar.'
                  : `No hay proformas en estado "${activeTab}" en este momento.`}
              </h3>
              <p className="text-caption text-gray-500 max-w-sm mx-auto">
                {activeTab === 'Pendiente'
                  ? 'Todas las solicitudes han sido resueltas o puedes cambiar de pestaña para revisar autorizadas y rechazadas.'
                  : 'Cuando cambies el estado de una proforma, aparecerá registrada en esta pestaña.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-body">
              <thead className="bg-purple-50/50 dark:bg-white/5 border-b border-purple-900/10 dark:border-white/10 text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider text-micro">
                <tr>
                  <th className="py-3.5 px-4">Analista Creador</th>
                  <th className="py-3.5 px-4">N° Proforma & Fecha</th>
                  <th className="py-3.5 px-4">Cliente & RUT</th>
                  <th className="py-3.5 px-4">Monto Final Neto</th>
                  <th className="py-3.5 px-4 text-center">Descargar</th>
                  <th className="py-3.5 px-4 text-right">Acciones Supervisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100/60 dark:divide-white/5">
                {filteredSolicitudes.map((item) => {
                  const isExpanded = expandedId === item.id;

                  return (
                    <React.Fragment key={item.id}>
                      {/* Fila Principal */}
                      <tr
                        className={`transition-colors ${
                          isExpanded
                            ? 'bg-purple-50/60 dark:bg-purple-500/10'
                            : 'hover:bg-purple-50/30 dark:hover:bg-white/5'
                        }`}
                      >
                        {/* Analista Creador */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200 dark:border-white/10">
                              {getInitials(item.analista.nombre)}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 dark:text-gray-100 block leading-tight">
                                {item.analista.nombre}
                              </span>
                              <span className="text-micro text-gray-500 dark:text-gray-400 block font-medium">
                                {item.analista.rol}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* ID Proforma & Fecha */}
                        <td className="py-4 px-4 font-mono font-bold">
                          <span className="text-purple-950 dark:text-purple-200 block text-body">{item.id}</span>
                          <span className="text-micro text-gray-500 font-medium font-sans block mt-0.5">
                            {item.fechaSolicitud}
                          </span>
                        </td>

                        {/* Cliente & RUT */}
                        <td className="py-4 px-4">
                          <span className="font-bold text-gray-900 dark:text-gray-100 block leading-tight">
                            {item.cliente.razonSocial}
                          </span>
                          <span className="text-micro font-mono text-purple-700 dark:text-purple-400 font-semibold block mt-0.5">
                            RUT: {item.cliente.rutFormateado}
                          </span>
                        </td>

                        {/* Monto Final Neto */}
                        <td className="py-4 px-4 font-mono font-extrabold text-purple-950 dark:text-purple-200 text-body">
                          {formatCurrency(item.montoNeto)}
                        </td>

                        {/* Descargar Proforma */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDownloadProforma(item)}
                            title="Descargar detalle en Excel (.xlsx / .csv)"
                            className="px-3 py-1.5 bg-white dark:bg-slate-900/50 border border-purple-200 dark:border-white/10 hover:border-purple-600 text-purple-950 dark:text-purple-200 font-bold text-caption rounded-lg transition-all inline-flex items-center gap-1.5 shadow-2xs group cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                            <span>Descargar</span>
                          </button>
                        </td>

                        {/* Acciones Supervisor + Icono Desplegable Detalle */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            {item.estado === 'Pendiente' ? (
                              <div className="relative inline-block text-left">
                                <button
                                  type="button"
                                  onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                  className="px-3 py-1.5 bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-white/10 hover:border-purple-600 text-purple-950 dark:text-purple-200 font-bold text-caption rounded-lg transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                                >
                                  <span>Resolver</span>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>

                                {openMenuId === item.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() => setOpenMenuId(null)}
                                    />
                                    <div className="absolute right-0 top-9 w-44 bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-xl shadow-xl z-20 p-1.5 space-y-1 animate-in fade-in duration-100 text-left">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          setSelectedSolicitud(item);
                                          setShowAutorizarModal(true);
                                        }}
                                        className="w-full px-3 py-2 text-left text-caption font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                                      >
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                        <span>Autorizar</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenMenuId(null);
                                          setSelectedSolicitud(item);
                                          setMotivoRechazoSelect(MOTIVOS_RECHAZO_PREDETERMINADOS[0]);
                                          setShowRechazarModal(true);
                                        }}
                                        className="w-full px-3 py-2 text-left text-caption font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                                      >
                                        <XCircle className="w-4 h-4 text-rose-600" />
                                        <span>Rechazar</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ) : item.estado === 'Autorizada' ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 h-[25px] px-2.5 rounded-md text-micro font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Autorizada
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleReabrirProforma(item)}
                                  title="Reabrir proforma y mover a pendientes"
                                  className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 rounded-md hover:bg-purple-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 h-[25px] px-2.5 rounded-md text-micro font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-800 dark:text-rose-300 border border-rose-300">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rechazada
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleReabrirProforma(item)}
                                  title="Reabrir proforma y mover a pendientes"
                                  className="p-1 text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 rounded-md hover:bg-purple-50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Icono Desplegable Detalle a la Derecha con Animación de Rotación */}
                            <button
                              type="button"
                              onClick={() => toggleExpand(item.id)}
                              title={isExpanded ? 'Ocultar detalle' : 'Ver detalle completo'}
                              className={`p-1.5 rounded-lg transition-all duration-200 border shrink-0 cursor-pointer ${
                                isExpanded
                                  ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-950 dark:text-purple-200 border-purple-300 dark:border-white/10 shadow-2xs'
                                  : 'bg-white dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-white/5 hover:text-purple-700'
                              }`}
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-300 ease-out ${
                                  isExpanded ? 'rotate-180 text-purple-700 dark:text-purple-300' : ''
                                }`}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Fila Desplegable Expandible (Accordion Detalle) */}
                      {isExpanded && (
                        <tr className="bg-purple-50/40 dark:bg-slate-900/60 border-b border-purple-100 dark:border-white/10">
                          <td colSpan={6} className="p-4 sm:p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-white dark:bg-slate-800 border border-purple-100 dark:border-white/10 rounded-xl p-5 shadow-2xs space-y-4">
                              {/* Titular del Desplegable */}
                              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                  <span className="font-extrabold text-caption uppercase tracking-wider text-purple-950 dark:text-purple-200">
                                    Detalle Técnico & Condiciones Comerciales ({item.id})
                                  </span>
                                </div>
                                <span className="text-micro font-medium text-gray-500">
                                  Cuentas afectadas: <strong className="text-gray-800 dark:text-gray-200">{item.cliente.cuentas}</strong>
                                </span>
                              </div>

                              {/* Grid 3 Columnas de Resumen */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* 1. Condiciones del Acuerdo */}
                                <div className="bg-purple-50/50 dark:bg-white/5 p-3.5 rounded-lg border border-purple-100 dark:border-white/10 space-y-2">
                                  <span className="text-micro font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                                    Acuerdo Comercial Aplicado
                                  </span>
                                  <ul className="text-caption space-y-1 text-gray-700 dark:text-gray-300 font-medium">
                                    <li className="flex items-center justify-between">
                                      <span>Carga Valorada:</span>
                                      <strong className="text-purple-950 dark:text-purple-200">{item.condiciones.cargaValorada}</strong>
                                    </li>
                                    <li className="flex items-center justify-between">
                                      <span>Consolidado:</span>
                                      <strong className="text-purple-950 dark:text-purple-200">{item.condiciones.consolidado}</strong>
                                    </li>
                                    <li className="flex items-center justify-between">
                                      <span>Descuento Aplicado:</span>
                                      <strong className="text-purple-950 dark:text-purple-200">{item.condiciones.descuento}</strong>
                                    </li>
                                  </ul>
                                </div>

                                {/* 2. Conteo de OFs e Inconsistencias */}
                                <div className="bg-purple-50/50 dark:bg-white/5 p-3.5 rounded-lg border border-purple-100 dark:border-white/10 space-y-2">
                                  <span className="text-micro font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                                    Resumen Volumétrico de OFs
                                  </span>
                                  <div className="space-y-1 text-caption">
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 dark:text-gray-400">Total OFs procesadas:</span>
                                      <strong className="font-mono text-gray-900 dark:text-gray-100">{item.totalOfs} OFs</strong>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="text-gray-600 dark:text-gray-400">OFs con discrepancias medidas:</span>
                                      <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                                        {item.ofsObservadas} OFs
                                      </span>
                                    </div>
                                    <p className="text-micro text-gray-500 mt-1">
                                      *Regularizaciones de SKU alineadas al máster de productos Starken.
                                    </p>
                                  </div>
                                </div>

                                {/* 3. Nota / Observaciones del Analista */}
                                <div className="bg-purple-50/50 dark:bg-white/5 p-3.5 rounded-lg border border-purple-100 dark:border-white/10 space-y-1.5">
                                  <span className="text-micro font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider block">
                                    Nota del Analista ({item.analista.nombre.split(' ')[0]})
                                  </span>
                                  <p className="text-caption text-gray-700 dark:text-gray-300 italic leading-relaxed">
                                    "{item.observacionesAnalista}"
                                  </p>
                                </div>
                              </div>

                              {/* Mostrar motivo de rechazo si fue devuelta */}
                              {item.motivoRechazo && (
                                <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-lg text-caption text-rose-800 dark:text-rose-300 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                  <span>
                                    <strong>Motivo de Rechazo registrado:</strong> {item.motivoRechazo}
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* MODAL DE CONFIRMACIÓN DE AUTORIZACIÓN */}
      {showAutorizarModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150 relative">
            {/* Botón Cerrar X Esquina Superior Derecha */}
            <button
              type="button"
              onClick={() => {
                setShowAutorizarModal(false);
                setSelectedSolicitud(null);
              }}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3 border-b border-gray-100 dark:border-white/10 pb-3 pr-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-title-2 font-extrabold text-gray-900 dark:text-gray-100 leading-snug">
                  ¿Autorizar Proforma {selectedSolicitud.id}?
                </h3>
                <p className="text-caption text-gray-500 font-medium">
                  Cliente: <strong className="text-gray-800 dark:text-gray-200">{selectedSolicitud.cliente.razonSocial}</strong>
                </p>
              </div>
            </div>

            <p className="text-body text-gray-600 dark:text-gray-300">
              Al autorizar esta proforma por un monto de{' '}
              <strong className="text-purple-950 dark:text-purple-200 font-mono">
                {formatCurrency(selectedSolicitud.montoNeto)}
              </strong>
              , se notificará automáticamente al analista <strong className="text-gray-800 dark:text-gray-200">{selectedSolicitud.analista.nombre}</strong> y se trasladará a la pestaña de Autorizadas.
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAutorizarModal(false);
                  setSelectedSolicitud(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold text-body rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAutorizar}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-body rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Sí, Autorizar Proforma
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RECHAZO DE PROFORMA */}
      {showRechazarModal && selectedSolicitud && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-150 relative">
            {/* Botón Cerrar X Esquina Superior Derecha */}
            <button
              type="button"
              onClick={() => {
                setShowRechazarModal(false);
                setSelectedSolicitud(null);
              }}
              className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header del Modal */}
            <div className="flex items-start gap-3 border-b border-gray-100 dark:border-white/10 pb-3 pr-6">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-title-2 font-extrabold text-gray-900 dark:text-gray-100 leading-snug">
                  ¿Deseas rechazar la proforma
                  <span className="block font-mono text-purple-950 dark:text-purple-200 mt-0.5">
                    {selectedSolicitud.id}?
                  </span>
                </h3>
                <p className="text-caption text-gray-500 font-medium">
                  Cliente: <strong className="text-gray-800 dark:text-gray-200">{selectedSolicitud.cliente.razonSocial}</strong>
                </p>
              </div>
            </div>

            {/* Parrafo corto */}
            <p className="text-body text-gray-600 dark:text-gray-300">
              La proforma será devuelta al analista <strong className="text-gray-800 dark:text-gray-200">{selectedSolicitud.analista.nombre}</strong> para su revisión.
            </p>

            {/* Custom Modern Dropdown Selector de Motivos */}
            <div className="relative space-y-1.5">
              <label className="text-caption font-bold text-gray-800 dark:text-gray-200 block">
                Selecciona el motivo de rechazo <span className="text-rose-500">*</span>
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
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-xl shadow-xl z-30 p-1.5 space-y-1 max-h-60 overflow-y-auto animate-in fade-in duration-150">
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

            {/* Acciones del Modal */}
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowRechazarModal(false);
                  setSelectedSolicitud(null);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 font-bold text-body rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRechazar}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-body rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Sí, Rechazar y Devolver</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
