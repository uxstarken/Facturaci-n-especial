'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  User,
  ArrowRight,
  Sparkles,
  FileSpreadsheet,
  BarChart3,
  TrendingDown,
  Clock,
  Check,
  X,
  Building2,
  Eye,
  FileDown,
  FileText,
  CreditCard,
} from 'lucide-react';
import { useToast } from '@/context/toast-context';
import { MOCK_AUDIT, MOCK_EXECUTIVES, MOCK_CLIENTS, MOCK_PROFORMAS } from '@/lib/mock-data';
import { AuditLog, Proforma, VersionHistoryItem } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function AuditoriaPage() {
  const { showToast } = useToast();

  const [auditLogs] = useState<AuditLog[]>(MOCK_AUDIT);
  const [roleFilter, setRoleFilter] = useState('todos');
  const [actionFilter, setActionFilter] = useState('todos');
  const [timeFilter, setTimeFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'bitacora' | 'dashboard_calidad'>('bitacora');
  
  // Estado para el modal de versiones
  const [selectedVersionLog, setSelectedVersionLog] = useState<AuditLog | null>(null);

  // Top clientes con mayor cantidad de modificaciones / reprocesos
  const topModifiedClients = useMemo(() => {
    return [...MOCK_CLIENTS]
      .filter((c) => c.kpis.proformasTotales > 0)
      .sort((a, b) => (b.kpis.cantidadReprocesos || 0) - (a.kpis.cantidadReprocesos || 0))
      .slice(0, 5);
  }, []);

  // Filtrado de la bitácora
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (roleFilter !== 'todos') {
        if (roleFilter === 'Ejecutivo' && (log.rol === 'Ejecutivo' || log.rol === 'Analista')) {
          // match
        } else if (log.rol !== roleFilter) {
          return false;
        }
      }
      if (actionFilter !== 'todos' && log.accion !== actionFilter) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchUser = log.usuario.toLowerCase().includes(term);
        const matchRecurso = log.recurso.toLowerCase().includes(term);
        const matchObjeto = log.objetoAfectado?.toLowerCase().includes(term);
        const matchMotivo = log.motivoObservaciones?.toLowerCase().includes(term);
        return matchUser || matchRecurso || matchObjeto || matchMotivo;
      }

      return true;
    });
  }, [auditLogs, roleFilter, actionFilter, searchTerm]);

  // Datos para el modal de versiones
  const versionModalData = useMemo(() => {
    if (!selectedVersionLog) return null;

    // Buscar si existe la proforma en MOCK_PROFORMAS
    const proforma = MOCK_PROFORMAS.find(
      (p) =>
        p.id === selectedVersionLog.recurso ||
        selectedVersionLog.objetoAfectado?.includes(p.id) ||
        (selectedVersionLog.objetoAfectado && p.cliente && selectedVersionLog.objetoAfectado.includes(p.cliente))
    );

    let versions: VersionHistoryItem[] = [];
    let clientName = selectedVersionLog.objetoAfectado || 'Cliente Starken';
    let proformaCode = selectedVersionLog.recurso;

    if (proforma) {
      clientName = proforma.cliente;
      proformaCode = proforma.id;
      if (proforma.historialVersiones && proforma.historialVersiones.length > 0) {
        versions = [...proforma.historialVersiones].sort((a, b) => {
          const numA = a.numeroVersion || parseInt(a.version.replace('v', ''), 10) || 1;
          const numB = b.numeroVersion || parseInt(b.version.replace('v', ''), 10) || 1;
          return numB - numA; // Más reciente primero
        });
      }
    }

    // Si no tiene historial cargado, generar estructura rica consistente
    if (versions.length === 0) {
      const currentVer = selectedVersionLog.version || 'v1';
      if (currentVer === 'v3') {
        versions = [
          {
            version: 'v3',
            numeroVersion: 3,
            fechaCreacion: selectedVersionLog.fechaHora || selectedVersionLog.ts,
            usuarioResponsable: selectedVersionLog.usuario,
            motivo: selectedVersionLog.motivoObservaciones || 'Acumula 3 discrepancias consecutivas en cubicaje; se deriva a negociación comercial KAM.',
            observaciones: 'Versión 3 generada para resolución comercial con KAM.',
            monto: 1980000,
            cambiosRealizados: [
              'Revisión integral de cubicaje con cliente',
              'Aplicación de descuento especial del 15% sobre tarifa de sobredimensión',
            ],
            items: [
              { id: 'it-301', codigo: 'SRV-STK-01', descripcion: 'Flete Express RM a Regiones', cantidad: 350, tarifaBase: 7200, descuentoPct: 15, total: 2142000 },
              { id: 'it-302', codigo: 'SRV-VOL-02', descripcion: 'Ajuste Volumétrico Negociado', cantidad: 60, tarifaBase: 11000, descuentoPct: 20, total: 528000 },
            ],
          },
          {
            version: 'v2',
            numeroVersion: 2,
            fechaCreacion: '15/09/2026 11:20',
            fechaRechazo: '16/09/2026 10:00',
            usuarioResponsable: selectedVersionLog.usuario,
            motivo: 'Discrepancia en factor de estiba',
            observaciones: 'El cliente objetó la clasificación de 32 bultos con tarifa de sobredimensión.',
            monto: 2100000,
          },
          {
            version: 'v1',
            numeroVersion: 1,
            fechaCreacion: '14/09/2026 09:15',
            fechaRechazo: '14/09/2026 17:30',
            usuarioResponsable: selectedVersionLog.usuario,
            motivo: 'Emisión original de proforma v1',
            observaciones: 'Generación automática con tarifas estándar de contrato.',
            monto: 2200000,
          },
        ];
      } else if (currentVer === 'v2') {
        versions = [
          {
            version: 'v2',
            numeroVersion: 2,
            fechaCreacion: selectedVersionLog.fechaHora || selectedVersionLog.ts,
            usuarioResponsable: selectedVersionLog.usuario,
            motivo: selectedVersionLog.motivoObservaciones || 'Recálculo con factor volumétrico estándar 1:180 tras objeción del cliente.',
            observaciones: 'Se recalculó el valor con anexo comercial vigente.',
            monto: 7120000,
            cambiosRealizados: [
              'Ajuste de descuento de Pallets de 8% -> 12% (-$160.000)',
              'Ajuste de descuento en Paquetería B2B de 7% -> 10% (-$120.000)',
            ],
            items: [
              { id: 'it-201', codigo: 'SRV-PAL-01', descripcion: 'Distribución Carga Paletizada Zona Central', cantidad: 80, tarifaBase: 50000, descuentoPct: 12, total: 3520000, ajustadoEnV2: true },
              { id: 'it-202', codigo: 'SRV-PAQ-02', descripcion: 'Paquetería Consolidada B2B', cantidad: 320, tarifaBase: 12500, descuentoPct: 10, total: 3600000, ajustadoEnV2: true },
            ],
          },
          {
            version: 'v1',
            numeroVersion: 1,
            fechaCreacion: '14/09/2026 10:00',
            fechaRechazo: '15/09/2026 12:45',
            usuarioResponsable: selectedVersionLog.usuario,
            motivo: 'Emisión inicial de proforma',
            observaciones: 'El cliente solicitó revisión por anexo comercial corporativo no aplicado.',
            monto: 7400000,
            items: [
              { id: 'it-101', codigo: 'SRV-PAL-01', descripcion: 'Distribución Carga Paletizada Zona Central', cantidad: 80, tarifaBase: 50000, descuentoPct: 8, total: 3680000 },
              { id: 'it-102', codigo: 'SRV-PAQ-02', descripcion: 'Paquetería Consolidada B2B', cantidad: 320, tarifaBase: 12500, descuentoPct: 7, total: 3720000 },
            ],
          },
        ];
      } else {
        versions = [
          {
            version: 'v1',
            numeroVersion: 1,
            fechaCreacion: selectedVersionLog.fechaHora || selectedVersionLog.ts,
            usuarioResponsable: selectedVersionLog.usuario,
            motivo: selectedVersionLog.motivoObservaciones || 'Emisión inicial y aprobación de proforma v1',
            observaciones: 'Primera versión validada sin observaciones de rechazo.',
            monto: 4850000,
            items: [
              { id: 'it-001', codigo: 'SRV-EXP-01', descripcion: 'Servicio de Despacho Corporativo Quincenal', cantidad: 550, tarifaBase: 9000, descuentoPct: 5, total: 4702500 },
              { id: 'it-002', codigo: 'SRV-SEG-02', descripcion: 'Seguro de Carga y Trazabilidad', cantidad: 1, tarifaBase: 147500, descuentoPct: 0, total: 147500 },
            ],
          },
        ];
      }
    }

    return {
      proforma,
      proformaCode,
      clientName,
      selectedVersion: selectedVersionLog.version,
      versions,
      log: selectedVersionLog,
    };
  }, [selectedVersionLog]);

  // Descarga de una versión individual en CSV
  const handleDownloadSingleVersion = (ver: VersionHistoryItem, proformaCode: string, clientName: string) => {
    const headers = 'Proforma,Version,Cliente,FechaCreacion,Responsable,Motivo,Observaciones,MontoTotal,CodigoItem,DescripcionItem,Cantidad,TarifaBase,DescuentoPct,TotalItem';
    const rows: string[] = [];

    if (ver.items && ver.items.length > 0) {
      ver.items.forEach((it) => {
        rows.push(
          `"${proformaCode}","${ver.version}","${clientName}","${ver.fechaCreacion}","${ver.usuarioResponsable || ''}","${(ver.motivo || '').replace(/"/g, '""')}","${(ver.observaciones || '').replace(/"/g, '""')}","${ver.monto}","${it.codigo}","${it.descripcion}","${it.cantidad}","${it.tarifaBase}","${it.descuentoPct}%","${it.total}"`
        );
      });
    } else {
      rows.push(
        `"${proformaCode}","${ver.version}","${clientName}","${ver.fechaCreacion}","${ver.usuarioResponsable || ''}","${(ver.motivo || '').replace(/"/g, '""')}","${(ver.observaciones || '').replace(/"/g, '""')}","${ver.monto}","","","","","",""`
      );
    }

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Proforma_${proformaCode}_${ver.version}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      `Versión ${ver.version} de ${proformaCode} descargada exitosamente en CSV.`,
      'success',
      4000,
      'Descarga de Versión'
    );
  };

  // Descarga del expediente completo (todas las versiones) en CSV
  const handleDownloadAllVersions = (versions: VersionHistoryItem[], proformaCode: string, clientName: string) => {
    const headers = 'Proforma,Version,Cliente,FechaCreacion,Responsable,Motivo,Observaciones,MontoTotal,CodigoItem,DescripcionItem,Cantidad,TarifaBase,DescuentoPct,TotalItem';
    const rows: string[] = [];

    versions.forEach((ver) => {
      if (ver.items && ver.items.length > 0) {
        ver.items.forEach((it) => {
          rows.push(
            `"${proformaCode}","${ver.version}","${clientName}","${ver.fechaCreacion}","${ver.usuarioResponsable || ''}","${(ver.motivo || '').replace(/"/g, '""')}","${(ver.observaciones || '').replace(/"/g, '""')}","${ver.monto}","${it.codigo}","${it.descripcion}","${it.cantidad}","${it.tarifaBase}","${it.descuentoPct}%","${it.total}"`
          );
        });
      } else {
        rows.push(
          `"${proformaCode}","${ver.version}","${clientName}","${ver.fechaCreacion}","${ver.usuarioResponsable || ''}","${(ver.motivo || '').replace(/"/g, '""')}","${(ver.observaciones || '').replace(/"/g, '""')}","${ver.monto}","","","","","",""`
        );
      }
    });

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Expediente_Completo_${proformaCode}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      `Expediente completo con ${versions.length} versión(es) descargado exitosamente.`,
      'success',
      4500,
      'Expediente Descargado'
    );
  };

  // Exportar CSV general de bitácora
  const handleExportCSV = () => {
    const csvContent = [
      'Fecha,Usuario,Rol,Accion,Objeto,EstadoAnterior,EstadoNuevo,Version,Motivo,IP',
      ...filteredLogs.map(
        (l) =>
          `"${l.fechaHora || l.ts}","${l.usuario}","${l.rol}","${l.accion}","${l.objetoAfectado || l.recurso}","${l.estadoAnterior || ''}","${l.estadoNuevo || ''}","${l.version || ''}","${l.motivoObservaciones || ''}","${l.ip}"`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Auditoria_Starken_FE_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Bitácora de auditoría exportada exitosamente en formato CSV.', 'success', 4000, 'Exportación Completa');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/70 p-5 rounded-2xl border border-purple-100 dark:border-white/10 shadow-xs backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
              Jefatura de Facturación Especial
            </span>
            <span className="text-xs text-gray-500">• Trazabilidad & Versionamiento</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Auditoría Operacional y Dashboard de Versionamiento
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Bitácora inmutable de eventos sobre proformas, clientes y asignaciones, con KPIs de calidad y causas de reprocesos.
          </p>
        </div>

        {/* Botón Exportar */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Bitácora (CSV)</span>
          </button>
        </div>
      </div>

      {/* Tabs Principales: Bitácora vs Dashboard de Calidad */}
      <div className="flex p-1 bg-gray-100/80 dark:bg-slate-800/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('bitacora')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'bitacora'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Bitácora de Eventos ({filteredLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('dashboard_calidad')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'dashboard_calidad'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard de Versionamiento & Reprocesos</span>
        </button>
      </div>

      {/* SECCIÓN 1: BITÁCORA INMUTABLE DE EVENTOS */}
      {activeTab === 'bitacora' && (
        <div className="space-y-4">
          {/* Filtros de la Bitácora */}
          <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-purple-100/80 dark:border-white/10 p-4 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por usuario, proforma (PF-...), cliente o motivo..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl focus:border-purple-600 outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-200 focus:border-purple-600 outline-none cursor-pointer"
              >
                <option value="todos">Todas las acciones</option>
                <option value="Aprobación">Aprobación de V°B°</option>
                <option value="Rechazo">Rechazo de Versión</option>
                <option value="Reasignación de Ejecutivo">Reasignación de Ejecutivo</option>
                <option value="Creación Nueva Versión">Creación Nueva Versión</option>
                <option value="Cambio Condiciones Comerciales">Cambio Condiciones Comerciales</option>
                <option value="Envío Proforma">Envío de Proforma</option>
                <option value="Facturación">Facturación</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-200 focus:border-purple-600 outline-none cursor-pointer"
              >
                <option value="todos">Todos los roles</option>
                <option value="Jefatura">Jefatura</option>
                <option value="Ejecutivo">Ejecutivo</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-200 focus:border-purple-600 outline-none cursor-pointer"
              >
                <option value="todos">Todo el historial</option>
                <option value="hoy">Hoy</option>
                <option value="semana">Últimos 7 días</option>
                <option value="mes">Últimos 30 días</option>
              </select>
            </div>
          </div>

          {/* Tabla de Auditoría */}
          <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100/90 dark:border-white/10 overflow-hidden shadow-xs">
            <div className="w-full overflow-hidden">
              <table className="w-full table-fixed text-left border-collapse text-xs">
                <colgroup>
                  <col className="w-[10%]" />
                  <col className="w-[14%]" />
                  <col className="w-[12%]" />
                  <col className="w-[17%]" />
                  <col className="w-[18%]" />
                  <col className="w-[8%]" />
                  <col className="w-[21%]" />
                </colgroup>
                <thead>
                  <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[11px] font-bold text-gray-600 dark:text-gray-400">
                    <th className="py-3 px-3">Fecha / hora</th>
                    <th className="py-3 px-2">Usuario & rol</th>
                    <th className="py-3 px-2">Acción</th>
                    <th className="py-3 px-2">Objeto afectado</th>
                    <th className="py-3 px-2">Transición de estado</th>
                    <th className="py-3 px-2">Versión</th>
                    <th className="py-3 px-3">Motivo / observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs text-gray-700 dark:text-gray-300">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-gray-500">
                        No hay eventos registrados con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      // Separar fecha y hora para optimizar espacio horizontal
                      const rawDateStr = log.fechaHora || log.ts || '';
                      const parts = rawDateStr.split(' ');
                      const datePart = parts[0] || rawDateStr;
                      const timePart = parts.slice(1).join(' ') || '';

                      return (
                        <tr key={log.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                          {/* Fecha / Hora apiladas */}
                          <td className="py-3.5 px-3">
                            <div className="font-semibold text-gray-900 dark:text-gray-100 text-[11px] leading-tight">
                              {datePart}
                            </div>
                            {timePart && (
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                                {timePart}
                              </div>
                            )}
                          </td>

                          {/* Usuario & Rol */}
                          <td className="py-3.5 px-2">
                            <div className="font-bold text-gray-900 dark:text-white leading-tight">
                              {log.usuario}
                            </div>
                            <span
                              className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase mt-0.5 ${
                                log.rol === 'Jefatura'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300'
                              }`}
                            >
                              {log.rol}
                            </span>
                          </td>

                          {/* Acción (Texto plano sin badge) */}
                          <td className="py-3.5 px-2">
                            <span className="font-medium text-gray-800 dark:text-gray-200 text-xs">
                              {log.accion}
                            </span>
                          </td>

                          {/* Objeto Afectado */}
                          <td className="py-3.5 px-2 font-medium text-gray-900 dark:text-gray-100">
                            <span className="truncate block max-w-[220px]" title={log.objetoAfectado || log.recurso}>
                              {log.objetoAfectado || log.recurso}
                            </span>
                          </td>

                          {/* Transición de Estado */}
                          <td className="py-3.5 px-2">
                            {log.estadoAnterior && log.estadoNuevo ? (
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-gray-500 line-through truncate max-w-[100px] block" title={log.estadoAnterior}>
                                  {log.estadoAnterior}
                                </span>
                                <ArrowRight className="w-3 h-3 text-purple-500 shrink-0" />
                                <span className="font-bold text-gray-900 dark:text-gray-100 truncate max-w-[120px] block" title={log.estadoNuevo}>
                                  {log.estadoNuevo}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 font-mono text-[11px]">—</span>
                            )}
                          </td>

                          {/* Versión con Icono de Ojito */}
                          <td className="py-3.5 px-2">
                            {log.version ? (
                              <button
                                onClick={() => setSelectedVersionLog(log)}
                                className="group inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/50 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                                title="Ver información de versiones y descargar"
                              >
                                <span className="font-bold font-mono text-[11px]">{log.version}</span>
                                <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 group-hover:scale-115 transition-transform" />
                              </button>
                            ) : (
                              <span className="text-gray-400 font-mono text-xs pl-2">—</span>
                            )}
                          </td>

                          {/* Motivo / Observaciones */}
                          <td className="py-3.5 px-3 text-[11px] text-gray-600 dark:text-gray-400">
                            <p className="leading-relaxed whitespace-normal break-words">
                              {log.motivoObservaciones || 'Sin observaciones adicionales.'}
                            </p>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 2: DASHBOARD DE AUDITORÍA Y VERSIONAMIENTO (Punto 9) */}
      {activeTab === 'dashboard_calidad' && (
        <div className="space-y-6">
          {/* Tarjetas de Métricas de Calidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100 dark:border-white/10 shadow-xs">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                First-Time Right (Aprobadas en v1)
              </div>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                78.4%
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Proformas que no requirieron correcciones ni reprocesos.
              </p>
            </div>

            <div className="p-5 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100 dark:border-white/10 shadow-xs">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Requieren 2 o Más Versiones
              </div>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">
                21.6%
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Tasa de reproceso que requirió intervención de jefatura.
              </p>
            </div>

            <div className="p-5 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100 dark:border-white/10 shadow-xs">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Promedio de Versiones / Proforma
              </div>
              <div className="text-3xl font-black text-purple-700 dark:text-purple-300 mt-2">
                1.3 v
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Objetivo operacional: Mantener por debajo de 1.4 v.
              </p>
            </div>

            <div className="p-5 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100 dark:border-white/10 shadow-xs">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tiempo Promedio Entre Versiones
              </div>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                1.2 días
              </div>
              <p className="text-[11px] text-gray-500 mt-1">
                Tiempo que tarda el ejecutivo en corregir y solicitar V°B°.
              </p>
            </div>
          </div>

          {/* Grid Gráficos: Causas de Rechazo & Ejecutivos con más Reprocesos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Principales Motivos de Rechazo */}
            <div className="p-5 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100 dark:border-white/10 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Principales Causas Raíz de Rechazo (Cliente)
                </h3>
                <p className="text-xs text-gray-500">
                  Distribución porcentual de motivos de discrepancia que generan versión 2.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-700 dark:text-gray-300">
                      1. Diferencia en recubitaje / medidas de SKUs
                    </span>
                    <strong className="text-purple-700 dark:text-purple-300">42% (14 casos)</strong>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: '42%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-700 dark:text-gray-300">
                      2. Inconsistencia en Tarifas / Descuentos negociados
                    </span>
                    <strong className="text-purple-700 dark:text-purple-300">28% (9 casos)</strong>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-700 dark:text-gray-300">
                      3. Error en selección de Cuentas Corrientes
                    </span>
                    <strong className="text-purple-700 dark:text-purple-300">18% (6 casos)</strong>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '18%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-gray-700 dark:text-gray-300">
                      4. Discrepancia en recargos por zona extrema
                    </span>
                    <strong className="text-purple-700 dark:text-purple-300">12% (4 casos)</strong>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Reprocesos y Calidad por Ejecutivo */}
            <div className="p-5 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100 dark:border-white/10 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Desempeño de Calidad por Ejecutivo
                </h3>
                <p className="text-xs text-gray-500">
                  Identifica cuellos de botella y necesidades de capacitación en el equipo de ejecutivos.
                </p>
              </div>

              <div className="space-y-2">
                {MOCK_EXECUTIVES.map((exe) => (
                  <div
                    key={exe.id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="font-bold text-gray-900 dark:text-white truncate">
                          {exe.nombre}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate">
                          {exe.proformasTotales} proformas emitidas
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 text-right shrink-0">
                      <div>
                        <div className="text-[10px] text-gray-500">Rechazos</div>
                        <div className="font-bold text-rose-600 dark:text-rose-400">
                          {exe.proformasRechazadas}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Reprocesos</div>
                        <div className="font-bold text-amber-600 dark:text-amber-400">
                          {exe.cantidadReprocesos}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Prom. Versiones</div>
                        <div className="font-bold text-purple-700 dark:text-purple-300">
                          {exe.promedioVersiones} v
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Tasa Aprobación</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {exe.tasaAprobacion}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clientes con Mayor Cantidad de Modificaciones */}
            <div className="lg:col-span-2 p-5 bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100 dark:border-white/10 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Clientes con Mayor Cantidad de Modificaciones
                  </h3>
                  <p className="text-xs text-gray-500">
                    Cuentas que registran mayor volumen de reprocesos, discrepancias y ajustes en sus proformas.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-200/60 dark:border-purple-800/40 w-fit">
                  Top 5 Cuentas Complejas
                </span>
              </div>

              <div className="space-y-2">
                {topModifiedClients.map((client, idx) => (
                  <div
                    key={client.id}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 truncate min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div className="truncate min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white truncate">
                          {client.razonSocial}
                        </div>
                        <div className="text-[10px] text-gray-500 truncate mt-0.5">
                          {client.nombreFantasia} • <span className="text-purple-700 dark:text-purple-300 font-semibold">Ejecutivo: {client.ejecutivoNombre || 'Sin asignar'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-white/5">
                      <div>
                        <div className="text-[10px] text-gray-500">Modificaciones</div>
                        <div className="font-bold text-amber-600 dark:text-amber-400">
                          {client.kpis.cantidadReprocesos}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Prom. Versiones</div>
                        <div className="font-bold text-purple-700 dark:text-purple-300">
                          {client.kpis.promedioVersiones} v
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Rechazos</div>
                        <div className="font-bold text-rose-600 dark:text-rose-400">
                          {client.kpis.proformasRechazadas}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Total PF</div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          {client.kpis.proformasTotales}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Tasa Aprobación</div>
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {client.kpis.tasaAprobacion}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE HISTORIAL DE VERSIONES Y DESCARGA */}
      {selectedVersionLog && versionModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-100 dark:border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header del Modal */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-white/10 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800/50 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 shadow-2xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                      Expediente de Versiones — {versionModalData.proformaCode}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
                      {versionModalData.versions.length} {versionModalData.versions.length === 1 ? 'Versión' : 'Versiones'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cliente: <strong className="text-gray-800 dark:text-gray-200">{versionModalData.clientName}</strong> • Historial de modificaciones y trazabilidad
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedVersionLog(null)}
                  className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-300 flex items-center justify-center transition-colors cursor-pointer"
                  title="Cerrar modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 overflow-y-auto space-y-5 max-h-[calc(90vh-140px)]">
              {/* Tarjeta de Resumen Rápido */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 text-xs">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Proforma / Recurso</div>
                  <div className="font-bold text-gray-900 dark:text-white mt-0.5">{versionModalData.proformaCode}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Versión Consultada</div>
                  <div className="font-bold text-purple-700 dark:text-purple-300 mt-0.5 flex items-center gap-1">
                    <span>{versionModalData.selectedVersion || 'v1'}</span>
                    <span className="text-[10px] text-gray-500 font-normal">(Evento bitácora)</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Usuario Registrado</div>
                  <div className="font-bold text-gray-900 dark:text-white mt-0.5 truncate">{selectedVersionLog.usuario}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase font-semibold">Acción de Bitácora</div>
                  <div className="font-bold text-gray-900 dark:text-white mt-0.5">{selectedVersionLog.accion}</div>
                </div>
              </div>

              {/* Lista de Versiones (Cronología Inversa) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    Detalle de Versión Actual y Anteriores
                  </h3>
                  <span className="text-[11px] text-gray-500">
                    Ordenado de la más reciente a la más antigua
                  </span>
                </div>

                {versionModalData.versions.map((ver, idx) => {
                  const isSelectedInLog = ver.version === versionModalData.selectedVersion;
                  const isLatest = idx === 0;

                  return (
                    <div
                      key={ver.version + idx}
                      className={`p-4 rounded-xl border transition-all ${
                        isSelectedInLog
                          ? 'border-purple-300 dark:border-purple-700/80 bg-purple-50/20 dark:bg-purple-950/20 shadow-xs ring-1 ring-purple-400/30'
                          : 'border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800/40'
                      }`}
                    >
                      {/* Cabecera de la Versión */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-mono font-bold text-xs">
                            {ver.version.toUpperCase()}
                          </span>
                          {isLatest && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                              Última versión
                            </span>
                          )}
                          {isSelectedInLog && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
                              Versión del Registro
                            </span>
                          )}
                          {ver.fechaRechazo && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300">
                              Rechazada
                            </span>
                          )}
                          {ver.fechaAprobacion && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                              Aprobada
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-black text-gray-900 dark:text-white">
                              {formatCurrency(ver.monto)}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {ver.fechaCreacion}
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              handleDownloadSingleVersion(
                                ver,
                                versionModalData.proformaCode,
                                versionModalData.clientName
                              )
                            }
                            className="px-2.5 py-1.5 bg-gray-100 hover:bg-purple-100 dark:bg-slate-800 dark:hover:bg-purple-900/50 text-gray-700 hover:text-purple-700 dark:text-gray-300 dark:hover:text-purple-300 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title={`Descargar versión ${ver.version} en formato CSV`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar {ver.version}</span>
                          </button>
                        </div>
                      </div>

                      {/* Detalles y Motivos */}
                      <div className="pt-3 space-y-2.5 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-600 dark:text-gray-300">
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">Responsable: </span>
                            {ver.usuarioResponsable || 'No especificado'}
                          </div>
                          {ver.fechaRechazo && (
                            <div>
                              <span className="font-semibold text-rose-600 dark:text-rose-400">Fecha Rechazo: </span>
                              {ver.fechaRechazo}
                            </div>
                          )}
                          {ver.fechaAprobacion && (
                            <div>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Fecha Aprobación: </span>
                              {ver.fechaAprobacion}
                            </div>
                          )}
                        </div>

                        {ver.motivo && (
                          <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-white/5">
                            <div className="font-bold text-gray-900 dark:text-white text-[11px]">
                              Motivo / Discrepancia:
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mt-0.5 text-[11px] leading-relaxed">
                              {ver.motivo}
                            </p>
                          </div>
                        )}

                        {ver.observaciones && (
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white">Observaciones: </span>
                            <span className="text-gray-600 dark:text-gray-400">{ver.observaciones}</span>
                          </div>
                        )}

                        {ver.cambiosRealizados && ver.cambiosRealizados.length > 0 && (
                          <div className="space-y-1">
                            <span className="font-semibold text-gray-900 dark:text-white text-[11px]">
                              Cambios y Ajustes Aplicados:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-gray-600 dark:text-gray-400 pl-1 text-[11px]">
                              {ver.cambiosRealizados.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Desglose de Ítems / Servicios si están disponibles */}
                        {ver.items && ver.items.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-gray-100 dark:border-white/5 space-y-1.5">
                            <div className="font-bold text-gray-900 dark:text-white text-[11px]">
                              Desglose de Servicios / SKUs ({ver.items.length} ítems):
                            </div>
                            <div className="overflow-x-auto rounded-lg border border-gray-100 dark:border-white/5">
                              <table className="w-full text-left text-[11px] border-collapse">
                                <thead>
                                  <tr className="bg-gray-50 dark:bg-slate-800/80 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-white/5">
                                    <th className="py-1.5 px-2.5">Código</th>
                                    <th className="py-1.5 px-2">Descripción</th>
                                    <th className="py-1.5 px-2 text-right">Cant.</th>
                                    <th className="py-1.5 px-2 text-right">Tarifa Base</th>
                                    <th className="py-1.5 px-2 text-right">Desc. %</th>
                                    <th className="py-1.5 px-2.5 text-right">Total</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300">
                                  {ver.items.map((it) => (
                                    <tr key={it.id} className="hover:bg-gray-50/60 dark:hover:bg-slate-800/50">
                                      <td className="py-1.5 px-2.5 font-mono text-purple-700 dark:text-purple-300 font-semibold">{it.codigo}</td>
                                      <td className="py-1.5 px-2">{it.descripcion}</td>
                                      <td className="py-1.5 px-2 text-right font-mono">{it.cantidad}</td>
                                      <td className="py-1.5 px-2 text-right font-mono">{formatCurrency(it.tarifaBase)}</td>
                                      <td className="py-1.5 px-2 text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{it.descuentoPct}%</td>
                                      <td className="py-1.5 px-2.5 text-right font-mono font-bold text-gray-900 dark:text-white">{formatCurrency(it.total)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="px-6 py-3.5 border-t border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-slate-800/80 flex items-center justify-between gap-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Total de {versionModalData.versions.length} versión(es) archivadas para trazabilidad de auditoría.
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedVersionLog(null)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200 dark:border-white/10 transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() =>
                    handleDownloadAllVersions(
                      versionModalData.versions,
                      versionModalData.proformaCode,
                      versionModalData.clientName
                    )
                  }
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Descargar Expediente Completo (CSV)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
