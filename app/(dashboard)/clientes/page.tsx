'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  ArrowUpDown,
  Building2,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Shield,
  Briefcase,
  History,
  Tag,
  UserPlus,
  RefreshCw,
  Plus,
  Check,
  X,
  Phone,
  Mail,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { MOCK_CLIENTS, MOCK_EXECUTIVES, MOCK_AUDIT } from '@/lib/mock-data';
import { Client, Executive, HistorialModificacionCliente } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

type FilterTab = 'todos' | 'asignados' | 'sin_asignar' | 'inactivos';
type ViewMode = 'tabla' | 'cartera_ejecutivo';

export default function ClientesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);
  const [executives, setExecutives] = useState<Executive[]>(MOCK_EXECUTIVES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExecutiveFilter, setSelectedExecutiveFilter] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<FilterTab>('todos');
  const [viewMode, setViewMode] = useState<ViewMode>('tabla');

  // Modal / Drawer de Ficha 360° del cliente
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);

  // Modal para Asignar / Reasignar Ejecutivo
  const [reassignModalClient, setReassignModalClient] = useState<Client | null>(null);
  const [targetExecutiveId, setTargetExecutiveId] = useState<string>('');
  const [reassignReason, setReassignReason] = useState<string>('');

  // Modal para Cambiar Cuenta Corriente Activa
  const [accountModalClient, setAccountModalClient] = useState<Client | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [accountChangeReason, setAccountChangeReason] = useState<string>('');

  // Clientes sin asignar
  const unassignedClients = useMemo(
    () => clients.filter((c) => !c.ejecutivoId),
    [clients]
  );

  // Filtrado general de clientes
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      // Filtro por Tab
      if (activeTab === 'asignados' && !c.ejecutivoId) return false;
      if (activeTab === 'sin_asignar' && c.ejecutivoId) return false;
      if (activeTab === 'inactivos' && c.estado !== 'Inactivo') return false;

      // Filtro por Ejecutivo selector (solo aplica cuando está visible en cartera por ejecutivo)
      if (viewMode === 'cartera_ejecutivo' && selectedExecutiveFilter !== 'todos') {
        if (selectedExecutiveFilter === 'sin_ejecutivo' && c.ejecutivoId) return false;
        if (selectedExecutiveFilter !== 'sin_ejecutivo' && c.ejecutivoId !== selectedExecutiveFilter) {
          return false;
        }
      }

      // Filtro por término de búsqueda (RUT, Razón Social, Nombre Fantasía, Cuenta Corriente, Ejecutivo)
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchRut = c.rut.toLowerCase().includes(term);
        const matchRazon = c.razonSocial.toLowerCase().includes(term);
        const matchFantasia = c.nombreFantasia.toLowerCase().includes(term);
        const matchCta = c.cuentaCorriente.numero.toLowerCase().includes(term);
        const matchEjecutivo = c.ejecutivoNombre?.toLowerCase().includes(term);
        return matchRut || matchRazon || matchFantasia || matchCta || matchEjecutivo;
      }

      return true;
    });
  }, [clients, activeTab, viewMode, selectedExecutiveFilter, searchTerm]);

  // Manejador de asignación / reasignación
  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignModalClient || !targetExecutiveId) return;

    const targetExe = executives.find((exe) => exe.id === targetExecutiveId);
    if (!targetExe) return;

    const previousExeName = reassignModalClient.ejecutivoNombre || 'Sin ejecutivo asignado';
    const clientName = reassignModalClient.razonSocial;
    const nowStr = new Date().toLocaleString('es-CL');

    const nuevaModificacion: HistorialModificacionCliente = {
      id: `hm-${Date.now()}`,
      fecha: nowStr,
      usuario: user?.name || 'Carlos Muñoz (Jefatura)',
      tipoModificacion: 'Asignación Ejecutivo',
      detalle: reassignReason.trim()
        ? `Reasignación a ${targetExe.nombre}. Motivo: ${reassignReason}`
        : `Asignación de ejecutivo responsable: ${targetExe.nombre}`,
      valorAnterior: previousExeName,
      valorNuevo: targetExe.nombre,
    };

    // Actualizar clientes
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === reassignModalClient.id) {
          const updated = {
            ...c,
            ejecutivoId: targetExe.id,
            ejecutivoNombre: targetExe.nombre,
            historialModificaciones: [nuevaModificacion, ...(c.historialModificaciones || [])],
          };
          // Si estaba abierta la ficha 360, actualizarla también
          if (selectedClientDetail?.id === c.id) {
            setSelectedClientDetail(updated);
          }
          return updated;
        }
        return c;
      })
    );

    // Actualizar contadores en ejecutivos
    setExecutives((prev) =>
      prev.map((exe) => {
        if (exe.id === targetExecutiveId) {
          return { ...exe, clientesAsignadosCount: exe.clientesAsignadosCount + 1 };
        }
        if (reassignModalClient.ejecutivoId && exe.id === reassignModalClient.ejecutivoId) {
          return { ...exe, clientesAsignadosCount: Math.max(0, exe.clientesAsignadosCount - 1) };
        }
        return exe;
      })
    );

    // Registrar en log de auditoría
    MOCK_AUDIT.unshift({
      id: `a-${Date.now()}`,
      ts: nowStr,
      fechaHora: nowStr,
      usuario: user?.name || 'Carlos Muñoz',
      rol: 'Jefatura',
      accion: 'Reasignación de Ejecutivo',
      recurso: reassignModalClient.id,
      objetoAfectado: `${clientName} (${reassignModalClient.rut})`,
      estadoAnterior: `Ejecutivo: ${previousExeName}`,
      estadoNuevo: `Ejecutivo: ${targetExe.nombre}`,
      motivoObservaciones: reassignReason || 'Asignación directa desde panel de jefatura.',
      ip: '10.0.2.12',
    });

    showToast(
      `Cliente ${clientName} asignado exitosamente a ${targetExe.nombre}. Trazabilidad registrada.`,
      'success',
      5000,
      'Asignación Actualizada'
    );

    setReassignModalClient(null);
    setTargetExecutiveId('');
    setReassignReason('');
  };

  // Manejador de cambio de cuenta corriente activa
  const handleConfirmAccountChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountModalClient || !selectedAccountId) return;

    const availableAccounts = accountModalClient.cuentasCorrientes || [accountModalClient.cuentaCorriente];
    const newAccount = availableAccounts.find((a) => a.id === selectedAccountId);
    if (!newAccount) return;

    const previousAccountNum = accountModalClient.cuentaCorriente.numero;
    const previousBank = accountModalClient.cuentaCorriente.banco;
    const clientName = accountModalClient.razonSocial;
    const nowStr = new Date().toLocaleString('es-CL');

    const nuevaModificacion: HistorialModificacionCliente = {
      id: `hm-${Date.now()}`,
      fecha: nowStr,
      usuario: user?.name || 'Carlos Muñoz (Jefatura)',
      tipoModificacion: 'Datos Empresa',
      detalle: `Cambio de cuenta corriente activa a N° ${newAccount.numero} (${newAccount.banco}). ${accountChangeReason ? `Motivo: ${accountChangeReason}` : ''}`.trim(),
      valorAnterior: `N° ${previousAccountNum} (${previousBank})`,
      valorNuevo: `N° ${newAccount.numero} (${newAccount.banco})`,
    };

    setClients((prev) =>
      prev.map((c) => {
        if (c.id === accountModalClient.id) {
          const updated = {
            ...c,
            cuentaCorriente: newAccount,
            historialModificaciones: [nuevaModificacion, ...(c.historialModificaciones || [])],
          };
          if (selectedClientDetail?.id === c.id) {
            setSelectedClientDetail(updated);
          }
          return updated;
        }
        return c;
      })
    );

    MOCK_AUDIT.unshift({
      id: `a-${Date.now()}`,
      ts: nowStr,
      fechaHora: nowStr,
      usuario: user?.name || 'Carlos Muñoz',
      rol: 'Jefatura',
      accion: 'Modificación Cliente',
      recurso: accountModalClient.id,
      objetoAfectado: `${clientName} (${accountModalClient.rut})`,
      estadoAnterior: `Cuenta: ${previousAccountNum} (${previousBank})`,
      estadoNuevo: `Cuenta: ${newAccount.numero} (${newAccount.banco})`,
      motivoObservaciones: accountChangeReason || 'Cambio de cuenta corriente activa desde panel.',
      ip: '10.0.2.12',
    });

    showToast(
      `Cuenta corriente activa de ${clientName} actualizada a N° ${newAccount.numero} (${newAccount.banco}).`,
      'success',
      5000,
      'Cuenta Actualizada'
    );

    setAccountModalClient(null);
    setSelectedAccountId('');
    setAccountChangeReason('');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/70 dark:bg-slate-900/70 p-5 rounded-2xl border border-purple-100 dark:border-white/10 shadow-xs backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
              Jefatura de Facturación Especial
            </span>
            <span className="text-xs text-gray-500">• Gestión y Supervisión</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            Administración de Clientes y Asignación de Ejecutivos
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            Supervisa la relación <span className="font-semibold text-purple-700 dark:text-purple-300">Cliente ➔ Ejecutivo responsable ➔ Proformas asociadas</span> y gestiona la cartera.
          </p>
        </div>

        {/* Resumen Métricas Rápidas */}
        <div className="flex items-center gap-3">
          <div className="text-right px-3 py-1.5 bg-purple-50/80 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 rounded-xl">
            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">Total Clientes</div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-200">{clients.length}</div>
          </div>
          <div className="text-right px-3 py-1.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 rounded-xl">
            <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Asignados</div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {clients.filter((c) => c.ejecutivoId).length}
            </div>
          </div>
          <div className={`text-right px-3 py-1.5 rounded-xl border ${
            unassignedClients.length > 0
              ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 animate-pulse'
              : 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-white/10'
          }`}>
            <div className="text-[11px] font-bold text-amber-800 dark:text-amber-400">Sin Ejecutivo</div>
            <div className="text-lg font-bold text-amber-700 dark:text-amber-300">{unassignedClients.length}</div>
          </div>
        </div>
      </div>

      {/* ALERTA: Clientes Sin Ejecutivo Asignado (Punto 1 Requerimiento Jira) */}
      {unassignedClients.length > 0 && (
        <div className="p-4 bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Atención: Hay {unassignedClients.length} cliente(s) sin ejecutivo responsable asignado
              </h3>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Los clientes sin asignar impiden el flujo continuo de elaboración y supervisión de proformas. Asigna un ejecutivo para balancear la carga.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('sin_asignar');
              setSelectedExecutiveFilter('todos');
            }}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
          >
            Ver clientes sin asignar ({unassignedClients.length})
          </button>
        </div>
      )}

      {/* Controles de Vista, Tabs y Filtros */}
      <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl border border-purple-100/80 dark:border-white/10 p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Tabs de Filtro Rápido */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'todos'
                  ? 'bg-white dark:bg-slate-700 text-purple-900 dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Todos ({clients.length})
            </button>
            <button
              onClick={() => setActiveTab('asignados')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'asignados'
                  ? 'bg-white dark:bg-slate-700 text-purple-900 dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Asignados ({clients.filter((c) => c.ejecutivoId).length})
            </button>
            <button
              onClick={() => setActiveTab('sin_asignar')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'sin_asignar'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 dark:text-amber-400 hover:bg-amber-100/50'
              }`}
            >
              Sin Asignar ({unassignedClients.length})
            </button>
            <button
              onClick={() => setActiveTab('inactivos')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'inactivos'
                  ? 'bg-white dark:bg-slate-700 text-purple-900 dark:text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              Inactivos ({clients.filter((c) => c.estado === 'Inactivo').length})
            </button>
          </div>

          {/* Switch de Modo de Vista */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            <span className="text-xs text-gray-500 font-medium">Modo:</span>
            <div className="flex p-1 bg-gray-100/80 dark:bg-slate-800/80 rounded-xl">
              <button
                onClick={() => setViewMode('tabla')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'tabla'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Directorio Clientes
              </button>
              <button
                onClick={() => setViewMode('cartera_ejecutivo')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  viewMode === 'cartera_ejecutivo'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                Cartera por Ejecutivo
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          {/* Input de Búsqueda */}
          <div className={`${viewMode === 'cartera_ejecutivo' ? 'md:col-span-8' : 'md:col-span-12'} relative`}>
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por Razón Social, RUT (ej: 76.452.120-K), Cuenta Corriente o Ejecutivo..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro por Ejecutivo Asignado (Solo visible en Cartera por Ejecutivo) */}
          {viewMode === 'cartera_ejecutivo' && (
            <div className="md:col-span-4 relative">
              <select
                value={selectedExecutiveFilter}
                onChange={(e) => setSelectedExecutiveFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-gray-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none cursor-pointer"
              >
                <option value="todos">Filtrar por Ejecutivo (Todos)</option>
                <option value="sin_ejecutivo">⚠️ Sin ejecutivo asignado</option>
                {executives.map((exe) => (
                  <option key={exe.id} value={exe.id}>
                    👤 {exe.nombre} ({exe.clientesAsignadosCount} clientes)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* VISTA 1: DIRECTORIO / TABLA GENERAL DE CLIENTES */}
      {viewMode === 'tabla' && (
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100/90 dark:border-white/10 overflow-hidden shadow-xs">
          <div className="w-full overflow-hidden">
            <table className="w-full table-fixed text-left border-collapse text-xs">
              <colgroup>
                <col className="w-[19%]" />
                <col className="w-[19%]" />
                <col className="w-[17%]" />
                <col className="w-[17%]" />
                <col className="w-[18%]" />
                <col className="w-[5%]" />
                <col className="w-[5%]" />
              </colgroup>
              <thead>
                <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[11px] font-bold text-gray-600 dark:text-gray-400">
                  <th className="py-3.5 px-4">Cliente / razón social</th>
                  <th className="py-3.5 px-3">Rut & giro</th>
                  <th className="py-3.5 px-3">Cuenta corriente</th>
                  <th className="py-3.5 px-3">Ejecutivo responsable</th>
                  <th className="py-3.5 px-3">Condición comercial</th>
                  <th className="py-3.5 px-2 text-center">Estado</th>
                  <th className="py-3.5 px-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs text-gray-700 dark:text-gray-300">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">
                      No se encontraron clientes con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const isUnassigned = !client.ejecutivoId;
                    return (
                      <tr
                        key={client.id}
                        className={`hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors ${
                          isUnassigned ? 'bg-amber-50/30 dark:bg-amber-950/10' : ''
                        }`}
                      >
                        {/* Razón Social */}
                        <td className="py-3.5 px-4 font-medium">
                          <div className="min-w-0 truncate">
                            <div className="font-bold text-gray-900 dark:text-white leading-tight truncate">
                              {client.razonSocial}
                            </div>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 block truncate">
                              {client.nombreFantasia}
                            </span>
                          </div>
                        </td>

                        {/* RUT & Giro */}
                        <td className="py-3.5 px-3 truncate">
                          <span className="font-mono font-semibold text-gray-900 dark:text-gray-200 block truncate">
                            {client.rut}
                          </span>
                          <div className="text-[10px] text-gray-500 truncate" title={client.giro}>
                            {client.giro}
                          </div>
                        </td>

                        {/* Cuenta Corriente con número de cuentas disponibles y botón de cambio */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="min-w-0 truncate max-w-[calc(100%-28px)]">
                              <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-gray-800 dark:text-gray-200 truncate">
                                <CreditCard className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                <span className="truncate">{client.cuentaCorriente.numero}</span>
                              </div>
                              <span className="text-[10px] text-gray-500 block truncate font-medium">
                                {client.cuentasCorrientes && client.cuentasCorrientes.length > 1
                                  ? `${client.cuentasCorrientes.length} cuentas disponibles`
                                  : '1 cuenta disponible'}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setAccountModalClient(client);
                                setSelectedAccountId(client.cuentaCorriente.id);
                                setAccountChangeReason('');
                              }}
                              className="p-1 rounded-lg border border-purple-200/80 dark:border-white/10 hover:bg-purple-100/70 dark:hover:bg-purple-950/70 text-purple-700 dark:text-purple-300 transition-all cursor-pointer shrink-0 shadow-2xs"
                              title="Cambiar / seleccionar entre cuentas disponibles"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Ejecutivo Responsable con icono de cambio / actualización a la derecha y fuera del recuadro */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {client.ejecutivoNombre ? (
                              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 dark:border-purple-800/40 text-purple-900 dark:text-purple-200 font-semibold text-[11px] truncate max-w-[calc(100%-28px)]">
                                <UserCheck className="w-3 h-3 text-purple-600 shrink-0" />
                                <span className="truncate">{client.ejecutivoNombre}</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 font-bold text-[10px] animate-pulse shrink-0">
                                <UserX className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Sin asignar</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setReassignModalClient(client);
                                setTargetExecutiveId(client.ejecutivoId || '');
                                setReassignReason('');
                              }}
                              className="p-1 rounded-lg border border-purple-200/80 dark:border-white/10 hover:bg-purple-100/70 dark:hover:bg-purple-950/70 text-purple-700 dark:text-purple-300 transition-all cursor-pointer shrink-0 shadow-2xs"
                              title={client.ejecutivoId ? 'Cambiar / reasignar ejecutivo' : 'Asignar ejecutivo responsable'}
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>
                        </td>

                        {/* Condiciones Comerciales */}
                        <td className="py-3.5 px-3 truncate">
                          <div className="text-[11px] font-medium text-gray-900 dark:text-gray-200 truncate">
                            {client.condicionesComerciales.tipo}
                          </div>
                          <div className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold truncate">
                            {client.condicionesComerciales.descuentoAcordado}
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="py-3.5 px-2 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              client.estado === 'Activo'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                            }`}
                          >
                            {client.estado}
                          </span>
                        </td>

                        {/* Acción */}
                        <td className="py-3.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedClientDetail(client)}
                            className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 hover:shadow-xs transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs"
                            title="Ver ficha 360° del cliente"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 2: CARTERA DE CLIENTES POR EJECUTIVO (Punto 1 Requerimiento Jira) */}
      {viewMode === 'cartera_ejecutivo' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {executives.map((exe) => {
              const assignedToExe = clients.filter((c) => c.ejecutivoId === exe.id);
              return (
                <div
                  key={exe.id}
                  className="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-purple-100 dark:border-white/10 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Header Ejecutivo */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-xs shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">
                            {exe.nombre}
                          </h3>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 block truncate">
                            {exe.email}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300 font-extrabold text-xs shrink-0">
                        {assignedToExe.length} clientes
                      </span>
                    </div>

                    {/* Métricas clave del ejecutivo */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-gray-50 dark:bg-slate-800/60 rounded-xl mb-3 text-center">
                      <div>
                        <div className="text-[10px] text-gray-500">Tasa Aprob.</div>
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {exe.tasaAprobacion}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">Tasa Rechazo</div>
                        <div className="text-xs font-bold text-red-600 dark:text-red-400">
                          {exe.tasaRechazo}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-gray-500">T. Promedio</div>
                        <div className="text-xs font-bold text-purple-700 dark:text-purple-300">
                          {exe.tiempoPromedioGeneracionDias}d
                        </div>
                      </div>
                    </div>

                    {/* Lista de clientes asignados */}
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Cartera asignada:
                      </div>
                      {assignedToExe.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-2">
                          Sin clientes en cartera actualmente.
                        </p>
                      ) : (
                        assignedToExe.map((c) => (
                          <div
                            key={c.id}
                            className="p-2 rounded-lg bg-purple-50/40 dark:bg-slate-800/40 border border-purple-100/70 dark:border-white/5 flex items-center justify-between gap-2 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <button
                                type="button"
                                onClick={() => setSelectedClientDetail(c)}
                                className="p-1 rounded-md bg-purple-100/80 hover:bg-purple-200 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer shrink-0"
                                title="Ver ficha / documento del cliente"
                              >
                                <FileText className="w-3 h-3" />
                              </button>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                  {c.razonSocial}
                                </p>
                                <span className="text-[10px] text-gray-500 font-mono block">
                                  {c.rut}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setReassignModalClient(c);
                                setTargetExecutiveId(c.ejecutivoId || '');
                                setReassignReason('');
                              }}
                              className="p-1 rounded-md border border-purple-200/80 dark:border-white/10 hover:bg-purple-100 dark:hover:bg-purple-950/70 text-purple-700 dark:text-purple-300 transition-colors cursor-pointer shrink-0 shadow-2xs"
                              title="Cambiar / reasignar ejecutivo"
                            >
                              <RefreshCw className="w-3 h-3" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Acciones de Cartera */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">
                      RUT: {exe.rut}
                    </span>
                    <button
                      onClick={() => {
                        setSearchTerm(exe.nombre);
                        setViewMode('tabla');
                      }}
                      className="text-xs font-semibold text-purple-600 hover:text-purple-800 cursor-pointer flex items-center gap-1"
                    >
                      Ver en tabla
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ASIGNAR / REASIGNAR EJECUTIVO (Punto 1 Requerimiento Jira)        */}
      {/* ========================================================================= */}
      {reassignModalClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-white/10 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {reassignModalClient.ejecutivoId ? 'Reasignar Ejecutivo Responsable' : 'Asignar Ejecutivo Responsable'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Impactará directamente en la gestión de las proformas asociadas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReassignModalClient(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datos del Cliente */}
            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/30 text-xs space-y-1">
              <div className="font-bold text-gray-900 dark:text-white">
                {reassignModalClient.razonSocial}
              </div>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
                <span>RUT: <strong className="font-mono">{reassignModalClient.rut}</strong></span>
                <span>Ejecutivo actual: <strong>{reassignModalClient.ejecutivoNombre || 'Sin asignar'}</strong></span>
              </div>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4">
              {/* Selector de Nuevo Ejecutivo */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Seleccionar Ejecutivo de Facturación Especial: *
                </label>
                <select
                  value={targetExecutiveId}
                  onChange={(e) => setTargetExecutiveId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none cursor-pointer font-medium"
                >
                  <option value="">-- Seleccionar un ejecutivo --</option>
                  {executives.map((exe) => (
                    <option key={exe.id} value={exe.id}>
                      {exe.nombre} ({exe.clientesAsignadosCount} clientes asignados • Tasa aprobación: {exe.tasaAprobacion}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Motivo de la asignación/cambio */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Motivo de asignación / reasignación (Trazabilidad auditoría):
                </label>
                <textarea
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                  placeholder="Ej: Balanceo de carga de cartera por alta temporada, especialización de rubro retail, solicitud de cliente..."
                  rows={3}
                  className="w-full p-3 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none resize-none"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignModalClient(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!targetExecutiveId}
                  className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirmar Asignación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL / DRAWER 2: FICHA 360° DEL CLIENTE (Punto 2 Requerimiento Jira)      */}
      {/* ========================================================================= */}
      {selectedClientDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-white/10 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Encabezado Ficha 360 */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-extrabold text-base flex items-center justify-center shadow-sm">
                  {selectedClientDetail.nombreFantasia.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedClientDetail.razonSocial}
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedClientDetail.estado === 'Activo'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {selectedClientDetail.estado}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    RUT: {selectedClientDetail.rut} • {selectedClientDetail.giro}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedClientDetail(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Grid 3 Columnas: Info General, Cuenta Corriente, Ejecutivo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Columna 1: Contacto Principal */}
              <div className="p-4 bg-purple-50/50 dark:bg-slate-800/50 rounded-xl border border-purple-100/70 dark:border-white/5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                  <Briefcase className="w-4 h-4 text-purple-600" />
                  Contacto Principal
                </div>
                <div className="text-xs">
                  <p className="font-bold text-gray-900 dark:text-white">
                    {selectedClientDetail.contactoPrincipal.nombre}
                  </p>
                  <p className="text-gray-500 text-[11px] mb-1">
                    {selectedClientDetail.contactoPrincipal.cargo}
                  </p>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-[11px]">
                    <Mail className="w-3 h-3 text-purple-500" />
                    {selectedClientDetail.contactoPrincipal.email}
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-[11px]">
                    <Phone className="w-3 h-3 text-purple-500" />
                    {selectedClientDetail.contactoPrincipal.telefono}
                  </div>
                </div>
              </div>

              {/* Columna 2: Cuenta Corriente Comercial */}
              <div className="p-4 bg-purple-50/50 dark:bg-slate-800/50 rounded-xl border border-purple-100/70 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    Cuenta Corriente
                  </div>
                  <button
                    onClick={() => {
                      setAccountModalClient(selectedClientDetail);
                      setSelectedAccountId(selectedClientDetail.cuentaCorriente.id);
                      setAccountChangeReason('');
                    }}
                    className="text-[11px] text-purple-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Cambiar
                  </button>
                </div>
                <div className="text-xs space-y-1">
                  <div className="font-mono font-bold text-gray-900 dark:text-white flex items-center justify-between">
                    <span>{selectedClientDetail.cuentaCorriente.numero}</span>
                    <span className="text-[10px] font-sans font-normal text-gray-500">
                      {selectedClientDetail.cuentaCorriente.banco}
                    </span>
                  </div>
                  <div className="text-purple-700 dark:text-purple-300 font-medium text-[11px]">
                    {selectedClientDetail.cuentasCorrientes?.length || 1}{' '}
                    {(selectedClientDetail.cuentasCorrientes?.length || 1) === 1
                      ? 'cuenta disponible'
                      : 'cuentas disponibles'}
                  </div>
                  <div className="pt-1 text-[11px] flex justify-between">
                    <span className="text-gray-500">Línea Crédito:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {formatCurrency(selectedClientDetail.cuentaCorriente.lineaCredito)}
                    </span>
                  </div>
                  <div className="text-[11px] flex justify-between">
                    <span className="text-gray-500">Disponible:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(selectedClientDetail.cuentaCorriente.saldoDisponible)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Columna 3: Ejecutivo Responsable */}
              <div className="p-4 bg-purple-50/50 dark:bg-slate-800/50 rounded-xl border border-purple-100/70 dark:border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 dark:text-purple-300 uppercase tracking-wider">
                    <UserCheck className="w-4 h-4 text-purple-600" />
                    Ejecutivo
                  </div>
                  <button
                    onClick={() => {
                      setReassignModalClient(selectedClientDetail);
                      setTargetExecutiveId(selectedClientDetail.ejecutivoId || '');
                      setReassignReason('');
                    }}
                    className="text-[11px] text-purple-600 font-bold hover:underline cursor-pointer"
                  >
                    Cambiar
                  </button>
                </div>
                {selectedClientDetail.ejecutivoNombre ? (
                  <div className="text-xs">
                    <p className="font-bold text-gray-900 dark:text-white">
                      {selectedClientDetail.ejecutivoNombre}
                    </p>
                    <p className="text-gray-500 text-[11px]">
                      Ejecutivo de Facturación Especial
                    </p>
                    <div className="mt-2 text-[10px] px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 rounded inline-block font-semibold">
                      Asignación Activa
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 rounded-lg text-xs font-bold">
                    ⚠️ Sin ejecutivo asignado
                  </div>
                )}
              </div>
            </div>

            {/* Condiciones Comerciales Vigentes */}
            <div className="p-4 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200/80 dark:border-white/5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-purple-600" />
                Condiciones Comerciales Asociadas
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 text-[11px] block">Tipo de Acuerdo:</span>
                  <strong className="text-gray-900 dark:text-white">
                    {selectedClientDetail.condicionesComerciales.tipo}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500 text-[11px] block">Descuento Negociado:</span>
                  <strong className="text-purple-600 dark:text-purple-400 font-bold">
                    {selectedClientDetail.condicionesComerciales.descuentoAcordado}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500 text-[11px] block">Plazo de Pago:</span>
                  <strong className="text-gray-900 dark:text-white">
                    {selectedClientDetail.condicionesComerciales.plazoPagoDias} días (Vigencia hasta {selectedClientDetail.condicionesComerciales.validezHasta})
                  </strong>
                </div>
              </div>
              {selectedClientDetail.condicionesComerciales.observaciones && (
                <p className="text-[11px] text-gray-600 dark:text-gray-400 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-gray-100 dark:border-white/5">
                  Obs: {selectedClientDetail.condicionesComerciales.observaciones}
                </p>
              )}
            </div>

            {/* KPIs Históricos del Cliente (Punto 7 Requerimiento Jira) */}
            <div>
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Desempeño y Comportamiento Histórico de Proformas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 bg-purple-50/40 dark:bg-slate-800/40 border border-purple-100 dark:border-white/5 rounded-xl text-center">
                  <div className="text-[10px] text-gray-500">Proformas Generadas</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedClientDetail.kpis.proformasTotales}
                  </div>
                </div>
                <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-center">
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400">Tasa Aprobación</div>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-300">
                    {selectedClientDetail.kpis.tasaAprobacion}%
                  </div>
                </div>
                <div className="p-3 bg-purple-50/40 dark:bg-slate-800/40 border border-purple-100 dark:border-white/5 rounded-xl text-center">
                  <div className="text-[10px] text-gray-500">Promedio Versiones</div>
                  <div className="text-base font-bold text-purple-700 dark:text-purple-300">
                    {selectedClientDetail.kpis.promedioVersiones} v
                  </div>
                </div>
                <div className="p-3 bg-purple-50/40 dark:bg-slate-800/40 border border-purple-100 dark:border-white/5 rounded-xl text-center">
                  <div className="text-[10px] text-gray-500">Tiempo Aprobación</div>
                  <div className="text-base font-bold text-gray-900 dark:text-white">
                    {selectedClientDetail.kpis.tiempoPromedioAprobacionDias} días
                  </div>
                </div>
              </div>
            </div>

            {/* Historial de Modificaciones y Trazabilidad */}
            <div>
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-600" />
                Historial de Modificaciones de la Ficha
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedClientDetail.historialModificaciones.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    Sin modificaciones registradas en esta ficha.
                  </p>
                ) : (
                  selectedClientDetail.historialModificaciones.map((h) => (
                    <div
                      key={h.id}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-white/5 text-xs flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-purple-700 dark:text-purple-300">
                            {h.tipoModificacion}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            por {h.usuario}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-[11px] mt-0.5">
                          {h.detalle}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">
                        {h.fecha}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Botón de Cierre */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedClientDetail(null)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}
      {/* MODAL 3: CAMBIAR / SELECCIONAR CUENTA CORRIENTE ACTIVA                    */}
      {/* ========================================================================= */}
      {accountModalClient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-white/10 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Cambiar Cuenta Corriente
                  </h3>
                  <p className="text-xs text-gray-500">
                    Selecciona entre las cuentas corrientes disponibles del cliente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAccountModalClient(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datos del Cliente */}
            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-100 dark:border-purple-900/30 text-xs space-y-1">
              <div className="font-bold text-gray-900 dark:text-white">
                {accountModalClient.razonSocial}
              </div>
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>RUT: <strong className="font-mono">{accountModalClient.rut}</strong></span>
                <span className="font-medium text-purple-700 dark:text-purple-300">
                  {accountModalClient.cuentasCorrientes?.length || 1}{' '}
                  {(accountModalClient.cuentasCorrientes?.length || 1) === 1 ? 'cuenta disponible' : 'cuentas disponibles'}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmAccountChange} className="space-y-4">
              {/* Lista de Cuentas Corrientes Disponibles */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  Seleccionar cuenta activa para facturación: *
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(accountModalClient.cuentasCorrientes || [accountModalClient.cuentaCorriente]).map((acc) => {
                    const isSelected = selectedAccountId === acc.id;
                    const isCurrent = accountModalClient.cuentaCorriente.id === acc.id;
                    return (
                      <div
                        key={acc.id}
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-purple-50/90 dark:bg-purple-950/60 border-purple-500 dark:border-purple-500 shadow-xs ring-1 ring-purple-500'
                            : 'bg-white dark:bg-slate-800/80 border-gray-200 dark:border-white/10 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="radio"
                            name="selectedAccount"
                            checked={isSelected}
                            onChange={() => setSelectedAccountId(acc.id)}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-gray-900 dark:text-white text-xs">
                                {acc.numero}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                                {acc.banco}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                  Activa
                                </span>
                              )}
                            </div>
                            {acc.alias && (
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                {acc.alias}
                              </p>
                            )}
                            <div className="flex items-center gap-3 text-[10px] text-gray-500 mt-1">
                              <span>Línea: <strong className="text-gray-700 dark:text-gray-300">{formatCurrency(acc.lineaCredito)}</strong></span>
                              <span>Disponible: <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrency(acc.saldoDisponible)}</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Motivo de cambio de cuenta */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Motivo o referencia del cambio (opcional):
                </label>
                <input
                  type="text"
                  value={accountChangeReason}
                  onChange={(e) => setAccountChangeReason(e.target.value)}
                  placeholder="Ej: Solicitud de cliente, cambio de centro de costos, convenio específico..."
                  className="w-full px-3.5 py-2 text-xs bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 outline-none"
                />
              </div>

              {/* Botones de acción */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setAccountModalClient(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedAccountId}
                  className="px-4 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirmar Cambio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
