'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Clock,
  Check,
  CheckCircle2,
  XCircle,
  Hourglass,
  Layers,
  Search,
  Filter,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  DollarSign,
  Briefcase,
  GitCompare,
  RotateCcw,
  Receipt,
  UserCheck,
  UserX,
} from 'lucide-react';
import { MOCK_PROFORMAS, MOCK_EXECUTIVES, MOCK_CLIENTS } from '@/lib/mock-data';
import { DashboardFiltersState } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { Tooltip } from '@/components/ui/tooltip';

type DashboardTab = 'comercial' | 'ejecutivos' | 'analistas' | 'clientes' | 'proformas_supervision';
type JefeKpiFilterType = 'todos' | 'aprobadas' | 'revision' | 'rechazadas' | 'facturadas';

export function JefeDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('comercial');
  const [kpiFilter, setKpiFilter] = useState<JefeKpiFilterType>('todos');

  // Filtros del Dashboard (Punto 10 Requerimiento Jira)
  const [filters, setFilters] = useState<DashboardFiltersState>({
    periodo: 'mes',
    ejecutivoId: 'todos',
    clienteId: 'todos',
    rut: '',
    cuentaCorriente: '',
    estadoProforma: 'todos',
    version: 'todos',
    resultadoAprobacion: 'todos',
    motivoRechazo: 'todos',
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Proformas base filtradas por el período seleccionado en el selector superior
  const periodoFilteredProformas = useMemo(() => {
    switch (filters.periodo) {
      case 'hoy':
        // Proformas de la jornada actual (2 proformas)
        return MOCK_PROFORMAS.filter((p) => p.id === 'PF-2026-0208' || p.id === 'PF-2025-0141');
      case 'semana':
        // Proformas de la semana en curso (4 proformas)
        return MOCK_PROFORMAS.filter(
          (p) =>
            p.id === 'PF-2026-0208' ||
            p.id === 'PF-2026-0204' ||
            p.id === 'PF-2025-0141' ||
            p.id === 'PF-2025-0140'
        );
      case 'mes':
        // Proformas del mes actual / Septiembre 2026 (6 proformas)
        return MOCK_PROFORMAS.filter(
          (p) =>
            p.id === 'PF-2026-0208' ||
            p.id === 'PF-2026-0204' ||
            p.id === 'PF-2025-0141' ||
            p.id === 'PF-2025-0140' ||
            p.id === 'PF-2025-0143' ||
            p.id === 'PF-2025-0142'
        );
      case 'trimestre':
        // Proformas del Q3 (7 proformas)
        return MOCK_PROFORMAS.filter(
          (p) =>
            p.id === 'PF-2026-0208' ||
            p.id === 'PF-2026-0204' ||
            p.id === 'PF-2025-0141' ||
            p.id === 'PF-2025-0140' ||
            p.id === 'PF-2025-0143' ||
            p.id === 'PF-2025-0142' ||
            p.id === 'PF-2025-0139'
        );
      case 'ano':
      case 'todos':
      default:
        // Todo el año 2026 o historial completo (8 proformas)
        return MOCK_PROFORMAS;
    }
  }, [filters.periodo]);

  // Proformas filtradas específicamente por la card de KPI seleccionada
  const kpiFilteredProformas = useMemo(() => {
    if (kpiFilter === 'todos') return [];
    return periodoFilteredProformas.filter((p) => {
      if (kpiFilter === 'aprobadas') {
        return p.estado.includes('Aprobada') || p.estado === 'Facturado';
      }
      if (kpiFilter === 'revision') {
        return p.estado === 'Pendiente de validación' || p.estadoSupervision === 'Pendiente_Autorizacion';
      }
      if (kpiFilter === 'rechazadas') {
        return p.estado.includes('Rechazada') || p.estado === 'Derivada a KAM';
      }
      if (kpiFilter === 'facturadas') {
        return p.estado === 'Facturado';
      }
      return true;
    });
  }, [kpiFilter, periodoFilteredProformas]);

  // Proformas filtradas dinámicamente por la barra de filtros y búsqueda
  const dynamicFilteredProformas = useMemo(() => {
    return periodoFilteredProformas.filter((p) => {
      if (filters.ejecutivoId !== 'todos' && p.ejecutivoId !== filters.ejecutivoId) return false;
      if (filters.estadoProforma !== 'todos' && p.estado !== filters.estadoProforma) return false;
      if (filters.version !== 'todos' && p.versionActual !== filters.version) return false;
      if (filters.motivoRechazo !== 'todos' && p.motivoRechazoPrincipal !== filters.motivoRechazo) return false;

      if (filters.resultadoAprobacion !== 'todos') {
        if (filters.resultadoAprobacion === 'Aprobada' && !p.estado.includes('Aprobada') && p.estado !== 'Facturado') {
          return false;
        }
        if (filters.resultadoAprobacion === 'Rechazada' && !p.estado.includes('Rechazada')) {
          return false;
        }
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchId = p.id.toLowerCase().includes(term);
        const matchCliente = p.cliente.toLowerCase().includes(term);
        const matchRut = p.rut.toLowerCase().includes(term);
        const matchEjecutivo = p.ejecutivoNombre?.toLowerCase().includes(term);
        return matchId || matchCliente || matchRut || matchEjecutivo;
      }

      return true;
    });
  }, [filters, searchTerm, periodoFilteredProformas]);

  // KPIs Globales Comerciales Calculados Dinámicamente según el Período
  const kpisComerciales = useMemo(() => {
    const list = periodoFilteredProformas;
    const total = list.length || 1;
    const aprobadas = list.filter((p) => p.estado.includes('Aprobada') || p.estado === 'Facturado').length;
    const rechazadas = list.filter((p) => p.estado.includes('Rechazada') || p.estado === 'Derivada a KAM').length;
    const pendientes = list.filter((p) => p.estado === 'Pendiente' || p.estado === 'Pendiente de validación').length;
    const enRevision = list.filter((p) => p.estado === 'Pendiente de validación' || p.estadoSupervision === 'Pendiente_Autorizacion').length;
    const facturadas = list.filter((p) => p.estado === 'Facturado').length;

    const montoTotal = list.reduce((acc, curr) => acc + curr.monto, 0);
    const tasaAprobacion = ((aprobadas / total) * 100).toFixed(1);
    const tasaRechazo = ((rechazadas / total) * 100).toFixed(1);

    // Métricas de tiempo y versiones ajustadas al horizonte temporal
    const tiempoGen =
      filters.periodo === 'hoy'
        ? '0.8'
        : filters.periodo === 'semana'
        ? '1.2'
        : filters.periodo === 'mes'
        ? '1.4'
        : '1.6';

    const tiempoAprob =
      filters.periodo === 'hoy'
        ? '1.1'
        : filters.periodo === 'semana'
        ? '1.8'
        : filters.periodo === 'mes'
        ? '2.2'
        : filters.periodo === 'trimestre'
        ? '2.4'
        : '2.5';

    const promedioVers =
      filters.periodo === 'hoy'
        ? '1.1 v'
        : filters.periodo === 'semana'
        ? '1.2 v'
        : filters.periodo === 'mes'
        ? '1.3 v'
        : '1.4 v';

    return {
      total: list.length,
      montoTotal,
      aprobadas,
      rechazadas,
      pendientes,
      enRevision,
      facturadas,
      tasaAprobacion,
      tasaRechazo,
      tiempoPromedioGeneracion: `${tiempoGen} días`,
      tiempoPromedioGeneracionRaw: tiempoGen,
      tiempoPromedioAprobacion: `${tiempoAprob} días`,
      tiempoPromedioAprobacionRaw: tiempoAprob,
      promedioVersiones: promedioVers,
    };
  }, [periodoFilteredProformas, filters.periodo]);

  // Datos dinámicos de Ejecutivos según el Período seleccionado
  const ejecutivosData = useMemo(() => {
    return MOCK_EXECUTIVES.map((exe) => {
      switch (filters.periodo) {
        case 'hoy': {
          const factor = 0.05;
          const total = Math.max(1, Math.round(exe.proformasTotales * factor));
          const aprobadas = exe.id === 'exe-4' ? 0 : Math.max(0, Math.min(total, Math.round(exe.proformasAprobadas * factor)));
          const rechazadas = exe.id === 'exe-4' ? 1 : 0;
          const pendientes = Math.max(0, total - aprobadas - rechazadas);
          const convertidas = aprobadas;
          const tasaAprob = total > 0 ? Number(((aprobadas / total) * 100).toFixed(1)) : 0;
          const tasaRech = total > 0 ? Number(((rechazadas / total) * 100).toFixed(1)) : 0;
          return {
            ...exe,
            proformasTotales: total,
            proformasAprobadas: aprobadas,
            proformasRechazadas: rechazadas,
            proformasPendientes: pendientes,
            proformasExpiradas: 0,
            proformasConvertidas: convertidas,
            tasaAprobacion: tasaAprob,
            tasaRechazo: tasaRech,
            tiempoPromedioGeneracionDias: Number((exe.tiempoPromedioGeneracionDias * 0.7).toFixed(1)),
            tiempoPromedioAprobacionDias: Number((exe.tiempoPromedioAprobacionDias * 0.7).toFixed(1)),
            promedioVersiones: 1.1,
            cantidadReprocesos: exe.id === 'exe-4' || exe.id === 'exe-1' ? 1 : 0,
          };
        }
        case 'semana': {
          const factor = 0.22;
          const total = Math.max(2, Math.round(exe.proformasTotales * factor));
          const aprobadas = Math.round(exe.proformasAprobadas * factor);
          const rechazadas = Math.max(0, Math.round(exe.proformasRechazadas * factor));
          const pendientes = Math.max(0, total - aprobadas - rechazadas);
          const convertidas = Math.max(0, Math.round(exe.proformasConvertidas * factor));
          const tasaAprob = total > 0 ? Number(((aprobadas / total) * 100).toFixed(1)) : 0;
          const tasaRech = total > 0 ? Number(((rechazadas / total) * 100).toFixed(1)) : 0;
          return {
            ...exe,
            proformasTotales: total,
            proformasAprobadas: aprobadas,
            proformasRechazadas: rechazadas,
            proformasPendientes: pendientes,
            proformasExpiradas: Math.min(1, Math.round(exe.proformasExpiradas * factor)),
            proformasConvertidas: convertidas,
            tasaAprobacion: tasaAprob,
            tasaRechazo: tasaRech,
            tiempoPromedioGeneracionDias: Number((exe.tiempoPromedioGeneracionDias * 0.85).toFixed(1)),
            tiempoPromedioAprobacionDias: Number((exe.tiempoPromedioAprobacionDias * 0.85).toFixed(1)),
            promedioVersiones: Number((exe.promedioVersiones * 0.95).toFixed(1)),
            cantidadReprocesos: Math.max(1, Math.round(exe.cantidadReprocesos * factor)),
          };
        }
        case 'mes': {
          const factor = 0.52;
          const total = Math.max(5, Math.round(exe.proformasTotales * factor));
          const aprobadas = Math.round(exe.proformasAprobadas * factor);
          const rechazadas = Math.round(exe.proformasRechazadas * factor);
          const pendientes = Math.max(1, total - aprobadas - rechazadas);
          const convertidas = Math.round(exe.proformasConvertidas * factor);
          const tasaAprob = total > 0 ? Number(((aprobadas / total) * 100).toFixed(1)) : 0;
          const tasaRech = total > 0 ? Number(((rechazadas / total) * 100).toFixed(1)) : 0;
          return {
            ...exe,
            proformasTotales: total,
            proformasAprobadas: aprobadas,
            proformasRechazadas: rechazadas,
            proformasPendientes: pendientes,
            proformasExpiradas: Math.round(exe.proformasExpiradas * factor),
            proformasConvertidas: convertidas,
            tasaAprobacion: tasaAprob,
            tasaRechazo: tasaRech,
            tiempoPromedioGeneracionDias: exe.tiempoPromedioGeneracionDias,
            tiempoPromedioAprobacionDias: exe.tiempoPromedioAprobacionDias,
            promedioVersiones: exe.promedioVersiones,
            cantidadReprocesos: Math.max(1, Math.round(exe.cantidadReprocesos * factor)),
          };
        }
        case 'trimestre': {
          const factor = 0.82;
          const total = Math.round(exe.proformasTotales * factor);
          const aprobadas = Math.round(exe.proformasAprobadas * factor);
          const rechazadas = Math.round(exe.proformasRechazadas * factor);
          const pendientes = Math.max(1, total - aprobadas - rechazadas);
          const convertidas = Math.round(exe.proformasConvertidas * factor);
          const tasaAprob = total > 0 ? Number(((aprobadas / total) * 100).toFixed(1)) : 0;
          const tasaRech = total > 0 ? Number(((rechazadas / total) * 100).toFixed(1)) : 0;
          return {
            ...exe,
            proformasTotales: total,
            proformasAprobadas: aprobadas,
            proformasRechazadas: rechazadas,
            proformasPendientes: pendientes,
            proformasExpiradas: Math.round(exe.proformasExpiradas * factor),
            proformasConvertidas: convertidas,
            tasaAprobacion: tasaAprob,
            tasaRechazo: tasaRech,
            tiempoPromedioGeneracionDias: exe.tiempoPromedioGeneracionDias,
            tiempoPromedioAprobacionDias: exe.tiempoPromedioAprobacionDias,
            promedioVersiones: exe.promedioVersiones,
            cantidadReprocesos: Math.round(exe.cantidadReprocesos * factor),
          };
        }
        case 'ano':
        case 'todos':
        default:
          return exe;
      }
    });
  }, [filters.periodo]);

  // Datos dinámicos de Clientes según el Período seleccionado
  const clientesData = useMemo(() => {
    return MOCK_CLIENTS.map((client) => {
      switch (filters.periodo) {
        case 'hoy': {
          const isClientActiveToday = client.id === 'cli-1' || client.id === 'cli-2' || client.id === 'cli-4';
          const total = isClientActiveToday ? 1 : 0;
          const aprobadas = client.id === 'cli-2' ? 1 : 0;
          const rechazadas = client.id === 'cli-4' ? 1 : 0;
          const tasaAprob = total > 0 ? (aprobadas / total) * 100 : client.kpis.tasaAprobacion;
          return {
            ...client,
            kpis: {
              ...client.kpis,
              proformasTotales: total,
              proformasAprobadas: aprobadas,
              proformasRechazadas: rechazadas,
              tasaAprobacion: Number(tasaAprob.toFixed(1)),
              cantidadReprocesos: isClientActiveToday ? (client.id === 'cli-4' ? 1 : 0) : 0,
              promedioVersiones: isClientActiveToday ? 1.0 : 1.0,
              tiempoPromedioAprobacionDias: Number((client.kpis.tiempoPromedioAprobacionDias * 0.7).toFixed(1)),
            },
          };
        }
        case 'semana': {
          const factor = 0.25;
          const total = Math.max(1, Math.round(client.kpis.proformasTotales * factor));
          const aprobadas = Math.round(client.kpis.proformasAprobadas * factor);
          const rechazadas = Math.round(client.kpis.proformasRechazadas * factor);
          const tasaAprob = total > 0 ? (aprobadas / total) * 100 : client.kpis.tasaAprobacion;
          return {
            ...client,
            kpis: {
              ...client.kpis,
              proformasTotales: total,
              proformasAprobadas: aprobadas,
              proformasRechazadas: rechazadas,
              tasaAprobacion: Number(tasaAprob.toFixed(1)),
              cantidadReprocesos: Math.max(0, Math.round(client.kpis.cantidadReprocesos * factor)),
              tiempoPromedioAprobacionDias: Number((client.kpis.tiempoPromedioAprobacionDias * 0.85).toFixed(1)),
            },
          };
        }
        case 'mes': {
          const factor = 0.55;
          const total = Math.max(2, Math.round(client.kpis.proformasTotales * factor));
          const aprobadas = Math.round(client.kpis.proformasAprobadas * factor);
          const rechazadas = Math.round(client.kpis.proformasRechazadas * factor);
          const tasaAprob = total > 0 ? (aprobadas / total) * 100 : client.kpis.tasaAprobacion;
          return {
            ...client,
            kpis: {
              ...client.kpis,
              proformasTotales: total,
              proformasAprobadas: aprobadas,
              proformasRechazadas: rechazadas,
              tasaAprobacion: Number(tasaAprob.toFixed(1)),
              cantidadReprocesos: Math.round(client.kpis.cantidadReprocesos * factor),
              tiempoPromedioAprobacionDias: client.kpis.tiempoPromedioAprobacionDias,
            },
          };
        }
        case 'trimestre': {
          const factor = 0.85;
          const total = Math.round(client.kpis.proformasTotales * factor);
          const aprobadas = Math.round(client.kpis.proformasAprobadas * factor);
          const rechazadas = Math.round(client.kpis.proformasRechazadas * factor);
          const tasaAprob = total > 0 ? (aprobadas / total) * 100 : client.kpis.tasaAprobacion;
          return {
            ...client,
            kpis: {
              ...client.kpis,
              proformasTotales: total,
              proformasAprobadas: aprobadas,
              proformasRechazadas: rechazadas,
              tasaAprobacion: Number(tasaAprob.toFixed(1)),
              cantidadReprocesos: Math.round(client.kpis.cantidadReprocesos * factor),
              tiempoPromedioAprobacionDias: client.kpis.tiempoPromedioAprobacionDias,
            },
          };
        }
        case 'ano':
        case 'todos':
        default:
          return client;
      }
    });
  }, [filters.periodo]);

  const resetFilters = () => {
    setFilters({
      periodo: 'mes',
      ejecutivoId: 'todos',
      clienteId: 'todos',
      rut: '',
      cuentaCorriente: '',
      estadoProforma: 'todos',
      version: 'todos',
      resultadoAprobacion: 'todos',
      motivoRechazo: 'todos',
    });
    setKpiFilter('todos');
    setSearchTerm('');
  };

  return (
    <div className="space-y-6">
      {/* Header (Misma estructura y diseño que perfil Ejecutivo) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100">
            Hola, {user?.name?.split(' ')[0] || 'Carlos'} 👋
          </h1>
          <p className="text-caption text-gray-600 dark:text-gray-400">
            Rol: <span className="font-semibold text-purple-700 dark:text-purple-400">Jefatura de Facturación</span> · Supervisión centralizada, control de ejecutivos y clientes
          </p>
        </div>

        {/* Selector de Período Rápido */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-caption font-semibold text-gray-600 dark:text-gray-400">Período:</span>
          <select
            value={filters.periodo}
            onChange={(e) => setFilters({ ...filters, periodo: e.target.value as DashboardFiltersState['periodo'] })}
            className="px-3.5 py-2 text-caption bg-white dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-bold text-purple-900 dark:text-purple-200 shadow-xs outline-none cursor-pointer"
          >
            <option value="hoy">Hoy</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mes (Septiembre 2026)</option>
            <option value="trimestre">Tercer Trimestre (Q3)</option>
            <option value="ano">Año 2026</option>
            <option value="todos">Todo el Historial</option>
          </select>
        </div>
      </div>

      {/* Pestañas de Vistas del Dashboard */}
      <div className="flex p-1 bg-gray-100/80 dark:bg-slate-800/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('comercial')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'comercial'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dashboard Comercial (General)</span>
        </button>

        <button
          onClick={() => setActiveTab('ejecutivos')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'ejecutivos' || activeTab === 'analistas'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>KPIs por Ejecutivo ({MOCK_EXECUTIVES.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('clientes')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'clientes'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>KPIs por Cliente ({MOCK_CLIENTS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('proformas_supervision')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'proformas_supervision'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Proformas Supervisadas ({dynamicFilteredProformas.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: DASHBOARD COMERCIAL GENERAL (Punto 5 Requerimiento Jira)        */}
      {/* ========================================================================= */}
      {activeTab === 'comercial' && (
        <div className="space-y-6">
          {/* 1. Tarjetas Principales de KPIs Interactivas */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {/* KPI 1: Totales */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setKpiFilter('todos')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKpiFilter('todos'); }}
              title="Haz clic para ver la vista general del dashboard"
              className={`p-3.5 rounded-2xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${
                kpiFilter === 'todos'
                  ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-600 ring-2 ring-purple-600/30 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-600/40 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  Total Proformas
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 flex items-center gap-0.5 ${
                  kpiFilter === 'todos'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-white/5'
                }`}>
                  {kpiFilter === 'todos' && <Check className="w-2.5 h-2.5" />}
                  {kpiFilter === 'todos' ? 'Activo' : 'General'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  kpiFilter === 'todos'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white leading-none">
                  {kpisComerciales.total}
                </div>
              </div>
              <div className="text-[11px] text-purple-700 dark:text-purple-300 font-bold leading-tight">
                {formatCurrency(kpisComerciales.montoTotal)}
              </div>
            </div>

            {/* KPI 2: Aprobadas */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setKpiFilter((prev) => (prev === 'aprobadas' ? 'todos' : 'aprobadas'))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKpiFilter((prev) => (prev === 'aprobadas' ? 'todos' : 'aprobadas')); }}
              title={kpiFilter === 'aprobadas' ? 'Haz clic para quitar filtro' : 'Haz clic para listar solo proformas aprobadas'}
              className={`p-3.5 rounded-2xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${
                kpiFilter === 'aprobadas'
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-600 ring-2 ring-emerald-600/30 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-600/40 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  Aprobadas
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 flex items-center gap-0.5 ${
                  kpiFilter === 'aprobadas'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60'
                }`}>
                  {kpiFilter === 'aprobadas' && <Check className="w-2.5 h-2.5" />}
                  {kpiFilter === 'aprobadas' ? 'Filtrando' : 'Listas'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  kpiFilter === 'aprobadas'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none">
                  {kpisComerciales.aprobadas}
                </div>
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold leading-tight">
                {kpisComerciales.tasaAprobacion}% Éxito
              </div>
            </div>

            {/* KPI 3: Pendientes V°B° */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setKpiFilter((prev) => (prev === 'revision' ? 'todos' : 'revision'))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKpiFilter((prev) => (prev === 'revision' ? 'todos' : 'revision')); }}
              title={kpiFilter === 'revision' ? 'Haz clic para quitar filtro' : 'Haz clic para listar pendientes de autorización'}
              className={`p-3.5 rounded-2xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${
                kpiFilter === 'revision'
                  ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-600 ring-2 ring-amber-600/30 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-600/40 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  Pendientes V°B°
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 flex items-center gap-0.5 ${
                  kpiFilter === 'revision'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60'
                }`}>
                  {kpiFilter === 'revision' && <Check className="w-2.5 h-2.5" />}
                  {kpiFilter === 'revision' ? 'Filtrando' : 'Por V°B°'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  kpiFilter === 'revision'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                }`}>
                  <Hourglass className="w-5 h-5" />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-amber-600 dark:text-amber-400 leading-none">
                  {kpisComerciales.enRevision}
                </div>
              </div>
              <div className="text-[11px] text-amber-700 dark:text-amber-400 font-bold leading-tight">
                Por Autorizar
              </div>
            </div>

            {/* KPI 4: Rechazos */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setKpiFilter((prev) => (prev === 'rechazadas' ? 'todos' : 'rechazadas'))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKpiFilter((prev) => (prev === 'rechazadas' ? 'todos' : 'rechazadas')); }}
              title={kpiFilter === 'rechazadas' ? 'Haz clic para quitar filtro' : 'Haz clic para listar proformas rechazadas'}
              className={`p-3.5 rounded-2xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${
                kpiFilter === 'rechazadas'
                  ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-600 ring-2 ring-rose-600/30 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-600/40 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  Rechazos
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 flex items-center gap-0.5 ${
                  kpiFilter === 'rechazadas'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60'
                }`}>
                  {kpiFilter === 'rechazadas' && <Check className="w-2.5 h-2.5" />}
                  {kpiFilter === 'rechazadas' ? 'Filtrando' : 'Rechazos'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  kpiFilter === 'rechazadas'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                }`}>
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-rose-600 dark:text-rose-400 leading-none">
                  {kpisComerciales.rechazadas}
                </div>
              </div>
              <div className="text-[11px] text-rose-700 dark:text-rose-400 font-bold leading-tight">
                {kpisComerciales.tasaRechazo}% Tasa
              </div>
            </div>

            {/* KPI 5: Facturadas SAP */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setKpiFilter((prev) => (prev === 'facturadas' ? 'todos' : 'facturadas'))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKpiFilter((prev) => (prev === 'facturadas' ? 'todos' : 'facturadas')); }}
              title={kpiFilter === 'facturadas' ? 'Haz clic para quitar filtro' : 'Haz clic para listar proformas facturadas'}
              className={`p-3.5 rounded-2xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${
                kpiFilter === 'facturadas'
                  ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-600 ring-2 ring-purple-600/30 shadow-md scale-[1.02]'
                  : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-600/40 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  Facturadas SAP
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 flex items-center gap-0.5 ${
                  kpiFilter === 'facturadas'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60'
                }`}>
                  {kpiFilter === 'facturadas' && <Check className="w-2.5 h-2.5" />}
                  {kpiFilter === 'facturadas' ? 'Filtrando' : 'En SAP'}
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  kpiFilter === 'facturadas'
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                }`}>
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="text-2xl lg:text-3xl font-black text-purple-700 dark:text-purple-300 leading-none">
                  {kpisComerciales.facturadas}
                </div>
              </div>
              <div className="text-[11px] text-purple-700 dark:text-purple-300 font-bold leading-tight">
                Emitidas en SAP
              </div>
            </div>

            {/* KPI 6: T. Aprobación Promedio */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setActiveTab('ejecutivos')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab('ejecutivos'); }}
              title="Haz clic para ver el detalle de desempeño por Ejecutivo"
              className="p-3.5 rounded-2xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-600/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">
                  T. Aprobación
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60 flex items-center gap-0.5">
                  <span>Ejecutivos</span>
                  <ChevronRight className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="flex items-center gap-2.5 my-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white leading-none">
                    {kpisComerciales.tiempoPromedioAprobacionRaw}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    días
                  </span>
                </div>
              </div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400 font-bold leading-tight">
                Versiones: {kpisComerciales.promedioVersiones}
              </div>
            </div>
          </div>

          {/* 2. TABLA DINÁMICA DE PROFORMAS DEL KPI SELECCIONADO (Si hay filtro de KPI activo) */}
          {kpiFilter !== 'todos' && (
            <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-200 dark:border-white/10 overflow-hidden shadow-sm animate-in fade-in duration-200">
              <div className="p-4 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/40 dark:bg-purple-950/20">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      kpiFilter === 'aprobadas'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                        : kpiFilter === 'revision'
                        ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                        : kpiFilter === 'rechazadas'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                    }`}>
                      {kpiFilter === 'aprobadas' && '✅ Proformas Aprobadas / Facturadas'}
                      {kpiFilter === 'revision' && '⏳ Proformas Pendientes de Autorización V°B°'}
                      {kpiFilter === 'rechazadas' && '⚠️ Proformas en Rechazo / Derivadas a KAM'}
                      {kpiFilter === 'facturadas' && '📄 Proformas Facturadas en SAP'}
                    </span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      ({kpiFilteredProformas.length} proformas)
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Visualización directa de elementos resultantes según la tarjeta de métrica seleccionada.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setKpiFilter('todos')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs"
                >
                  <XCircle className="w-4 h-4 text-purple-600" />
                  <span>Cerrar filtro de tarjeta</span>
                </button>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[850px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Proforma ID</th>
                      <th className="py-2.5 px-2">Cliente / Razón Social</th>
                      <th className="py-2.5 px-2">Ejecutivo</th>
                      <th className="py-2.5 px-2 text-right">Monto</th>
                      <th className="py-2.5 px-1 text-center">Versión</th>
                      <th className="py-2.5 px-1 text-center">Estado Comercial</th>
                      <th className="py-2.5 px-2">Motivo / Observaciones</th>
                      <th className="py-2.5 px-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                    {kpiFilteredProformas.map((p) => (
                      <tr key={p.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-purple-700 dark:text-purple-300">
                          {p.id}
                        </td>
                        <td className="py-2.5 px-2">
                          <div className="font-bold text-gray-900 dark:text-white leading-tight">{p.cliente}</div>
                          <span className="text-[10px] text-gray-500 font-mono block">RUT: {p.rut}</span>
                        </td>
                        <td className="py-2.5 px-2 font-medium">
                          {p.ejecutivoNombre || 'Ana Valenzuela'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-gray-900 dark:text-white">
                          {p.montoFormatted}
                        </td>
                        <td className="py-2.5 px-1 text-center font-mono font-bold text-purple-700 dark:text-purple-300">
                          {p.versionActual || 'v1'}
                        </td>
                        <td className="py-2.5 px-1 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.estado.includes('Aprobada') || p.estado === 'Facturado'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : p.estado === 'Pendiente de validación'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          }`}>
                            {p.estado}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-[11px] text-gray-600 dark:text-gray-400 max-w-[220px]">
                          <span className="truncate block">
                            {p.motivoRechazoPrincipal || p.alertasElaboracion?.[0] || 'En proceso normal de supervisión.'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <Link
                            href={p.versionActual === 'v2' || p.estadoSupervision === 'Pendiente_Autorizacion' ? '/aprobaciones' : '/proformas/editar'}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 font-semibold text-[11px] rounded-lg border border-purple-200 dark:border-purple-800/60 whitespace-nowrap inline-flex items-center gap-1 transition-colors"
                          >
                            {p.versionActual === 'v2' || p.estadoSupervision === 'Pendiente_Autorizacion' ? 'Revisar V2' : 'Ver Detalle'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. BARRA DE FILTROS DINÁMICOS DEL DASHBOARD (Ubicada debajo de las cards) */}
          <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100/90 dark:border-white/10 p-5 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                <SlidersHorizontal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Filtros Dinámicos de Proformas
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restablecer filtros
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Filtro por Ejecutivo */}
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block mb-1">
                  Ejecutivo Responsable:
                </label>
                <select
                  value={filters.ejecutivoId}
                  onChange={(e) => setFilters({ ...filters, ejecutivoId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 outline-none cursor-pointer focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20"
                >
                  <option value="todos">Todos los Ejecutivos</option>
                  {MOCK_EXECUTIVES.map((exe) => (
                    <option key={exe.id} value={exe.id}>
                      {exe.nombre} ({exe.clientesAsignadosCount} clientes)
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por Estado Proforma */}
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block mb-1">
                  Estado de Proforma:
                </label>
                <select
                  value={filters.estadoProforma}
                  onChange={(e) => setFilters({ ...filters, estadoProforma: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 outline-none cursor-pointer focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20"
                >
                  <option value="todos">Todos los Estados</option>
                  <option value="Pendiente">Pendiente (Enviada a Cliente)</option>
                  <option value="Pendiente de validación">Pendiente de Validación V°B°</option>
                  <option value="Aprobada por Cliente">Aprobada por Cliente</option>
                  <option value="Facturado">Facturado</option>
                  <option value="Rechazada v1">Rechazada v1</option>
                  <option value="Derivada a KAM">Derivada a KAM</option>
                </select>
              </div>

              {/* Filtro por Versión */}
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block mb-1">
                  Versión:
                </label>
                <select
                  value={filters.version}
                  onChange={(e) => setFilters({ ...filters, version: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 outline-none cursor-pointer focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20"
                >
                  <option value="todos">Todas las Versiones</option>
                  <option value="v1">Versión 1 (Original)</option>
                  <option value="v2">Versión 2 (Ajustada)</option>
                  <option value="v3">Versión 3 (Crítica)</option>
                </select>
              </div>

              {/* Filtro por Causa de Rechazo */}
              <div>
                <label className="text-[11px] font-semibold text-gray-600 dark:text-gray-400 block mb-1">
                  Motivo de Rechazo:
                </label>
                <select
                  value={filters.motivoRechazo}
                  onChange={(e) => setFilters({ ...filters, motivoRechazo: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 outline-none cursor-pointer focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20"
                >
                  <option value="todos">Todos los Motivos</option>
                  <option value="Diferencia en recubitaje / medidas de SKUs">Diferencia en recubitaje / medidas</option>
                  <option value="Inconsistencia en Tarifas / Descuentos negociados">Inconsistencia en Tarifas</option>
                  <option value="Discrepancia comercial no resuelta en V3">Discrepancia comercial no resuelta</option>
                </select>
              </div>
            </div>

            {/* Input Búsqueda RUT / Cliente */}
            <div className="relative mt-2">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar en tiempo real por RUT, Razón Social del Cliente, ID de Proforma o Ejecutivo..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl focus:border-purple-600 focus:ring-1 focus:ring-purple-600/20 outline-none text-gray-800 dark:text-gray-200"
              />
            </div>
          </div>

          {/* 4. TABLA DINÁMICA DE RESULTADOS DE LOS FILTROS */}
          <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100/90 dark:border-white/10 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-gray-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-purple-50/30 dark:bg-purple-950/10">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Resultados de Búsqueda y Filtros Dinámicos
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Listado sincronizado en tiempo real según los filtros y términos de búsqueda seleccionados arriba.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-xl border border-purple-200/60 dark:border-purple-800/40 w-fit shrink-0">
                Mostrando {dynamicFilteredProformas.length} de {periodoFilteredProformas.length} proformas
              </span>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-3">Proforma ID</th>
                    <th className="py-3 px-2">Cliente / Razón Social</th>
                    <th className="py-3 px-2">Ejecutivo Responsable</th>
                    <th className="py-3 px-2 text-right">Monto</th>
                    <th className="py-3 px-1 text-center">Versión</th>
                    <th className="py-3 px-1 text-center">Supervisión V°B°</th>
                    <th className="py-3 px-1 text-center">Estado Comercial</th>
                    <th className="py-3 px-2">Motivo / Alertas</th>
                    <th className="py-3 px-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                  {dynamicFilteredProformas.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            No se encontraron proformas con los filtros seleccionados.
                          </p>
                          <p className="text-xs text-gray-400">
                            Prueba ajustando los criterios de búsqueda o restableciendo los filtros.
                          </p>
                          <button
                            onClick={resetFilters}
                            className="mt-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          >
                            Restablecer todos los filtros
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    dynamicFilteredProformas.map((p) => (
                      <tr key={p.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-purple-700 dark:text-purple-300">
                          {p.id}
                        </td>
                        <td className="py-3 px-2">
                          <div className="font-bold text-gray-900 dark:text-white leading-tight">{p.cliente}</div>
                          <span className="text-[10px] text-gray-500 font-mono block">RUT: {p.rut}</span>
                        </td>
                        <td className="py-3 px-2 font-medium">
                          {p.ejecutivoNombre || 'Ana Valenzuela'}
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-bold text-gray-900 dark:text-white">
                          {p.montoFormatted}
                        </td>
                        <td className="py-3 px-1 text-center font-mono font-bold text-purple-700 dark:text-purple-300">
                          {p.versionActual || 'v1'}
                        </td>
                        <td className="py-3 px-1 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.estadoSupervision === 'Pendiente_Autorizacion' || p.estado === 'Pendiente de validación'
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 animate-pulse'
                                : p.estadoSupervision === 'Autorizada'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
                            }`}
                          >
                            {p.estadoSupervision || 'No requiere'}
                          </span>
                        </td>
                        <td className="py-3 px-1 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.estado.includes('Aprobada') || p.estado === 'Facturado'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                              : p.estado === 'Pendiente de validación'
                              ? 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                          }`}>
                            {p.estado}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-[11px] text-gray-600 dark:text-gray-400 max-w-[200px]">
                          <span className="truncate block">
                            {p.motivoRechazoPrincipal || p.alertasElaboracion?.[0] || 'En proceso normal de supervisión.'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={p.versionActual === 'v2' || p.estadoSupervision === 'Pendiente_Autorizacion' ? '/aprobaciones' : '/proformas/editar'}
                            className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 font-semibold text-[11px] rounded-lg border border-purple-200 dark:border-purple-800/60 whitespace-nowrap inline-flex items-center gap-1 transition-colors"
                          >
                            {p.versionActual === 'v2' || p.estadoSupervision === 'Pendiente_Autorizacion' ? 'Revisar V2' : 'Ver Detalle'}
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: KPIS POR EJECUTIVO (Punto 6 Requerimiento Jira)                 */}
      {/* ========================================================================= */}
      {(activeTab === 'ejecutivos' || activeTab === 'analistas') && (
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Desempeño Individual de Ejecutivos de Facturación
              </h3>
              <p className="text-xs text-gray-500">
                Permite identificar balance de carga de trabajo, eficiencia y oportunidades de mejora por ejecutivo según el período seleccionado.
              </p>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[980px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 min-w-[170px]">
                    <Tooltip content="Ejecutivo de Facturación Especial asignado">
                      <span>Ejecutivo</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Cantidad de clientes en cartera asignados">
                      <span>Cartera</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Total de proformas emitidas en el período">
                      <span>Total PF</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Proformas aprobadas por el cliente">
                      <span>Aprob.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Proformas rechazadas comercialmente">
                      <span>Rech.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Proformas pendientes de revisión o respuesta">
                      <span className="text-amber-700 dark:text-amber-300 font-extrabold underline decoration-dotted">Pend.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Proformas expiradas por término de vigencia">
                      <span className="text-gray-700 dark:text-gray-300 font-extrabold underline decoration-dotted">Exp.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Proformas convertidas exitosamente a facturación oficial">
                      <span className="text-purple-700 dark:text-purple-300 font-extrabold underline decoration-dotted">Conv.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Tasa de aprobación porcentual">
                      <span>% Aprob.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Tasa de rechazo porcentual">
                      <span>% Rech.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Tiempo promedio de generación de proformas (días)">
                      <span>T. Gen.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Tiempo promedio de aprobación del cliente (días)">
                      <span>T. Aprob.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Promedio de versiones emitidas por proforma">
                      <span>Vers.</span>
                    </Tooltip>
                  </th>
                  <th className="py-2.5 px-2 text-center">
                    <Tooltip content="Cantidad de reprocesos (proformas con 2 o más versiones)">
                      <span>Reproc.</span>
                    </Tooltip>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                {ejecutivosData.map((exe) => (
                  <tr key={exe.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                    {/* Ejecutivo: Nombre y correo debajo */}
                    <td className="py-3 px-3 font-medium">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-gray-900 dark:text-white leading-tight block truncate max-w-[180px]">
                          {exe.nombre}
                        </span>
                        <span className="text-[11px] text-gray-500 font-normal leading-tight mt-0.5 block truncate max-w-[180px]">
                          {exe.email}
                        </span>
                      </div>
                    </td>

                    {/* Clientes */}
                    <td className="py-3 px-2 text-center font-bold text-purple-700 dark:text-purple-300">
                      {exe.clientesAsignadosCount}
                    </td>

                    {/* Proformas */}
                    <td className="py-3 px-2 text-center font-bold">
                      {exe.proformasTotales}
                    </td>

                    {/* Aprobadas */}
                    <td className="py-3 px-2 text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                      {exe.proformasAprobadas}
                    </td>

                    {/* Rechazadas */}
                    <td className="py-3 px-2 text-center text-red-600 dark:text-red-400 font-semibold">
                      {exe.proformasRechazadas}
                    </td>

                    {/* Pendientes */}
                    <td className="py-3 px-2 text-center text-amber-600 dark:text-amber-400 font-semibold">
                      {exe.proformasPendientes}
                    </td>

                    {/* Expiradas */}
                    <td className="py-3 px-2 text-center text-gray-500 dark:text-gray-400 font-medium">
                      {exe.proformasExpiradas}
                    </td>

                    {/* Convertidas */}
                    <td className="py-3 px-2 text-center font-bold text-purple-700 dark:text-purple-300">
                      {exe.proformasConvertidas}
                    </td>

                    {/* Tasa Aprobación */}
                    <td className="py-3 px-2 text-center">
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                        {exe.tasaAprobacion}%
                      </span>
                    </td>

                    {/* Tasa Rechazo */}
                    <td className="py-3 px-2 text-center">
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300">
                        {exe.tasaRechazo}%
                      </span>
                    </td>

                    {/* Tiempos */}
                    <td className="py-3 px-2 text-center font-mono text-[11px]">
                      {exe.tiempoPromedioGeneracionDias}d
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-[11px]">
                      {exe.tiempoPromedioAprobacionDias}d
                    </td>

                    {/* Versiones y Reprocesos */}
                    <td className="py-3 px-2 text-center font-mono font-bold text-purple-700 dark:text-purple-300 text-[11px]">
                      {exe.promedioVersiones}v
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                      {exe.cantidadReprocesos}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: KPIS POR CLIENTE (Punto 7 Requerimiento Jira)                   */}
      {/* ========================================================================= */}
      {activeTab === 'clientes' && (
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Comportamiento y Complejidad por Cliente
              </h3>
              <p className="text-xs text-gray-500">
                Permite detectar clientes que presentan mayor nivel de complejidad, reprocesos o desviaciones tarifarias en el período seleccionado.
              </p>
            </div>
          </div>

          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-left border-collapse text-xs">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[12%]" />
                <col className="w-[15%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[8%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[6%]" />
                <col className="w-[7%]" />
              </colgroup>
              <thead>
                <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Cliente / Razón Social</th>
                  <th className="py-2.5 px-1.5">RUT</th>
                  <th className="py-2.5 px-1.5">Ejecutivo</th>
                  <th className="py-2.5 px-1 text-center">Total</th>
                  <th className="py-2.5 px-1 text-center">Aprob.</th>
                  <th className="py-2.5 px-1 text-center">Rech.</th>
                  <th className="py-2.5 px-1 text-center">% Aprob.</th>
                  <th className="py-2.5 px-1 text-center">Vers.</th>
                  <th className="py-2.5 px-1 text-center">Reproc.</th>
                  <th className="py-2.5 px-1 text-center">T. Aprob.</th>
                  <th className="py-2.5 px-1 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                {clientesData.map((client) => (
                  <tr key={client.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                    {/* Cliente */}
                    <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-gray-900 dark:text-white leading-tight block truncate max-w-[190px]">
                          {client.razonSocial}
                        </span>
                        {client.nombreFantasia && (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal leading-tight mt-0.5 block truncate max-w-[190px]">
                            {client.nombreFantasia}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* RUT */}
                    <td className="py-2.5 px-1.5 font-mono text-[11px] text-gray-700 dark:text-gray-300">
                      <span className="truncate block max-w-[100px]">{client.rut}</span>
                    </td>

                    {/* Ejecutivo */}
                    <td className="py-2.5 px-1.5">
                      {client.ejecutivoNombre ? (
                        <span className="font-semibold text-purple-700 dark:text-purple-300 text-[11px] block truncate max-w-[130px]">
                          {client.ejecutivoNombre}
                        </span>
                      ) : (
                        <span className="text-amber-700 dark:text-amber-400 font-bold text-[10px]">
                          Sin asignar
                        </span>
                      )}
                    </td>

                    {/* Métricas */}
                    <td className="py-2.5 px-1 text-center font-bold">
                      {client.kpis.proformasTotales}
                    </td>
                    <td className="py-2.5 px-1 text-center text-emerald-600 font-semibold">
                      {client.kpis.proformasAprobadas}
                    </td>
                    <td className="py-2.5 px-1 text-center text-red-600 font-semibold">
                      {client.kpis.proformasRechazadas}
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {client.kpis.tasaAprobacion}%
                      </span>
                    </td>
                    <td className="py-2.5 px-1 text-center font-mono font-bold text-purple-700 text-[11px]">
                      {client.kpis.promedioVersiones}v
                    </td>
                    <td className="py-2.5 px-1 text-center font-mono text-amber-700 font-bold text-[11px]">
                      {client.kpis.cantidadReprocesos}
                    </td>
                    <td className="py-2.5 px-1 text-center font-mono text-[11px]">
                      {client.kpis.tiempoPromedioAprobacionDias}d
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          client.estado === 'Activo'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {client.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 4: PROFORMAS SUPERVISADAS (Bandeja Rápida de Supervisión)        */}
      {/* ========================================================================= */}
      {activeTab === 'proformas_supervision' && (
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Listado de Proformas Bajo Supervisión de Jefatura
            </h3>
            <Link
              href="/aprobaciones"
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Ir a Bandeja de Aprobaciones V2</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-left border-collapse text-xs">
              <colgroup>
                <col className="w-[11%]" />
                <col className="w-[22%]" />
                <col className="w-[13%]" />
                <col className="w-[10%]" />
                <col className="w-[6%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Proforma ID</th>
                  <th className="py-2.5 px-2">Cliente / Razón Social</th>
                  <th className="py-2.5 px-2">Ejecutivo</th>
                  <th className="py-2.5 px-2 text-right">Monto</th>
                  <th className="py-2.5 px-1 text-center">Versión</th>
                  <th className="py-2.5 px-1 text-center">Supervisión V°B°</th>
                  <th className="py-2.5 px-1 text-center">Estado Comercial</th>
                  <th className="py-2.5 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                {dynamicFilteredProformas.map((p) => (
                  <tr key={p.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-purple-700 dark:text-purple-300 truncate">
                      {p.id}
                    </td>
                    <td className="py-2.5 px-2 truncate">
                      <div className="font-bold text-gray-900 dark:text-white truncate">{p.cliente}</div>
                      <span className="text-[10px] text-gray-500 font-mono block truncate">RUT: {p.rut}</span>
                    </td>
                    <td className="py-2.5 px-2 font-medium truncate">
                      {p.ejecutivoNombre || 'Ana Valenzuela'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-gray-900 dark:text-white truncate">
                      {p.montoFormatted}
                    </td>
                    <td className="py-2.5 px-1 text-center font-mono font-bold text-purple-700">
                      {p.versionActual || 'v1'}
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap inline-block ${
                          p.estadoSupervision === 'Pendiente_Autorizacion' || p.estado === 'Pendiente de validación'
                            ? 'bg-amber-100 text-amber-900 animate-pulse'
                            : p.estadoSupervision === 'Autorizada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300'
                        }`}
                      >
                        {p.estadoSupervision === 'Pendiente_Autorizacion' ? 'Pendiente V°B°' : p.estadoSupervision === 'Autorizada' ? 'Autorizada' : 'No requiere'}
                      </span>
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-gray-200 whitespace-nowrap inline-block">
                        {p.estado}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        href="/aprobaciones"
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 font-semibold text-[11px] rounded-lg border border-purple-200 dark:border-purple-800/60 whitespace-nowrap inline-flex items-center gap-1 transition-colors"
                      >
                        Ver Detalle V2
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
