'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  TrendingUp,
  FileText,
  CheckCircle2,
  Hourglass,
  RotateCcw,
  Receipt,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  XCircle,
  Building2,
  Users,
  Scale,
  Share2,
  ShieldAlert,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowRight,
  FileEdit,
  Send,
  RefreshCw,
  Download,
  AlertOctagon,
  Layers,
  X,
  MessageSquare,
  Briefcase,
  ShieldCheck,
  Tag,
  GitCompare,
  History,
  CreditCard,
  Eye,
  AlertTriangle,
  BadgePercent,
  Calendar,
  MapPin,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import {
  MOCK_PROFORMAS,
  MOCK_CLIENTS,
  MOCK_KAMS,
  MOCK_EXCEPCIONES_TARIFARIAS,
  MOCK_COMUNICACIONES_KAM,
  MOCK_SALESFORCE_OPPORTUNITIES,
  MOCK_PRICING_AUDIT_LOGS,
} from '@/lib/mock-data';
import {
  Proforma,
  KAM,
  ExcepcionTarifaria,
  ComunicacionKAM,
  SalesforceOpportunity,
  AuditLog,
  Client,
  DashboardFiltersState,
  GlobalPricingFiltersState,
} from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

type KpiFilterType = 'todos' | 'aprobadas' | 'revision' | 'rechazadas' | 'facturadas';

const INITIAL_GLOBAL_FILTERS: GlobalPricingFiltersState = {
  periodo: 'mes',
  cliente: 'todos',
  rut: '',
  cuentaCorriente: 'todos',
  kam: 'todos',
  ejecutivo: 'todos',
  servicio: 'todos',
  tipoCliente: 'todos',
  origen: 'todos',
  destino: 'todos',
  tipoEntrega: 'todos',
  motivoRechazo: 'todos',
  tipoExcepcion: 'todos',
  estadoProforma: 'todos',
};

function splitFechaHora(str?: string): { fecha: string; hora: string } {
  if (!str) return { fecha: '-', hora: '' };
  if (str.includes(',')) {
    const parts = str.split(',');
    return { fecha: parts[0].trim(), hora: parts.slice(1).join(',').trim() };
  }
  const parts = str.trim().split(/\s+/);
  if (parts.length >= 2) {
    return { fecha: parts[0], hora: parts.slice(1).join(' ') };
  }
  return { fecha: str, hora: '' };
}

export function PricingDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const { user } = useAuth();
  const { showToast } = useToast();

  // Sección principal activa según la opción del menú lateral
  const currentSection = useMemo<'dashboard' | 'rechazos' | 'clientes' | 'kam'>(() => {
    if (tabParam === 'rechazos' || tabParam === 'excepciones') return 'rechazos';
    if (tabParam === 'clientes') return 'clientes';
    if (tabParam === 'kam' || tabParam === 'kam_sf') return 'kam';
    return 'dashboard';
  }, [tabParam]);

  // Pestañas internas exclusivas del módulo "Dashboard & KPIs"
  const [dashboardSubtab, setDashboardSubtab] = useState<'comercial' | 'clientes' | 'kams' | 'auditoria'>('comercial');

  // Estado de Datos
  const [proformas, setProformas] = useState<Proforma[]>(MOCK_PROFORMAS);
  const [excepciones, setExcepciones] = useState<ExcepcionTarifaria[]>(MOCK_EXCEPCIONES_TARIFARIAS);
  const [comunicaciones, setComunicaciones] = useState<ComunicacionKAM[]>(MOCK_COMUNICACIONES_KAM);
  const [salesforceOps, setSalesforceOps] = useState<SalesforceOpportunity[]>(MOCK_SALESFORCE_OPPORTUNITIES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_PRICING_AUDIT_LOGS);

  // Sincronización en tiempo real de badges de notificación con el Menú Lateral (Sidebar)
  useEffect(() => {
    const pendingRechazos = proformas.filter(
      (p) => p.estado.includes('Rechazada') || Boolean(p.motivoRechazoPricing)
    ).length;
    const pendingExcepciones = excepciones.filter((e) => e.estado.includes('Pendiente')).length;
    const pendingComs = comunicaciones.filter((c) => c.estado !== 'Resuelta').length;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('starken_badges_changed', {
          detail: {
            rechazosCount: pendingRechazos,
            excepcionesCount: pendingExcepciones,
            kamComsCount: pendingComs,
          },
        })
      );
      const existing = JSON.parse(localStorage.getItem('starken_fe_counts') || '{}');
      localStorage.setItem(
        'starken_fe_counts',
        JSON.stringify({
          ...existing,
          rechazosCount: pendingRechazos,
          excepcionesCount: pendingExcepciones,
          kamComsCount: pendingComs,
        })
      );
    }
  }, [proformas, excepciones, comunicaciones]);

  // Sincronizar tabParam con pestaña de rechazos/excepciones
  useEffect(() => {
    if (tabParam === 'excepciones') {
      setRechazosStatusTab('excepciones');
    }
  }, [tabParam]);

  // Filtros Globales del Dashboard (Sección 9: 14 Criterios)
  const [filters, setFilters] = useState<GlobalPricingFiltersState>(INITIAL_GLOBAL_FILTERS);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);
  const [kpiFilter, setKpiFilter] = useState<KpiFilterType>('todos');

  // Buscadores individuales multi-campo para cada tabla/sección
  const [searchTerm, setSearchTerm] = useState<string>(''); // Búsqueda global en subtab comercial / tabla proformas
  const [clientSearchTerm, setClientSearchTerm] = useState<string>('');
  const [kamSearchTerm, setKamSearchTerm] = useState<string>('');
  const [kamTasaFilter, setKamTasaFilter] = useState<'todos' | 'alta' | 'baja'>('todos');
  const [auditSearchTerm, setAuditSearchTerm] = useState<string>('');
  const [rechazosSearchTerm, setRechazosSearchTerm] = useState<string>('');
  const [rechazosStatusTab, setRechazosStatusTab] = useState<'todos' | 'pendientes' | 'derivadas' | 'corregidas' | 'validacion' | 'excepciones'>(tabParam === 'excepciones' ? 'excepciones' : 'todos');
  const [excepcionesSearchTerm, setExcepcionesSearchTerm] = useState<string>('');
  const [clientProformasSearchTerm, setClientProformasSearchTerm] = useState<string>('');
  const [sfSearchTerm, setSfSearchTerm] = useState<string>('');
  const [comsSearchTerm, setComsSearchTerm] = useState<string>('');

  // Modales
  const [selectedProformaDiff, setSelectedProformaDiff] = useState<Proforma | null>(null);
  const [selectedProformaResolucion, setSelectedProformaResolucion] = useState<Proforma | null>(null);
  const [resolucionAccion, setResolucionAccion] = useState<'Validada' | 'Corregida' | 'Solicitar_KAM' | 'Rechazada_Definitiva'>('Validada');
  const [resolucionObservaciones, setResolucionObservaciones] = useState<string>('');

  const [selectedExcepcion, setSelectedExcepcion] = useState<ExcepcionTarifaria | null>(null);
  const [excepcionDecision, setExcepcionDecision] = useState<'Aprobada' | 'Rechazada' | 'Solicitar_Modificacion' | 'Solicitud_KAM'>('Aprobada');
  const [excepcionAnalisis, setExcepcionAnalisis] = useState<string>('');
  const [excepcionObservaciones, setExcepcionObservaciones] = useState<string>('');

  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(MOCK_CLIENTS[0]);
  const [showAllClients, setShowAllClients] = useState<boolean>(false);
  const [showAllModificaciones, setShowAllModificaciones] = useState<boolean>(false);
  const [isSyncingSalesforce, setIsSyncingSalesforce] = useState<boolean>(false);

  // Modal Nuevo Requerimiento KAM
  const [nuevoMensajeOpen, setNuevoMensajeOpen] = useState(false);
  const [nuevoMensajeKam, setNuevoMensajeKam] = useState('Cristián Peña');
  const [nuevoMensajeCliente, setNuevoMensajeCliente] = useState('Retail Logistics Chile S.A.');
  const [nuevoMensajeAsunto, setNuevoMensajeAsunto] = useState('');
  const [nuevoMensajeCuerpo, setNuevoMensajeCuerpo] = useState('');
  const [nuevoMensajePrioridad, setNuevoMensajePrioridad] = useState<'Alta' | 'Media' | 'Baja'>('Alta');

  // Estados exclusivos para KPIs por KAM
  const [selectedKamModal, setSelectedKamModal] = useState<KAM | null>(null);

  // Helper universal multi-campo: busca coincidencia en cualquier columna / propiedad
  const matchAnyData = (obj: any, term: string): boolean => {
    if (!term || !term.trim()) return true;
    const t = term.toLowerCase().trim();
    const check = (val: any): boolean => {
      if (val === null || val === undefined) return false;
      if (typeof val === 'string') return val.toLowerCase().includes(t);
      if (typeof val === 'number') return val.toString().toLowerCase().includes(t);
      if (Array.isArray(val)) return val.some(check);
      if (typeof val === 'object') return Object.values(val).some(check);
      return false;
    };
    return check(obj);
  };

  // Cantidad de filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.periodo !== 'mes') count++;
    if (filters.cliente !== 'todos') count++;
    if (filters.rut.trim() !== '') count++;
    if (filters.cuentaCorriente !== 'todos') count++;
    if (filters.kam !== 'todos') count++;
    if (filters.ejecutivo !== 'todos') count++;
    if (filters.servicio !== 'todos') count++;
    if (filters.tipoCliente !== 'todos') count++;
    if (filters.origen !== 'todos') count++;
    if (filters.destino !== 'todos') count++;
    if (filters.tipoEntrega !== 'todos') count++;
    if (filters.motivoRechazo !== 'todos') count++;
    if (filters.tipoExcepcion !== 'todos') count++;
    if (filters.estadoProforma !== 'todos') count++;
    return count;
  }, [filters]);

  // Resetear filtros
  const resetFilters = () => {
    setFilters(INITIAL_GLOBAL_FILTERS);
    setSearchTerm('');
    setKpiFilter('todos');
    setClientSearchTerm('');
    setKamSearchTerm('');
    setKamTasaFilter('todos');
    setAuditSearchTerm('');
    setRechazosSearchTerm('');
    setRechazosStatusTab('todos');
    setExcepcionesSearchTerm('');
    setClientProformasSearchTerm('');
    setShowAllClients(false);
    setShowAllModificaciones(false);
    setSfSearchTerm('');
    setComsSearchTerm('');
    showToast('Filtros restablecidos', 'Se han reiniciado los 14 criterios de filtro del dashboard.', 'info');
  };

  // Opciones únicas extraídas dinámicamente para los 14 filtros
  const filterOptions = useMemo(() => {
    const clientes = Array.from(new Set(proformas.map((p) => p.cliente).filter(Boolean))).sort();
    const cuentas = Array.from(
      new Set(
        proformas
          .map((p) => p.cuentaCorrienteNombre || p.cuentaCorrienteId)
          .filter(Boolean) as string[]
      )
    ).sort();
    const kams = Array.from(new Set(MOCK_KAMS.map((k) => k.nombre))).sort();
    const ejecutivos = Array.from(
      new Set(proformas.map((p) => p.ejecutivoNombre).filter(Boolean) as string[])
    ).sort();
    const servicios = Array.from(
      new Set(proformas.map((p) => p.servicio).filter(Boolean) as string[])
    ).sort();
    const tiposCliente = Array.from(
      new Set(proformas.map((p) => p.tipoCliente).filter(Boolean) as string[])
    ).sort();
    const origenes = Array.from(
      new Set(proformas.map((p) => p.origen).filter(Boolean) as string[])
    ).sort();
    const destinos = Array.from(
      new Set(proformas.map((p) => p.destino).filter(Boolean) as string[])
    ).sort();
    const tiposEntrega = Array.from(
      new Set(proformas.map((p) => p.tipoEntrega).filter(Boolean) as string[])
    ).sort();
    const motivosRechazo = Array.from(
      new Set(
        proformas
          .map((p) => p.motivoRechazoPrincipal || p.motivoRechazoPricing)
          .filter(Boolean) as string[]
      )
    ).sort();
    const tiposExcepcion = Array.from(
      new Set(
        proformas
          .map((p) => p.tipoExcepcion)
          .filter((v): v is string => Boolean(v && v !== 'Ninguna'))
      )
    ).sort();
    const estadosProforma = [
      'Pendiente de validación',
      'Aprobada por Cliente',
      'Facturado',
      'Derivada a KAM',
      'Pendiente',
      'Rechazada',
      'Tarifas Corregidas por Pricing',
    ];

    return {
      clientes,
      cuentas,
      kams,
      ejecutivos,
      servicios,
      tiposCliente,
      origenes,
      destinos,
      tiposEntrega,
      motivosRechazo,
      tiposExcepcion,
      estadosProforma,
    };
  }, [proformas]);

  // Proformas base filtradas por el período
  const periodoFilteredProformas = useMemo(() => {
    switch (filters.periodo) {
      case 'hoy':
        return proformas.filter((p) => p.id === 'PF-2026-0204' || p.id === 'PF-2026-0208');
      case 'semana':
        return proformas.filter(
          (p) =>
            p.id === 'PF-2026-0204' ||
            p.id === 'PF-2026-0208' ||
            p.id === 'PF-2026-0220' ||
            p.id === 'PF-2026-0225'
        );
      case 'mes':
        return proformas.filter(
          (p) =>
            p.id === 'PF-2026-0204' ||
            p.id === 'PF-2026-0208' ||
            p.id === 'PF-2026-0215' ||
            p.id === 'PF-2026-0220' ||
            p.id === 'PF-2026-0225' ||
            p.id === 'PF-2026-0230' ||
            p.id === 'PF-2025-0141' ||
            p.id === 'PF-2025-0140'
        );
      case 'trimestre':
        return proformas.filter(
          (p) =>
            p.id === 'PF-2026-0204' ||
            p.id === 'PF-2026-0208' ||
            p.id === 'PF-2026-0215' ||
            p.id === 'PF-2026-0220' ||
            p.id === 'PF-2026-0225' ||
            p.id === 'PF-2026-0230' ||
            p.id === 'PF-2025-0141' ||
            p.id === 'PF-2025-0140' ||
            p.id === 'PF-2025-0143' ||
            p.id === 'PF-2025-0142'
        );
      case 'ano':
      case 'todos':
      default:
        return proformas;
    }
  }, [proformas, filters.periodo]);

  // Proformas filtradas globalmente por los 14 criterios de la sección 9
  const globalFilteredProformas = useMemo(() => {
    return periodoFilteredProformas.filter((p) => {
      // 2. Cliente
      if (filters.cliente !== 'todos' && !p.cliente.toLowerCase().includes(filters.cliente.toLowerCase())) {
        return false;
      }
      // 3. RUT
      if (filters.rut.trim()) {
        const cleanRut = filters.rut.replace(/[^0-9kK]/g, '').toLowerCase();
        const pRut = (p.rut || '').replace(/[^0-9kK]/g, '').toLowerCase();
        if (!pRut.includes(cleanRut)) return false;
      }
      // 4. Cuenta Corriente
      if (filters.cuentaCorriente !== 'todos') {
        const matchCta =
          (p.cuentaCorrienteId && p.cuentaCorrienteId.toLowerCase().includes(filters.cuentaCorriente.toLowerCase())) ||
          (p.cuentaCorrienteNombre && p.cuentaCorrienteNombre.toLowerCase().includes(filters.cuentaCorriente.toLowerCase()));
        if (!matchCta) return false;
      }
      // 5. KAM
      if (filters.kam !== 'todos') {
        if (!p.kamNombre || !p.kamNombre.toLowerCase().includes(filters.kam.toLowerCase())) return false;
      }
      // 6. Ejecutivo
      if (filters.ejecutivo !== 'todos') {
        if (!p.ejecutivoNombre || !p.ejecutivoNombre.toLowerCase().includes(filters.ejecutivo.toLowerCase())) return false;
      }
      // 7. Servicio
      if (filters.servicio !== 'todos') {
        if (!p.servicio || !p.servicio.toLowerCase().includes(filters.servicio.toLowerCase())) return false;
      }
      // 8. Tipo de Cliente
      if (filters.tipoCliente !== 'todos') {
        if (!p.tipoCliente || !p.tipoCliente.toLowerCase().includes(filters.tipoCliente.toLowerCase())) return false;
      }
      // 9. Origen
      if (filters.origen !== 'todos') {
        if (!p.origen || !p.origen.toLowerCase().includes(filters.origen.toLowerCase())) return false;
      }
      // 10. Destino
      if (filters.destino !== 'todos') {
        if (!p.destino || !p.destino.toLowerCase().includes(filters.destino.toLowerCase())) return false;
      }
      // 11. Tipo de Entrega
      if (filters.tipoEntrega !== 'todos') {
        if (!p.tipoEntrega || !p.tipoEntrega.toLowerCase().includes(filters.tipoEntrega.toLowerCase())) return false;
      }
      // 12. Motivo de Rechazo
      if (filters.motivoRechazo !== 'todos') {
        const pMotivo = p.motivoRechazoPrincipal || p.motivoRechazoPricing || '';
        if (!pMotivo.toLowerCase().includes(filters.motivoRechazo.toLowerCase())) return false;
      }
      // 13. Tipo de Excepción
      if (filters.tipoExcepcion !== 'todos') {
        if (!p.tipoExcepcion || !p.tipoExcepcion.toLowerCase().includes(filters.tipoExcepcion.toLowerCase())) return false;
      }
      // 14. Estado de la Proforma
      if (filters.estadoProforma !== 'todos') {
        if (filters.estadoProforma === 'Aprobadas') {
          if (!p.estado.includes('Aprobada') && p.estado !== 'Facturado') return false;
        } else if (filters.estadoProforma === 'Rechazadas') {
          if (!p.estado.includes('Rechazada') && p.estado !== 'Derivada a KAM') return false;
        } else if (filters.estadoProforma === 'En revisión') {
          if (p.estado !== 'Pendiente de validación' && p.estadoSupervision !== 'Pendiente_Autorizacion') return false;
        } else if (p.estado !== filters.estadoProforma) {
          return false;
        }
      }
      return true;
    });
  }, [periodoFilteredProformas, filters]);

  // KPIs Consolidados de la Cartera KAM (Reacciona a filtros)
  const kpiKamStats = useMemo(() => {
    const listKams = MOCK_KAMS.filter((kam) => filters.kam === 'todos' || kam.nombre.toLowerCase().includes(filters.kam.toLowerCase()));
    const totalKams = listKams.length || 1;
    const totalCarteraClientes = listKams.reduce((acc, k) => acc + k.carteraClientesCount, 0);
    const totalProformas = listKams.reduce((acc, k) => acc + k.proformasTotales, 0);
    const totalRechazosTarifa = listKams.reduce((acc, k) => acc + k.proformasRechazadasTarifa, 0);
    const tasaRechazoPromedio = totalProformas > 0 ? ((totalRechazosTarifa / totalProformas) * 100).toFixed(1) : '0';
    const totalExcepciones = listKams.reduce((acc, k) => acc + k.excepcionesSolicitadas, 0);
    const totalExcAprobadas = listKams.reduce((acc, k) => acc + k.excepcionesAprobadas, 0);
    const totalExcRechazadas = listKams.reduce((acc, k) => acc + k.excepcionesRechazadas, 0);
    const totalReprocesos = listKams.reduce((acc, k) => acc + k.cantidadReprocesos, 0);
    const dctoPromedio = (listKams.reduce((acc, k) => acc + k.descuentoPromedioCarteraPct, 0) / totalKams).toFixed(1);
    const varPromedio = (listKams.reduce((acc, k) => acc + k.variacionPromedioTarifaPct, 0) / totalKams).toFixed(1);
    const tiempoPromResolucion = (listKams.reduce((acc, k) => acc + k.tiempoPromedioResolucionDias, 0) / totalKams).toFixed(1);

    return {
      totalKams: listKams.length,
      totalCarteraClientes,
      totalProformas,
      totalRechazosTarifa,
      tasaRechazoPromedio,
      totalExcepciones,
      totalExcAprobadas,
      totalExcRechazadas,
      totalReprocesos,
      dctoPromedio,
      varPromedio,
      tiempoPromResolucion,
    };
  }, [filters.kam]);

  // KAMs Filtrados
  const kamsFiltrados = useMemo(() => {
    return MOCK_KAMS.filter((kam) => {
      if (filters.kam !== 'todos' && !kam.nombre.toLowerCase().includes(filters.kam.toLowerCase())) {
        return false;
      }
      const matchTasa =
        kamTasaFilter === 'todos' ||
        (kamTasaFilter === 'alta' && kam.tasaRechazoTarifario > 10) ||
        (kamTasaFilter === 'baja' && kam.tasaRechazoTarifario <= 10);

      return matchTasa && matchAnyData(kam, kamSearchTerm);
    });
  }, [filters.kam, kamTasaFilter, kamSearchTerm]);

  // KPIs Comerciales Dinámicos (12 Indicadores de Pricing) basados en los 14 criterios de filtro
  const kpisComerciales = useMemo(() => {
    const list = globalFilteredProformas;
    const total = list.length;
    const aprobadas = list.filter((p) => p.estado.includes('Aprobada') || p.estado === 'Facturado').length;
    const rechazadas = list.filter((p) => p.estado.includes('Rechazada') || p.estado === 'Derivada a KAM').length;
    const pendientes = list.filter((p) => p.estado === 'Pendiente' || p.estado === 'Pendiente de validación').length;
    const enRevision = list.filter((p) => p.estado === 'Pendiente de validación' || p.estadoSupervision === 'Pendiente_Autorizacion').length;
    const facturadas = list.filter((p) => p.estado === 'Facturado').length;
    const excepcionesCount = list.filter((p) => p.esExcepcionTarifaria || (p.tipoExcepcion && p.tipoExcepcion !== 'Ninguna')).length;

    const montoTotal = list.reduce((acc, curr) => acc + curr.monto, 0);
    const tasaAprobacion = total > 0 ? ((aprobadas / total) * 100).toFixed(1) : '0.0';
    const tasaRechazo = total > 0 ? ((rechazadas / total) * 100).toFixed(1) : '0.0';
    const pctExcepciones = total > 0 ? ((excepcionesCount / total) * 100).toFixed(1) : '0.0';

    return {
      total,
      montoTotal,
      aprobadas,
      rechazadas,
      pendientes,
      enRevision,
      facturadas,
      excepcionesCount,
      pctExcepciones,
      tasaAprobacion,
      tasaRechazo,
      tiempoPromedioAprobacionRaw: total > 0 ? (filters.periodo === 'hoy' ? '0.9' : filters.periodo === 'semana' ? '1.4' : '2.2') : '0.0',
      promedioVersiones: total > 0 ? (filters.periodo === 'hoy' ? '1.1 v' : '1.3 v') : '0.0 v',
      reprocesosCount: total > 0 ? Math.max(1, Math.round(rechazadas * 1.5)) : 0,
    };
  }, [globalFilteredProformas, filters.periodo]);

  // Proformas filtradas por tarjeta de KPI seleccionada + búsqueda multi-campo
  const kpiFilteredProformas = useMemo(() => {
    let list = globalFilteredProformas;
    if (kpiFilter === 'aprobadas') list = list.filter((p) => p.estado.includes('Aprobada') || p.estado === 'Facturado');
    else if (kpiFilter === 'revision') list = list.filter((p) => p.estado === 'Pendiente de validación' || p.estadoSupervision === 'Pendiente_Autorizacion');
    else if (kpiFilter === 'rechazadas') list = list.filter((p) => p.estado.includes('Rechazada') || p.estado === 'Derivada a KAM');
    else if (kpiFilter === 'facturadas') list = list.filter((p) => p.estado === 'Facturado');
    return list.filter((p) => matchAnyData(p, searchTerm));
  }, [globalFilteredProformas, kpiFilter, searchTerm]);

  // Proformas evaluadas por Pricing para la tabla consolidada (filtro general + búsqueda multi-campo)
  const proformasTarifarias = useMemo(() => {
    return globalFilteredProformas.filter((pf) => matchAnyData(pf, searchTerm));
  }, [globalFilteredProformas, searchTerm]);

  // Clientes filtrados con KAM garantizado y datos de Pricing (multi-campo)
  const clientesFiltrados = useMemo(() => {
    return MOCK_CLIENTS.map((c) => {
      const kamNombre =
        c.kamNombre ||
        (c.id === 'cli-1' || c.id === 'cli-4' || c.id === 'cli-5' || c.id === 'cli-11'
          ? 'Cristián Peña'
          : c.id === 'cli-2' || c.id === 'cli-6' || c.id === 'cli-9'
          ? 'Camila Rojas'
          : c.id === 'cli-3' || c.id === 'cli-8'
          ? 'Gonzalo Valdés'
          : 'Valeria Fuentes');

      const kamId =
        c.kamId ||
        (kamNombre === 'Cristián Peña'
          ? 'kam-1'
          : kamNombre === 'Camila Rojas'
          ? 'kam-2'
          : kamNombre === 'Gonzalo Valdés'
          ? 'kam-3'
          : 'kam-4');

      return {
        ...c,
        kamNombre,
        kamId,
      };
    }).filter((c) => {
      if (filters.cliente !== 'todos' && !c.razonSocial.toLowerCase().includes(filters.cliente.toLowerCase())) {
        return false;
      }
      if (filters.rut.trim()) {
        const cleanRut = filters.rut.replace(/[^0-9kK]/g, '').toLowerCase();
        const cRut = (c.rut || '').replace(/[^0-9kK]/g, '').toLowerCase();
        if (!cRut.includes(cleanRut)) return false;
      }
      if (filters.kam !== 'todos' && !c.kamNombre.toLowerCase().includes(filters.kam.toLowerCase())) {
        return false;
      }
      if (filters.ejecutivo !== 'todos' && c.ejecutivoNombre && !c.ejecutivoNombre.toLowerCase().includes(filters.ejecutivo.toLowerCase())) {
        return false;
      }
      if (filters.tipoCliente !== 'todos' && c.tipoCliente && !c.tipoCliente.toLowerCase().includes(filters.tipoCliente.toLowerCase())) {
        return false;
      }
      return matchAnyData(c, clientSearchTerm);
    });
  }, [filters, clientSearchTerm]);

  // Proformas asociadas al cliente seleccionado en Clientes & Tarifas
  const proformasDelCliente = useMemo(() => {
    if (!selectedClientDetail) return [];
    const cleanRut = selectedClientDetail.rut.replace(/[^0-9kK]/g, '');
    return proformas.filter(
      (p) =>
        p.cliente.toLowerCase().includes(selectedClientDetail.razonSocial.toLowerCase()) ||
        selectedClientDetail.razonSocial.toLowerCase().includes(p.cliente.toLowerCase()) ||
        (p.rut && p.rut.replace(/[^0-9kK]/g, '') === cleanRut)
    );
  }, [selectedClientDetail, proformas]);

  // Historial de modificaciones y trazabilidad de Pricing para el cliente seleccionado
  const modificacionesPricingCliente = useMemo(() => {
    if (!selectedClientDetail) return [];
    const clientNameLower = selectedClientDetail.razonSocial.toLowerCase();
    return auditLogs.filter(
      (a) =>
        (a.cliente && a.cliente.toLowerCase().includes(clientNameLower)) ||
        (a.objetoAfectado && a.objetoAfectado.toLowerCase().includes(clientNameLower)) ||
        selectedClientDetail.historialModificaciones?.some((hm) => hm.detalle.includes(a.recurso))
    );
  }, [selectedClientDetail, auditLogs]);

  // Lista unificada de modificaciones de pricing para el cliente seleccionado
  const listaModificacionesCliente = useMemo(() => {
    if (!selectedClientDetail) return [];
    const listAudit = modificacionesPricingCliente.map((log) => ({
      id: log.id,
      accion: log.accion,
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300',
      recurso: log.recurso,
      usuario: `${log.usuario} (${log.rol})`,
      detalle: log.motivoObservaciones || 'Ajuste tarifario y validación comercial homologada.',
      fecha: log.fechaHora,
    }));

    const listHist = (selectedClientDetail.historialModificaciones || []).map((hm) => ({
      id: hm.id,
      accion: hm.tipoModificacion,
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300',
      recurso: '',
      usuario: hm.usuario,
      detalle: hm.detalle,
      fecha: hm.fecha,
    }));

    return [...listAudit, ...listHist];
  }, [selectedClientDetail, modificacionesPricingCliente]);

  // Guardar Resolución de Pricing
  const handleGuardarResolucion = () => {
    if (!selectedProformaResolucion) return;

    const fechaNow = new Date().toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    let nuevoEstado: any = selectedProformaResolucion.estado;
    let nuevoEstadoSupervision: any = selectedProformaResolucion.estadoSupervision;

    if (resolucionAccion === 'Validada') {
      nuevoEstado = 'Tarifas Corregidas por Pricing';
      nuevoEstadoSupervision = 'Pricing_Resuelto';
    } else if (resolucionAccion === 'Corregida') {
      nuevoEstado = 'En revisión';
      nuevoEstadoSupervision = 'Devuelta_Analista';
    } else if (resolucionAccion === 'Solicitar_KAM') {
      nuevoEstado = 'Derivada a KAM';
    } else if (resolucionAccion === 'Rechazada_Definitiva') {
      nuevoEstado = 'Rechazada';
    }

    setProformas((prev) =>
      prev.map((pf) =>
        pf.id === selectedProformaResolucion.id
          ? {
              ...pf,
              estado: nuevoEstado,
              estadoSupervision: nuevoEstadoSupervision,
              motivoRechazoPricing: undefined,
              observacionesPricing: resolucionObservaciones,
              resolucionPricing: resolucionAccion === 'Solicitar_KAM' ? 'Pendiente_KAM' : (resolucionAccion as any),
              fechaResolucionPricing: fechaNow,
              usuarioPricingResolucion: user?.name || 'Rodrigo Palma',
            }
          : pf
      )
    );

    const newAudit: AuditLog = {
      id: `pr-aud-${Date.now()}`,
      ts: fechaNow,
      fechaHora: fechaNow,
      usuario: user?.name || 'Rodrigo Palma',
      rol: 'Pricing',
      accion:
        resolucionAccion === 'Validada'
          ? 'Validación Tarifa'
          : resolucionAccion === 'Solicitar_KAM'
          ? 'Solicitud a KAM'
          : 'Resolución Pricing',
      recurso: selectedProformaResolucion.id,
      objetoAfectado: selectedProformaResolucion.cliente,
      cliente: selectedProformaResolucion.cliente,
      kam: selectedProformaResolucion.kamNombre || 'Cristián Peña',
      version: selectedProformaResolucion.versionActual || 'v2',
      estadoAnterior: selectedProformaResolucion.estado,
      estadoNuevo: nuevoEstado,
      motivoObservaciones: resolucionObservaciones || `Resolución aplicada: ${resolucionAccion}`,
      ip: '10.0.3.15',
    };

    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(
      'Resolución de Pricing registrada',
      `La proforma ${selectedProformaResolucion.id} fue actualizada a "${nuevoEstado}".`,
      'success'
    );

    setSelectedProformaResolucion(null);
    setResolucionObservaciones('');
  };

  // Guardar Excepción Evaluada
  const handleGuardarExcepcion = () => {
    if (!selectedExcepcion) return;

    const fechaNow = new Date().toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    setExcepciones((prev) =>
      prev.map((exc) =>
        exc.id === selectedExcepcion.id
          ? {
              ...exc,
              estado: excepcionDecision,
              analisisPricing: excepcionAnalisis || exc.analisisPricing,
              observacionesPricing: excepcionObservaciones || exc.observacionesPricing,
              fechaResolucion: fechaNow,
              usuarioResolucion: user?.name || 'Rodrigo Palma',
            }
          : exc
      )
    );

    let accionNombre = 'Excepción Aprobada';
    let estadoDisplay = 'Aprobada';
    if (excepcionDecision === 'Rechazada') {
      accionNombre = 'Excepción Rechazada';
      estadoDisplay = 'Rechazada';
    } else if (excepcionDecision === 'Solicitar_Modificacion') {
      accionNombre = 'Modificación de Proforma Solicitada';
      estadoDisplay = 'Modificación Solicitada';
    } else if (excepcionDecision === 'Solicitud_KAM') {
      accionNombre = 'Revisión Solicitada a KAM';
      estadoDisplay = 'Solicitud KAM';
    }

    setExcepciones((prev) =>
      prev.map((exc) =>
        exc.id === selectedExcepcion.id
          ? {
              ...exc,
              estado: (excepcionDecision === 'Solicitar_Modificacion' ? 'Pendiente_Pricing' : excepcionDecision) as any,
              analisisPricing: excepcionAnalisis || exc.analisisPricing,
              observacionesPricing: excepcionObservaciones || exc.observacionesPricing,
              fechaResolucion: fechaNow,
              usuarioResolucion: user?.name || 'Rodrigo Palma',
            }
          : exc
      )
    );

    const newAudit: AuditLog = {
      id: `exc-aud-${Date.now()}`,
      ts: fechaNow,
      fechaHora: fechaNow,
      usuario: user?.name || 'Rodrigo Palma',
      rol: 'Pricing',
      accion: accionNombre,
      recurso: selectedExcepcion.id,
      objetoAfectado: selectedExcepcion.clienteNombre,
      cliente: selectedExcepcion.clienteNombre,
      kam: selectedExcepcion.kamNombre,
      version: selectedExcepcion.versionProforma,
      estadoAnterior: selectedExcepcion.estado,
      estadoNuevo: estadoDisplay,
      motivoObservaciones: `[Análisis Pricing]: ${excepcionAnalisis || 'Sin análisis adicional'} | [Observaciones]: ${excepcionObservaciones || 'Conforme a evaluación técnica'}`,
      ip: '10.0.3.15',
    };

    setAuditLogs((prev) => [newAudit, ...prev]);

    showToast(
      'Excepción evaluada exitosamente',
      `La solicitud ${selectedExcepcion.id} ha quedado registrada como "${estadoDisplay}".`,
      'success'
    );

    setSelectedExcepcion(null);
    setExcepcionAnalisis('');
    setExcepcionObservaciones('');
  };

  // Simulación Sync Salesforce
  const handleSyncSalesforce = () => {
    setIsSyncingSalesforce(true);
    setTimeout(() => {
      setIsSyncingSalesforce(false);
      setSalesforceOps((prev) =>
        prev.map((op) => ({
          ...op,
          syncStatus: 'Sincronizado',
          lastSyncDate: 'Ahora mismo (Sincronizado)',
        }))
      );
      showToast(
        'Sincronización Salesforce Exitosa',
        'Se han sincronizado las cuentas comerciales y actualizado las oportunidades activas.',
        'success'
      );
    }, 1000);
  };

  // Enviar mensaje a KAM
  const handleEnviarMensajeKAM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensajeAsunto || !nuevoMensajeCuerpo) return;

    const fechaNow = new Date().toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const newCom: ComunicacionKAM = {
      id: `COM-00${comunicaciones.length + 1}`,
      proformaId: 'PF-2026-0204',
      clienteNombre: nuevoMensajeCliente,
      kamNombre: nuevoMensajeKam,
      usuarioPricing: user?.name || 'Rodrigo Palma',
      fechaEnvio: fechaNow,
      asunto: nuevoMensajeAsunto,
      mensajePricing: nuevoMensajeCuerpo,
      estado: 'Esperando_Respuesta_KAM',
      prioridad: nuevoMensajePrioridad,
      salesforceOpportunityId: 'OPP-STK-2026-8891',
    };

    setComunicaciones((prev) => [newCom, ...prev]);
    setNuevoMensajeOpen(false);
    setNuevoMensajeAsunto('');
    setNuevoMensajeCuerpo('');

    showToast(
      'Requerimiento enviado al KAM',
      `Se notificó a ${nuevoMensajeKam} y se vinculó la solicitud en Salesforce.`,
      'success'
    );
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* SECCIÓN 1: DASHBOARD & KPIS (/?tab=dashboard o por defecto)              */}
      {/* ========================================================================= */}
      {currentSection === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100">
                Hola, {user?.name?.split(' ')[0] || 'Rodrigo'} 👋
              </h1>
              <p className="text-caption text-gray-600 dark:text-gray-400">
                Rol: <span className="font-semibold text-purple-700 dark:text-purple-400">Encargado de Pricing</span> · Supervisión tarifaria, gestión de excepciones y control de KAMs
              </p>
            </div>

            {/* Selector de Período Rápido */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-caption font-semibold text-gray-600 dark:text-gray-400">Período:</span>
              <select
                value={filters.periodo}
                onChange={(e) => setFilters((prev) => ({ ...prev, periodo: e.target.value as any }))}
                className="px-3.5 py-2 text-caption bg-white dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-600 dark:text-gray-300 shadow-xs outline-none cursor-pointer"
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

          {/* ========================================================================= */}
          {/* SUBPESTAÑAS DEL DASHBOARD (ARRIBA)                                       */}
          {/* ========================================================================= */}
          <div className="flex p-1 bg-gray-100/80 dark:bg-slate-800/80 rounded-2xl w-fit flex-wrap gap-1 shadow-2xs">
            <button
              onClick={() => setDashboardSubtab('comercial')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                dashboardSubtab === 'comercial'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>KPIs de pricing</span>
            </button>

            <button
              onClick={() => setDashboardSubtab('clientes')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                dashboardSubtab === 'clientes'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>KPIs por cliente ({MOCK_CLIENTS.length})</span>
            </button>

            <button
              onClick={() => setDashboardSubtab('kams')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                dashboardSubtab === 'kams'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>KPIs por KAM ({MOCK_KAMS.length})</span>
            </button>

            <button
              onClick={() => setDashboardSubtab('auditoria')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                dashboardSubtab === 'auditoria'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Auditoría pricing</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* SECCIÓN 9: FILTROS DEL DASHBOARD (SOLO EN PESTAÑA 'KPIs de Pricing')     */}
          {/* ========================================================================= */}
          {dashboardSubtab === 'comercial' && (
            <div className="bg-white dark:bg-slate-900 border border-purple-200/90 dark:border-purple-900/50 rounded-2xl px-3.5 sm:px-4 py-2 sm:py-2.5 shadow-xs transition-all duration-300">
              {/* Header del Card de Filtros (Siempre visible) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                {/* Título con su icono */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      Filtros
                    </span>
                    {activeFiltersCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 shadow-2xs">
                        {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                {/* Número de proformas encontradas + Botón de filtros */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <span className="text-xs text-purple-800 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/50 px-2.5 py-1 rounded-lg border border-purple-100 dark:border-purple-900/50">
                    {globalFilteredProformas.length} proformas encontradas
                  </span>

                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-2 py-1 text-xs font-bold text-purple-700 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-200 flex items-center gap-1 cursor-pointer transition-colors bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/60 rounded-lg border border-purple-200/60 dark:border-purple-800/40 shadow-2xs"
                      title="Restablecer todos los filtros"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Limpiar</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                    className={`px-3 py-1 text-xs rounded-lg font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border shadow-xs ${
                      isFilterPanelOpen
                        ? 'bg-purple-600 text-white border-purple-600 shadow-purple-600/20'
                        : 'bg-purple-50/80 hover:bg-purple-100 dark:bg-slate-800 text-purple-900 dark:text-purple-200 border-purple-200 dark:border-white/10'
                    }`}
                    title={isFilterPanelOpen ? 'Contraer filtros' : 'Desplegar filtros'}
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filtros</span>
                    {isFilterPanelOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Chips cuando está contraído pero hay filtros activos */}
              {!isFilterPanelOpen && activeFiltersCount > 0 && (
                <div className="pt-2.5 mt-2.5 border-t border-purple-100 dark:border-white/10 flex items-center gap-1.5 flex-wrap text-xs animate-in fade-in duration-150">
                  <span className="text-[11px] font-bold text-gray-500">Filtros activos:</span>
                  {filters.periodo !== 'mes' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Período: {filters.periodo}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, periodo: 'mes' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.cliente !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Cliente: {filters.cliente}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, cliente: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.rut.trim() !== '' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      RUT: {filters.rut}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, rut: '' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.cuentaCorriente !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Cta: {filters.cuentaCorriente}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, cuentaCorriente: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.kam !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      KAM: {filters.kam}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, kam: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.ejecutivo !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Ejecutivo: {filters.ejecutivo}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, ejecutivo: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.servicio !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Servicio: {filters.servicio}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, servicio: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.tipoCliente !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Tipo: {filters.tipoCliente}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, tipoCliente: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.origen !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Origen: {filters.origen}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, origen: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.destino !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Destino: {filters.destino}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, destino: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.tipoEntrega !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Entrega: {filters.tipoEntrega}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, tipoEntrega: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.motivoRechazo !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Motivo: {filters.motivoRechazo}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, motivoRechazo: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.tipoExcepcion !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Excepción: {filters.tipoExcepcion}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, tipoExcepcion: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.estadoProforma !== 'todos' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Estado: {filters.estadoProforma}
                      <button type="button" onClick={() => setFilters(p => ({ ...p, estadoProforma: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Contenido desplegable con efecto sutil (Grid de 14 Filtros) */}
              {isFilterPanelOpen && (
                <div className="pt-3 mt-2.5 border-t border-purple-100 dark:border-white/10 space-y-3 animate-in fade-in zoom-in-98 duration-200">
                  {/* Grid de 14 Filtros (Responsivo) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 text-xs">
                    {/* 1. Periodo */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-purple-600" />
                        <span>Período</span>
                      </label>
                      <select
                        value={filters.periodo}
                        onChange={(e) => setFilters((prev) => ({ ...prev, periodo: e.target.value as any }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer"
                      >
                        <option value="hoy" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Hoy</option>
                        <option value="semana" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Esta Semana</option>
                        <option value="mes" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Este Mes</option>
                        <option value="trimestre" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Tercer Trimestre (Q3)</option>
                        <option value="ano" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Año 2026</option>
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todo el Historial</option>
                      </select>
                    </div>

                    {/* 2. Cliente */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-purple-600" />
                        <span>Cliente</span>
                      </label>
                      <select
                        value={filters.cliente}
                        onChange={(e) => setFilters((prev) => ({ ...prev, cliente: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                      >
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los clientes</option>
                        {filterOptions.clientes.map((cli) => (
                          <option key={cli} value={cli} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                            {cli}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 3. RUT */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-purple-600" />
                        <span>RUT</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Ej: 76.123..."
                          value={filters.rut}
                          onChange={(e) => setFilters((prev) => ({ ...prev, rut: e.target.value }))}
                          className="w-full px-2.5 py-1.5 pr-7 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-600 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-500 placeholder:font-normal outline-none focus:border-purple-500 shadow-2xs font-mono"
                        />
                        {filters.rut && (
                          <button
                            type="button"
                            onClick={() => setFilters((prev) => ({ ...prev, rut: '' }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 4. Cuenta Corriente */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Receipt className="w-3 h-3 text-purple-600" />
                        <span>Cta. corriente</span>
                      </label>
                      <select
                        value={filters.cuentaCorriente}
                        onChange={(e) => setFilters((prev) => ({ ...prev, cuentaCorriente: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                      >
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todas las cuentas</option>
                        {filterOptions.cuentas.map((cta) => (
                          <option key={cta} value={cta} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                            {cta}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 5. KAM */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-purple-600" />
                        <span>KAM</span>
                      </label>
                      <select
                        value={filters.kam}
                        onChange={(e) => setFilters((prev) => ({ ...prev, kam: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                      >
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los KAMs</option>
                        {filterOptions.kams.map((k) => (
                          <option key={k} value={k} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                            {k}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 6. Ejecutivo */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Users className="w-3 h-3 text-purple-600" />
                        <span>Ejecutivo</span>
                      </label>
                      <select
                        value={filters.ejecutivo}
                        onChange={(e) => setFilters((prev) => ({ ...prev, ejecutivo: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                      >
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los ejecutivos</option>
                        {filterOptions.ejecutivos.map((ej) => (
                          <option key={ej} value={ej} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                            {ej}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 7. Servicio */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-purple-600" />
                        <span>Servicio</span>
                      </label>
                      <select
                        value={filters.servicio}
                        onChange={(e) => setFilters((prev) => ({ ...prev, servicio: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                      >
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los servicios</option>
                        {filterOptions.servicios.map((srv) => (
                          <option key={srv} value={srv} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                            {srv}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 8. Tipo de Cliente */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-purple-600" />
                        <span>Tipo de cliente</span>
                      </label>
                      <select
                        value={filters.tipoCliente}
                        onChange={(e) => setFilters((prev) => ({ ...prev, tipoCliente: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                      >
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los tipos</option>
                        {filterOptions.tiposCliente.map((tc) => (
                          <option key={tc} value={tc} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                            {tc}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 9. Origen */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-purple-600" />
                        <span>Origen</span>
                      </label>
                      <select
                        value={filters.origen}
                        onChange={(e) => setFilters((prev) => ({ ...prev, origen: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                      >
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los orígenes</option>
                        {filterOptions.origenes.map((orig) => (
                          <option key={orig} value={orig} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                            {orig}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 10. Destino */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-purple-600" />
                        <span>Destino</span>
                      </label>
                      <select
                        value={filters.destino}
                        onChange={(e) => setFilters((prev) => ({ ...prev, destino: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                      >
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los destinos</option>
                        {filterOptions.destinos.map((dest) => (
                          <option key={dest} value={dest} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                            {dest}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 11. Tipo de Entrega */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-purple-600" />
                        <span>Tipo de entrega</span>
                      </label>
                      <select
                        value={filters.tipoEntrega}
                        onChange={(e) => setFilters((prev) => ({ ...prev, tipoEntrega: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                      >
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los tipos de entrega</option>
                        {filterOptions.tiposEntrega.map((te) => (
                          <option key={te} value={te} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                            {te}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 12. Motivo de Rechazo */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Motivo de rechazo</span>
                      </label>
                      <select
                        value={filters.motivoRechazo}
                        onChange={(e) => setFilters((prev) => ({ ...prev, motivoRechazo: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                      >
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los motivos</option>
                        {filterOptions.motivosRechazo.map((mr) => (
                          <option key={mr} value={mr} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                            {mr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 13. Tipo de Excepción Tarifaria */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <Scale className="w-3 h-3 text-purple-600" />
                        <span>Tipo de excepción</span>
                      </label>
                      <select
                        value={filters.tipoExcepcion}
                        onChange={(e) => setFilters((prev) => ({ ...prev, tipoExcepcion: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                      >
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todas las excepciones</option>
                        {filterOptions.tiposExcepcion.map((te) => (
                          <option key={te} value={te} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                            {te}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 14. Estado de la Proforma */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-purple-600" />
                        <span>Estado proforma</span>
                      </label>
                      <select
                        value={filters.estadoProforma}
                        onChange={(e) => setFilters((prev) => ({ ...prev, estadoProforma: e.target.value }))}
                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl font-normal text-gray-500 dark:text-gray-400 outline-none focus:border-purple-500 shadow-2xs cursor-pointer truncate"
                      >
                        <option value="todos" className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">Todos los estados</option>
                        {filterOptions.estadosProforma.map((ep) => (
                          <option key={ep} value={ep} className="text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-900">
                            {ep}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Chips de Filtros Activos con Botón X para eliminar individualmente */}
                  {activeFiltersCount > 0 && (
                    <div className="pt-2 border-t border-purple-100 dark:border-white/10 flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-bold text-gray-500">Filtros aplicados:</span>
                      {filters.periodo !== 'mes' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Período: {filters.periodo}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, periodo: 'mes' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.cliente !== 'todos' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Cliente: {filters.cliente}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, cliente: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.rut.trim() !== '' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          RUT: {filters.rut}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, rut: '' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.cuentaCorriente !== 'todos' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Cta: {filters.cuentaCorriente}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, cuentaCorriente: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.kam !== 'todos' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          KAM: {filters.kam}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, kam: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.ejecutivo !== 'todos' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Ejecutivo: {filters.ejecutivo}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, ejecutivo: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.servicio !== 'todos' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Servicio: {filters.servicio}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, servicio: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.tipoCliente !== 'todos' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Tipo: {filters.tipoCliente}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, tipoCliente: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.origen !== 'todos' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Origen: {filters.origen}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, origen: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.destino !== 'todos' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Destino: {filters.destino}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, destino: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.tipoEntrega !== 'todos' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Entrega: {filters.tipoEntrega}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, tipoEntrega: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.motivoRechazo !== 'todos' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Motivo: {filters.motivoRechazo}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, motivoRechazo: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.tipoExcepcion !== 'todos' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Excepción: {filters.tipoExcepcion}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, tipoExcepcion: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {filters.estadoProforma !== 'todos' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                          Estado: {filters.estadoProforma}
                          <button type="button" onClick={() => setFilters(p => ({ ...p, estadoProforma: 'todos' }))} className="hover:text-purple-950 cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 underline ml-auto cursor-pointer"
                      >
                        Borrar todos
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* SUBTAB: KPIS DE PRICING (12 INDICADORES CLAVE GLOBALES)                   */}
          {/* ========================================================================= */}
          {dashboardSubtab === 'comercial' && (
            <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-6 animate-in fade-in duration-150">
              {/* Encabezado y Filtros Rápidos */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Indicadores Globales de Pricing (12 KPIs)</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Visión global del comportamiento de Pricing: volumen auditado, tasas de rechazo, excepciones, reprocesos, tiempos de resolución, causas principales y ranking de incidencias
                  </p>
                </div>

                {/* Contenedor Horizontal Fijo: Buscador Multi-campo + KAM */}
                <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar en proformas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500 shadow-2xs"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Borrar búsqueda"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <select
                    value={filters.kam}
                    onChange={(e) => setFilters((prev) => ({ ...prev, kam: e.target.value }))}
                    className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl text-gray-500 dark:text-gray-400 font-normal outline-none cursor-pointer shadow-2xs whitespace-nowrap shrink-0 min-w-[140px]"
                  >
                    <option value="todos">Todos los KAMs</option>
                    {MOCK_KAMS.map((k) => (
                      <option key={k.id} value={k.nombre}>
                        KAM: {k.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* ========================================================================= */}
              {/* 6 TARJETAS PRINCIPALES DE KPIS (DISEÑO LIMPIO Y ESPACIOSO)                */}
              {/* ========================================================================= */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* KPI 1: Totales */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setKpiFilter('todos')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setKpiFilter('todos'); }}
                  title="Haz clic para ver la vista general del dashboard"
                  className={`p-3.5 rounded-xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${
                    kpiFilter === 'todos'
                      ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-600 ring-2 ring-purple-600/30 shadow-md scale-[1.01]'
                      : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-600/40 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
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
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      kpiFilter === 'todos'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                    }`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white leading-none tracking-tight">
                      {kpisComerciales.total}
                    </div>
                  </div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-300 font-medium leading-tight">
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
                  className={`p-3.5 rounded-xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${
                    kpiFilter === 'aprobadas'
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-600 ring-2 ring-emerald-600/30 shadow-md scale-[1.01]'
                      : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-emerald-300 dark:hover:border-emerald-600/40 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
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
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      kpiFilter === 'aprobadas'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 leading-none tracking-tight">
                      {kpisComerciales.aprobadas}
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium leading-tight">
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
                  className={`p-3.5 rounded-xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${
                    kpiFilter === 'revision'
                      ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-600 ring-2 ring-amber-600/30 shadow-md scale-[1.01]'
                      : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-amber-300 dark:hover:border-amber-600/40 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
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
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      kpiFilter === 'revision'
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300'
                    }`}>
                      <Hourglass className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 leading-none tracking-tight">
                      {kpisComerciales.enRevision}
                    </div>
                  </div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-tight">
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
                  className={`p-3.5 rounded-xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${
                    kpiFilter === 'rechazadas'
                      ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-600 ring-2 ring-rose-600/30 shadow-md scale-[1.01]'
                      : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-600/40 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                      Rechazos
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 flex items-center gap-0.5 ${
                      kpiFilter === 'rechazadas'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/60'
                    }`}>
                      {kpiFilter === 'rechazadas' && <Check className="w-2.5 h-2.5" />}
                      {kpiFilter === 'rechazadas' ? 'Filtrando' : 'Tarifa'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 my-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      kpiFilter === 'rechazadas'
                        ? 'bg-rose-600 text-white'
                        : 'bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300'
                    }`}>
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 leading-none tracking-tight">
                      {kpisComerciales.rechazadas}
                    </div>
                  </div>
                  <div className="text-[11px] text-rose-700 dark:text-rose-400 font-medium leading-tight">
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
                  className={`p-3.5 rounded-xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs ${
                    kpiFilter === 'facturadas'
                      ? 'bg-purple-50/90 dark:bg-purple-950/40 border-purple-600 ring-2 ring-purple-600/30 shadow-md scale-[1.01]'
                      : 'bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-600/40 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
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
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      kpiFilter === 'facturadas'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                    }`}>
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div className="text-2xl font-bold text-purple-700 dark:text-purple-300 leading-none tracking-tight">
                      {kpisComerciales.facturadas}
                    </div>
                  </div>
                  <div className="text-[11px] text-purple-700 dark:text-purple-300 font-medium leading-tight">
                    Emitidas en SAP
                  </div>
                </div>

                {/* KPI 6: T. Aprobación */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setDashboardSubtab('kams')}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setDashboardSubtab('kams'); }}
                  title="Haz clic para ver el detalle de desempeño por KAM"
                  className="p-3.5 rounded-xl border relative overflow-hidden group transition-all cursor-pointer select-none flex flex-col justify-between shadow-2xs bg-white dark:bg-slate-900 border-purple-900/10 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-600/40 hover:shadow-xs"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">
                      T. Aprobación
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0 text-indigo-700 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950/60 flex items-center gap-0.5">
                      <span>Ejecutivos</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 my-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white leading-none tracking-tight">
                        {kpisComerciales.tiempoPromedioAprobacionRaw}
                      </span>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        días
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-tight">
                    Versiones: {kpisComerciales.promedioVersiones}
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* SUBTABLA REACTIVA AL CLIC EN CUALQUIER TARJETA DE KPI                     */}
              {/* ========================================================================= */}
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
                          {kpiFilter === 'aprobadas' && 'Proformas aprobadas / validadas'}
                          {kpiFilter === 'revision' && 'Proformas pendientes de autorización V°B°'}
                          {kpiFilter === 'rechazadas' && 'Proformas en rechazo / derivadas a KAM'}
                          {kpiFilter === 'facturadas' && 'Proformas facturadas en SAP'}
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

                  <div className="w-full overflow-hidden">
                    <table className="w-full table-fixed text-left border-collapse text-xs">
                      <colgroup>
                        <col className="w-[12%]" />
                        <col className="w-[20%]" />
                        <col className="w-[16%]" />
                        <col className="w-[12%]" />
                        <col className="w-[8%]" />
                        <col className="w-[12%]" />
                        <col className="w-[12%]" />
                        <col className="w-[8%]" />
                      </colgroup>
                      <thead>
                        <tr className="bg-purple-50/60 dark:bg-purple-950/40 border-b border-purple-100 dark:border-white/5 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                          <th className="py-2.5 px-3 truncate">Proforma</th>
                          <th className="py-2.5 px-2 truncate">Cliente / Razón social</th>
                          <th className="py-2.5 px-2 truncate">KAM / Gestor</th>
                          <th className="py-2.5 px-2 text-right truncate">Monto</th>
                          <th className="py-2.5 px-1 text-center truncate">Versión</th>
                          <th className="py-2.5 px-1 text-center truncate">Estado</th>
                          <th className="py-2.5 px-2 truncate">Motivo / Condición</th>
                          <th className="py-2.5 px-3 text-right truncate">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-700 dark:text-gray-300 text-[11px]">
                        {kpiFilteredProformas.map((p) => (
                          <tr key={p.id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-purple-700 dark:text-purple-300 truncate">
                              {p.id}
                            </td>
                            <td className="py-2.5 px-2 truncate">
                              <div className="font-bold text-gray-900 dark:text-white leading-tight truncate">{p.cliente}</div>
                              <span className="text-[9px] text-gray-500 font-mono block truncate">RUT: {p.rut}</span>
                            </td>
                            <td className="py-2.5 px-2 truncate">
                              <span className="font-medium text-gray-800 dark:text-gray-200 truncate block">
                                {p.kamNombre || 'Cristián Peña'}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-gray-900 dark:text-white truncate">
                              {p.montoFormatted}
                            </td>
                            <td className="py-2.5 px-1 text-center font-mono font-bold text-purple-700 dark:text-purple-300 truncate">
                              {p.versionActual || 'v1'}
                            </td>
                            <td className="py-2.5 px-1 text-center truncate">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 truncate">
                                {p.estado}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 truncate">
                              <span
                                className="text-gray-600 dark:text-gray-300 text-[11px] truncate block"
                                title={p.motivoRechazoPrincipal || p.observacionesPricing || 'Revisión estándar'}
                              >
                                {p.motivoRechazoPrincipal || p.observacionesPricing || 'Revisión estándar'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right truncate">
                              <button
                                onClick={() => setSelectedProformaDiff(p)}
                                className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-950 dark:hover:bg-purple-900 dark:text-purple-300 text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap"
                              >
                                Ver
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* BLOQUE DE ANÁLISIS 1: EVOLUCIÓN MENSUAL (12) + MOTIVOS DE RECHAZO (7)    */}
              {/* ========================================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Indicador 12: Evolución mensual de rechazos tarifarios y reprocesos */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <History className="w-4 h-4 text-purple-600" />
                          <span>Evolución mensual de rechazos tarifarios y reprocesos</span>
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Comportamiento histórico de incidencias y excepciones de pricing en los últimos 6 meses
                        </p>
                      </div>
                      <div className="flex items-center gap-3 text-xs shrink-0">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-purple-600 inline-block" />
                          <span className="text-gray-600 dark:text-gray-300 text-[11px] font-medium">Rechazos tarifa</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded bg-amber-400 inline-block" />
                          <span className="text-gray-600 dark:text-gray-300 text-[11px] font-medium">Excepciones</span>
                        </div>
                      </div>
                    </div>

                    {/* Gráfico interactivo de barras */}
                    <div className="h-44 flex items-end justify-between gap-2.5 pt-6 px-2 border-b border-gray-100 dark:border-white/5">
                      {[
                        { mes: 'Marzo', rechazos: 18, excepciones: 8, pct: '14.2% tasa' },
                        { mes: 'Abril', rechazos: 22, excepciones: 10, pct: '16.1% tasa' },
                        { mes: 'Mayo', rechazos: 15, excepciones: 6, pct: '11.8% tasa' },
                        { mes: 'Junio', rechazos: 19, excepciones: 9, pct: '13.5% tasa' },
                        { mes: 'Julio', rechazos: 14, excepciones: 5, pct: '10.2% tasa' },
                        { mes: 'Septiembre (Act.)', rechazos: 11, excepciones: 4, pct: '8.4% tasa' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                          <div className="text-[9px] font-bold text-purple-700 dark:text-purple-300 opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {item.pct}
                          </div>
                          <div className="w-full max-w-[42px] flex items-end justify-center gap-1.5 h-32">
                            <div
                              style={{ height: `${(item.rechazos / 25) * 100}%` }}
                              className="w-1/2 bg-gradient-to-t from-purple-700 to-purple-500 rounded-t-md group-hover:brightness-110 transition-all cursor-pointer"
                              title={`Rechazos tarifarios: ${item.rechazos}`}
                            />
                            <div
                              style={{ height: `${(item.excepciones / 25) * 100}%` }}
                              className="w-1/2 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-md group-hover:brightness-110 transition-all cursor-pointer"
                              title={`Excepciones solicitadas: ${item.excepciones}`}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 truncate">
                            {item.mes}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indicador 11: Cantidad de reprocesos derivados de pricing */}
                  <div className="mt-4 pt-3 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-600 dark:text-gray-400 gap-2 border-t border-gray-100 dark:border-white/5">
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                      📉 Tendencia a la baja (-47.8% de tasa de rechazo desde Abril)
                    </span>
                    <span className="text-purple-900 dark:text-purple-300 font-semibold">
                      Reprocesos derivados de Pricing: <strong className="font-bold text-purple-700 dark:text-purple-400">36 casos (1.28 v prom.)</strong>
                    </span>
                  </div>
                </div>

                {/* Indicador 7: Principales motivos de rechazo */}
                <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Principales motivos de rechazo</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Distribución porcentual sobre el total de rechazos tarifarios
                    </p>
                  </div>

                  <div className="space-y-3.5 my-auto">
                    {[
                      { motivo: 'Descuento no estipulado en anexo', count: 9, pct: 36, color: 'bg-purple-600' },
                      { motivo: 'Diferencia en recubitaje / medidas SKU', count: 7, pct: 28, color: 'bg-indigo-600' },
                      { motivo: 'Tarifario marco vencido / sin adenda', count: 5, pct: 20, color: 'bg-amber-500' },
                      { motivo: 'Recargo zona extrema no configurado', count: 4, pct: 16, color: 'bg-rose-500' },
                    ].map((m, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[210px]" title={m.motivo}>
                            {m.motivo}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white shrink-0">
                            {m.count} ({m.pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${m.color} rounded-full transition-all duration-500`} style={{ width: `${m.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* BLOQUE DE ANÁLISIS 2: CLIENTES (8), KAMS (9) Y TARIFAS CRÍTICAS (10)      */}
              {/* ========================================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Indicador 8: Clientes con mayor cantidad de incidencias */}
                <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-purple-600" />
                        <span>Clientes con mayor cantidad de incidencias</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Cuentas con mayor volumen de rechazos tarifarios
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { nombre: 'Minera Escondida Ltda.', rut: '77.890.123-4', incidencias: 7, tasa: '14.3%', kam: 'Gonzalo Valdés', causa: 'Tarifario marco vencido' },
                      { nombre: 'Falabella Retail S.A.', rut: '76.123.456-7', incidencias: 5, tasa: '11.9%', kam: 'Cristián Peña', causa: 'Descuento escalonado >15%' },
                      { nombre: 'Ripley Corp S.A.', rut: '81.345.678-9', incidencias: 4, tasa: '14.8%', kam: 'Cristián Peña', causa: 'Diferencia recubitaje SKU' },
                      { nombre: 'Cencosud Retail S.A.', rut: '96.543.210-K', incidencias: 3, tasa: '10.0%', kam: 'Camila Rojas', causa: 'Descuento no estipulado' },
                    ].map((cli, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-white/5 hover:border-purple-200 dark:hover:border-purple-800/60 transition-all flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                              {cli.nombre}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 shrink-0">
                              {cli.incidencias} rechazos
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-500 truncate mt-0.5">
                            KAM: <strong className="text-gray-700 dark:text-gray-300">{cli.kam}</strong> · Causa: {cli.causa}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const found = MOCK_CLIENTS.find((c) => c.razonSocial.toLowerCase().includes(cli.nombre.toLowerCase().split(' ')[0]));
                            if (found) setSelectedClientDetail(found);
                            router.push('/?tab=clientes');
                          }}
                          className="px-2 py-1 bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 text-purple-800 dark:text-purple-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                        >
                          Ver ficha
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indicador 9: KAM con mayor cantidad de incidencias */}
                <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>KAM con mayor cantidad de incidencias</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ranking por volumen y tasa de rechazo en cartera
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {MOCK_KAMS.map((kam) => (
                      <div
                        key={kam.id}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-white/5 hover:border-purple-200 dark:hover:border-purple-800/60 transition-all flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold flex items-center justify-center text-[9px] shadow-xs shrink-0">
                            {kam.avatar}
                          </div>
                          <div className="min-w-0 truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                                {kam.nombre}
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                kam.tasaRechazoTarifario > 15
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : kam.tasaRechazoTarifario > 10
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}>
                                {kam.tasaRechazoTarifario}% tasa
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500 truncate block">
                              {kam.proformasRechazadasTarifa} de {kam.proformasTotales} proformas · {kam.excepcionesSolicitadas} exc
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setNuevoMensajeKam(kam.nombre);
                            setNuevoMensajeCliente(kam.clientesMayorIncidencia[0] || 'Cliente Corporativo');
                            setNuevoMensajeAsunto(`Revisión incidencias de pricing - ${kam.nombre}`);
                            setNuevoMensajeOpen(true);
                          }}
                          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                        >
                          Gestionar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indicador 10: Tarifa / condición con mayor cantidad de rechazos */}
                <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Tag className="w-4 h-4 text-purple-600" />
                        <span>Tarifa / condición con mayor cantidad de rechazos</span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Condiciones comerciales observadas frecuentemente
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { condicion: 'Descuento Escalonado >15%', rechazos: 11, pct: '44%', impacto: '$21.4M', motivo: 'Descuento sin visado de Gerencia' },
                      { condicion: 'Addendum Distribución Retail', rechazos: 7, pct: '28%', impacto: '$14.8M', motivo: 'Tarifa base desactualizada en anexo' },
                      { condicion: 'Recargo Aéreo Zonas Extremas', rechazos: 4, pct: '16%', impacto: '$7.2M', motivo: 'Flete aéreo sin código de ruta' },
                      { condicion: 'Cubicaje Especial Pallet', rechazos: 3, pct: '12%', impacto: '$4.8M', motivo: 'Factor estiba > 2.5 m³ no visado' },
                    ].map((cond, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-white/5 hover:border-purple-200 dark:hover:border-purple-800/60 transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                            {cond.condicion}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 shrink-0">
                            {cond.rechazos} rechazos ({cond.pct})
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-gray-500">
                          <span className="truncate">{cond.motivo}</span>
                          <span className="font-bold text-purple-900 dark:text-purple-300 shrink-0">{cond.impacto}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ========================================================================= */}
              {/* TABLA CONSOLIDADA DE PROFORMAS AUDITADAS POR PRICING                      */}
              {/* ========================================================================= */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span>Registro de proformas evaluadas por Pricing</span>
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Listado general con estado de supervisión tarifaria, motivos y tiempos de resolución
                    </p>
                  </div>
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                    Mostrando {proformasTarifarias.length} proformas
                  </span>
                </div>

                <div className="w-full overflow-hidden border border-purple-100 dark:border-white/10 rounded-xl shadow-2xs">
                  <table className="w-full table-fixed text-left text-xs">
                    <colgroup>
                      <col className="w-[11%]" />
                      <col className="w-[20%]" />
                      <col className="w-[14%]" />
                      <col className="w-[12%]" />
                      <col className="w-[7%]" />
                      <col className="w-[12%]" />
                      <col className="w-[16%]" />
                      <col className="w-[8%]" />
                    </colgroup>
                    <thead>
                      <tr className="bg-purple-50/70 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-[10px] border-b border-purple-100 dark:border-white/10">
                        <th className="py-2.5 px-3 truncate">Proforma</th>
                        <th className="py-2.5 px-2 truncate">Cliente / Razón social</th>
                        <th className="py-2.5 px-2 truncate">KAM</th>
                        <th className="py-2.5 px-2 text-right truncate">Monto</th>
                        <th className="py-2.5 px-1 text-center truncate">Versión</th>
                        <th className="py-2.5 px-1 text-center truncate">Estado</th>
                        <th className="py-2.5 px-2 truncate">Condición / Motivo</th>
                        <th className="py-2.5 px-3 text-right truncate">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-[11px]">
                      {proformasTarifarias.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-gray-500">
                            No se encontraron proformas que coincidan con la búsqueda.
                          </td>
                        </tr>
                      ) : (
                        proformasTarifarias.map((p) => (
                          <tr key={p.id} className="hover:bg-purple-50/40 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-purple-700 dark:text-purple-300 truncate">
                              {p.id}
                            </td>
                            <td className="py-2.5 px-2 truncate">
                              <div className="font-bold text-gray-900 dark:text-white leading-tight truncate">{p.cliente}</div>
                              <span className="text-[9px] text-gray-500 font-mono block truncate">RUT: {p.rut}</span>
                            </td>
                            <td className="py-2.5 px-2 font-medium text-gray-700 dark:text-gray-300 truncate">
                              {p.kamNombre || 'Cristián Peña'}
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono font-bold text-gray-900 dark:text-white truncate">
                              {p.montoFormatted}
                            </td>
                            <td className="py-2.5 px-1 text-center font-mono font-bold text-purple-700 dark:text-purple-300 truncate">
                              {p.versionActual || 'v1'}
                            </td>
                            <td className="py-2.5 px-1 text-center truncate">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold truncate ${
                                p.estado.includes('Rechazada') || p.estado.includes('Derivada')
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                  : p.estado.includes('Aprobada') || p.estado === 'Facturado'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}>
                                {p.estado}
                              </span>
                            </td>
                            <td className="py-2.5 px-2 truncate">
                              <span
                                className="text-gray-600 dark:text-gray-300 text-[11px] truncate block"
                                title={p.motivoRechazoPrincipal || p.observacionesPricing || 'Revisión técnica de tarifas conforme'}
                              >
                                {p.motivoRechazoPrincipal || p.observacionesPricing || 'Tarifario conforme'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right truncate">
                              <button
                                onClick={() => setSelectedProformaDiff(p)}
                                className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-300 text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                                title="Ver comparación de versiones y detalle"
                              >
                                Ver
                              </button>
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
          {/* SUBTAB: KPIS POR CLIENTE (11 INDICADORES CLAVE DE COMPORTAMIENTO)         */}
          {/* ========================================================================= */}
          {dashboardSubtab === 'clientes' && (
            <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-5 animate-in fade-in duration-150">
              {/* Encabezado y Filtros (Siempre alineados horizontalmente) */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Indicadores de Comportamiento Tarifario por Cliente (11 KPIs)</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Monitoreo consolidado de cartera: volumen, rechazos, excepciones, reprocesos, tarifas aplicadas y variación vs tarifa configurada
                  </p>
                </div>

                {/* Contenedor Horizontal Fijo: Buscador Multi-campo + KAM */}
                <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar en clientes..."
                      value={clientSearchTerm}
                      onChange={(e) => setClientSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500 shadow-2xs"
                    />
                    {clientSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setClientSearchTerm('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Borrar búsqueda"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <select
                    value={filters.kam}
                    onChange={(e) => setFilters((prev) => ({ ...prev, kam: e.target.value }))}
                    className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl text-gray-500 dark:text-gray-400 font-normal outline-none cursor-pointer shadow-2xs whitespace-nowrap shrink-0 min-w-[140px]"
                  >
                    <option value="todos">Todos los KAMs</option>
                    {MOCK_KAMS.map((k) => (
                      <option key={k.id} value={k.nombre}>
                        KAM: {k.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resumen Superior de Métricas Consolidadas Dinámicas */}
              {(() => {
                const totalCuentas = clientesFiltrados.length;
                const totalProformas = clientesFiltrados.reduce((acc, c) => acc + (c.kpis?.proformasTotales || 0), 0) || 1;
                const totalRechazos = clientesFiltrados.reduce((acc, c) => acc + (c.kpis?.proformasRechazadas || 0), 0);
                const tasaRechazoCalc = totalCuentas > 0 ? ((totalRechazos / totalProformas) * 100).toFixed(1) : '0.0';
                const totalExcepciones = clientesFiltrados.reduce((acc, c) => acc + (c.kpis?.cantidadExcepciones || 0), 0);
                const totalVariacion = clientesFiltrados.reduce((acc, c) => acc + (c.kpis?.variacionTarifaPct || 0), 0);
                const promVariacion = totalCuentas > 0 ? (totalVariacion / totalCuentas).toFixed(1) : '0.0';

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                        Cuentas filtradas
                      </span>
                      <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                        {totalCuentas} <span className="text-xs font-semibold text-gray-500">clientes</span>
                      </div>
                      <span className="text-[10px] text-purple-700 dark:text-purple-400 font-medium">
                        100% integradas con Pricing
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                        Tasa rechazo cartera
                      </span>
                      <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {tasaRechazoCalc}%
                      </div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                        {filters.kam === 'todos' ? 'Consolidado cartera' : `Cartera ${filters.kam}`}
                      </span>
                    </div>

                    <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                        Excepciones activas
                      </span>
                      <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">
                        {totalExcepciones} <span className="text-xs font-semibold text-gray-500">casos</span>
                      </div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                        Registradas en Pricing
                      </span>
                    </div>

                    <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                        Variación promedio
                      </span>
                      <div className="text-xl font-black text-indigo-700 dark:text-indigo-400 mt-0.5">
                        {Number(promVariacion) > 0 ? `+${promVariacion}%` : `${promVariacion}%`}
                      </div>
                      <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">
                        Respecto a tarifa configurada
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Tabla Consolidada de 11 KPIs por Cliente (Sin scroll horizontal y con títulos en minúsculas) */}
              <div className="w-full overflow-hidden border border-purple-100 dark:border-white/10 rounded-xl shadow-2xs">
                <table className="w-full table-fixed text-left text-xs">
                  <colgroup>
                    <col className="w-[15%]" />
                    <col className="w-[10%]" />
                    <col className="w-[6%]" />
                    <col className="w-[6%]" />
                    <col className="w-[7%]" />
                    <col className="w-[6%]" />
                    <col className="w-[6%]" />
                    <col className="w-[6%]" />
                    <col className="w-[6%]" />
                    <col className="w-[8%]" />
                    <col className="w-[6%]" />
                    <col className="w-[6%]" />
                    <col className="w-[6%]" />
                    <col className="w-[6%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-purple-50/70 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-[10px] border-b border-purple-100 dark:border-white/10">
                      <th className="py-2.5 px-2.5 truncate">Cliente & rut</th>
                      <th className="py-2.5 px-1 truncate">KAM</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Cantidad de proformas emitidas">Proformas</th>
                      <th className="py-2.5 px-1 text-center truncate text-rose-700 dark:text-rose-400" title="Cantidad de proformas rechazadas por causa tarifaria">Rechazos</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Tasa de rechazo por tarifa (%)">Tasa rechazo</th>
                      <th className="py-2.5 px-1 text-center truncate text-amber-700 dark:text-amber-400" title="Cantidad de excepciones tarifarias solicitadas">Excepciones</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Cantidad de reprocesos">Reprocesos</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Cantidad promedio de versiones">Versiones</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Tiempo promedio de resolución (días)">T. resolución</th>
                      <th className="py-2.5 px-1 text-right truncate" title="Tarifa promedio aplicada ($)">Tarifa prom.</th>
                      <th className="py-2.5 px-1 text-center truncate font-bold text-purple-700 dark:text-purple-300" title="Descuentos aplicados (%)">Descuento</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Variación respecto de tarifa configurada (+/- %)">Var. tarifa</th>
                      <th className="py-2.5 px-1 text-center truncate text-indigo-700 dark:text-indigo-400" title="Cantidad de solicitudes a Pricing">Solicitudes</th>
                      <th className="py-2.5 px-2 text-right truncate">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-[11px]">
                    {clientesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="py-8 text-center text-gray-500">
                          No se encontraron clientes que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      clientesFiltrados.map((cli) => {
                        const proformasTotales = cli.kpis.proformasTotales;
                        const rechazosTarifa = cli.kpis.proformasRechazadas;
                        const tasaRechazo = cli.kpis.tasaRechazoTarifa ?? (proformasTotales > 0 ? Number(((rechazosTarifa / proformasTotales) * 100).toFixed(1)) : 0);
                        const excepcionesCount = cli.kpis.cantidadExcepciones ?? (cli.excepcionesActivasCount || (rechazosTarifa > 0 ? rechazosTarifa : 0));
                        const reprocesos = cli.kpis.cantidadReprocesos;
                        const promVersiones = cli.kpis.promedioVersiones > 0 ? `${cli.kpis.promedioVersiones} v` : '1.0 v';
                        const tiempoResolucion = cli.kpis.tiempoPromedioAprobacionDias > 0 ? `${cli.kpis.tiempoPromedioAprobacionDias} d` : '-';
                        
                        const tarifaProm = cli.kpis.tarifaPromedioAplicada ?? (
                          cli.id === 'cli-1' ? 12800 :
                          cli.id === 'cli-2' ? 45200 :
                          cli.id === 'cli-3' ? 28500 :
                          cli.id === 'cli-4' ? 14200 :
                          cli.id === 'cli-5' ? 8900 :
                          cli.id === 'cli-6' ? 32000 :
                          cli.id === 'cli-7' ? 18400 :
                          cli.id === 'cli-8' ? 11500 :
                          cli.id === 'cli-10' ? 22000 : 0
                        );

                        const descuentoAplicado = cli.kpis.descuentoPromedioPct ?? (
                          cli.id === 'cli-1' ? 10.0 :
                          cli.id === 'cli-2' ? 14.0 :
                          cli.id === 'cli-3' ? 12.0 :
                          cli.id === 'cli-4' ? 8.0 :
                          cli.id === 'cli-5' ? 15.0 :
                          cli.id === 'cli-6' ? 9.0 :
                          cli.id === 'cli-7' ? 7.0 :
                          cli.id === 'cli-8' ? 5.0 :
                          cli.id === 'cli-11' ? 11.0 : 0.0
                        );

                        const variacionConfig = cli.kpis.variacionTarifaPct ?? (
                          cli.id === 'cli-1' ? 4.6 :
                          cli.id === 'cli-2' ? -2.1 :
                          cli.id === 'cli-3' ? 6.4 :
                          cli.id === 'cli-4' ? 12.5 :
                          cli.id === 'cli-5' ? -1.2 :
                          cli.id === 'cli-6' ? 0.0 :
                          cli.id === 'cli-7' ? 3.2 :
                          cli.id === 'cli-8' ? 1.5 : 0.0
                        );

                        const solicitudesPricing = cli.kpis.solicitudesPricingCount ?? (
                          cli.id === 'cli-1' ? 4 :
                          cli.id === 'cli-2' ? 2 :
                          cli.id === 'cli-3' ? 5 :
                          cli.id === 'cli-4' ? 7 :
                          cli.id === 'cli-5' ? 3 :
                          cli.id === 'cli-6' ? 1 :
                          cli.id === 'cli-7' ? 2 :
                          cli.id === 'cli-8' ? 2 :
                          cli.id === 'cli-10' ? 1 : 0
                        );

                        return (
                          <tr key={cli.id} className="hover:bg-purple-50/40 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-2.5 px-2.5 truncate">
                              <div className="font-bold text-gray-900 dark:text-white truncate leading-tight">
                                {cli.razonSocial}
                              </div>
                              <span className="text-[9px] text-gray-500 font-mono block truncate">
                                RUT: {cli.rut}
                              </span>
                            </td>

                            <td className="py-2.5 px-1 truncate font-medium text-gray-700 dark:text-gray-300">
                              {cli.kamNombre || 'Cristián Peña'}
                            </td>

                            <td className="py-2.5 px-1 text-center font-bold text-gray-900 dark:text-white truncate">
                              {proformasTotales}
                            </td>

                            <td className="py-2.5 px-1 text-center font-bold text-rose-600 dark:text-rose-400 truncate">
                              {rechazosTarifa}
                            </td>

                            <td className="py-2.5 px-1 text-center truncate">
                              <span
                                className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold truncate ${
                                  tasaRechazo > 20
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                    : tasaRechazo > 10
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                }`}
                              >
                                {tasaRechazo}%
                              </span>
                            </td>

                            <td className="py-2.5 px-1 text-center font-bold text-amber-700 dark:text-amber-300 truncate">
                              {excepcionesCount}
                            </td>

                            <td className="py-2.5 px-1 text-center font-semibold text-gray-800 dark:text-gray-200 truncate">
                              {reprocesos}
                            </td>

                            <td className="py-2.5 px-1 text-center font-mono font-bold text-purple-700 dark:text-purple-300 truncate">
                              {promVersiones}
                            </td>

                            <td className="py-2.5 px-1 text-center text-gray-600 dark:text-gray-400 truncate">
                              {tiempoResolucion}
                            </td>

                            <td className="py-2.5 px-1 text-right font-mono font-bold text-gray-900 dark:text-white truncate">
                              {tarifaProm > 0 ? formatCurrency(tarifaProm) : '-'}
                            </td>

                            <td className="py-2.5 px-1 text-center font-bold text-purple-700 dark:text-purple-300 truncate">
                              {descuentoAplicado > 0 ? `${descuentoAplicado}%` : '0%'}
                            </td>

                            <td className="py-2.5 px-1 text-center font-mono font-bold truncate">
                              <span
                                className={`text-[10px] ${
                                  variacionConfig > 5
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : variacionConfig < 0
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-gray-600 dark:text-gray-300'
                                }`}
                              >
                                {variacionConfig > 0 ? `+${variacionConfig}%` : `${variacionConfig}%`}
                              </span>
                            </td>

                            <td className="py-2.5 px-1 text-center truncate">
                              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 truncate">
                                {solicitudesPricing}
                              </span>
                            </td>

                            <td className="py-2.5 px-2 text-right truncate">
                              <button
                                onClick={() => {
                                  setSelectedClientDetail(cli);
                                  router.push('/?tab=clientes');
                                }}
                                className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-300 text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                                title="Ver ficha técnica, tarifas y acuerdos de este cliente"
                              >
                                Ver
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

          {/* ========================================================================= */}
          {/* SUBTAB: KPIS POR KAM (11 INDICADORES CLAVE DE COMPORTAMIENTO)            */}
          {/* ========================================================================= */}
          {dashboardSubtab === 'kams' && (
            <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-5 animate-in fade-in duration-150">
              {/* Encabezado y Filtros (Siempre alineados horizontalmente) */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-purple-600 shrink-0" />
                    <span>Indicadores de Comportamiento Tarifario por KAM (11 KPIs)</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Monitoreo consolidado de cartera: volumen, rechazos, excepciones, reprocesos, tarifas aplicadas y variación vs tarifa estándar
                  </p>
                </div>

                {/* Contenedor Horizontal Fijo: Buscador + Filtro siempre en la misma fila */}
                <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Filtrar por KAM, email o cliente..."
                      value={kamSearchTerm}
                      onChange={(e) => setKamSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500 shadow-2xs"
                    />
                    {kamSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setKamSearchTerm('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Borrar búsqueda"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <select
                    value={kamTasaFilter}
                    onChange={(e) => setKamTasaFilter(e.target.value as 'todos' | 'alta' | 'baja')}
                    className="px-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl text-gray-500 dark:text-gray-400 font-normal outline-none cursor-pointer shadow-2xs whitespace-nowrap shrink-0 min-w-[140px]"
                  >
                    <option value="todos">Todos los KAMs</option>
                    <option value="alta">⚠️ Tasa Alta (&gt; 10%)</option>
                    <option value="baja">✓ Tasa Controlada (≤ 10%)</option>
                  </select>
                </div>
              </div>

              {/* Resumen Superior de Métricas Consolidadas Dinámicas (4 Cards idénticas al diseño de clientes) */}
              {(() => {
                const totalKamsCount = kamsFiltrados.length;
                const totalCarteraCount = kamsFiltrados.reduce((acc, k) => acc + k.carteraClientesCount, 0);
                const totalProformasCount = kamsFiltrados.reduce((acc, k) => acc + k.proformasTotales, 0) || 1;
                const totalRechazosCount = kamsFiltrados.reduce((acc, k) => acc + k.proformasRechazadasTarifa, 0);
                const tasaRechazoCalc = totalKamsCount > 0 ? ((totalRechazosCount / totalProformasCount) * 100).toFixed(1) : '0.0';
                const totalExcepcionesCount = kamsFiltrados.reduce((acc, k) => acc + k.excepcionesSolicitadas, 0);
                const totalVariacionCount = kamsFiltrados.reduce((acc, k) => acc + k.variacionPromedioTarifaPct, 0);
                const promVariacion = totalKamsCount > 0 ? (totalVariacionCount / totalKamsCount).toFixed(1) : '0.0';

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/40 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                        Cuentas filtradas
                      </span>
                      <div className="text-xl font-black text-gray-900 dark:text-white mt-0.5">
                        {totalCarteraCount} <span className="text-xs font-semibold text-gray-500">clientes</span>
                      </div>
                      <span className="text-[10px] text-purple-700 dark:text-purple-400 font-medium">
                        {totalKamsCount} {totalKamsCount === 1 ? 'gestor KAM' : 'gestores KAM'}
                      </span>
                    </div>

                    <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/40 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 block">
                        Tasa rechazo cartera
                      </span>
                      <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {tasaRechazoCalc}%
                      </div>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                        Consolidado cartera
                      </span>
                    </div>

                    <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                        Excepciones activas
                      </span>
                      <div className="text-xl font-black text-amber-700 dark:text-amber-400 mt-0.5">
                        {totalExcepcionesCount} <span className="text-xs font-semibold text-gray-500">casos</span>
                      </div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                        Registradas en Pricing
                      </span>
                    </div>

                    <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                        Variación promedio
                      </span>
                      <div className="text-xl font-black text-indigo-700 dark:text-indigo-400 mt-0.5">
                        {Number(promVariacion) > 0 ? `+${promVariacion}%` : `${promVariacion}%`}
                      </div>
                      <span className="text-[10px] text-indigo-700 dark:text-indigo-400 font-medium">
                        Respecto a tarifa configurada
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Tabla Consolidada de 11 KPIs por KAM (Ajustada 100% al ancho sin scroll horizontal) */}
              <div className="w-full overflow-hidden border border-purple-100 dark:border-white/10 rounded-xl shadow-2xs">
                <table className="w-full table-fixed text-left text-xs">
                  <colgroup>
                    <col className="w-[14%]" />
                    <col className="w-[7%]" />
                    <col className="w-[7%]" />
                    <col className="w-[6%]" />
                    <col className="w-[8%]" />
                    <col className="w-[7%]" />
                    <col className="w-[7%]" />
                    <col className="w-[7%]" />
                    <col className="w-[7%]" />
                    <col className="w-[12%]" />
                    <col className="w-[6%]" />
                    <col className="w-[6%]" />
                    <col className="w-[10%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-purple-50/70 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-[10px] border-b border-purple-100 dark:border-white/10">
                      <th className="py-2.5 px-2.5 truncate">KAM / Gestor</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Clientes gestionados">Cartera</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Proformas asociadas">Proformas</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Proformas rechazadas por tarifa">Rechazos</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Tasa de rechazo tarifario">Tasa rechazo</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Cantidad de excepciones solicitadas">Excepciones</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Excepciones aprobadas vs rechazadas">Aprob / rech</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Cantidad de reprocesos">Reprocesos</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Tiempo promedio de resolución">T. resolución</th>
                      <th className="py-2.5 px-2 truncate" title="Cliente con mayor cantidad de incidencias tarifarias">Mayor incidencia</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Descuentos promedio asociados a su cartera">Descuento</th>
                      <th className="py-2.5 px-1 text-center truncate" title="Variación promedio respecto de tarifa estándar">Var. estándar</th>
                      <th className="py-2.5 px-2 text-right truncate">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-[11px]">
                    {kamsFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="py-8 text-center text-gray-500">
                          No se encontraron KAMs que coincidan con la búsqueda o filtro aplicado.
                        </td>
                      </tr>
                    ) : (
                      kamsFiltrados.map((kam) => (
                        <tr key={kam.id} className="hover:bg-purple-50/40 dark:hover:bg-slate-800/50 transition-colors">
                          {/* KAM */}
                          <td className="py-2.5 px-2.5 truncate">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold flex items-center justify-center text-[9px] shadow-xs shrink-0">
                                {kam.avatar}
                              </div>
                              <div className="min-w-0 truncate">
                                <span className="font-bold text-gray-900 dark:text-white block truncate text-[11px]">
                                  {kam.nombre}
                                </span>
                                <span className="text-[9px] text-gray-500 truncate block">{kam.email}</span>
                              </div>
                            </div>
                          </td>

                          {/* 1. Clientes gestionados */}
                          <td className="py-2.5 px-1 text-center font-semibold text-gray-700 dark:text-gray-300 truncate">
                            <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-[10px] font-bold">
                              {kam.carteraClientesCount} cli
                            </span>
                          </td>

                          {/* 2. Proformas asociadas */}
                          <td className="py-2.5 px-1 text-center font-bold text-gray-900 dark:text-white truncate">
                            {kam.proformasTotales}
                          </td>

                          {/* 3. Proformas rechazadas por tarifa */}
                          <td className="py-2.5 px-1 text-center font-bold text-rose-600 dark:text-rose-400 truncate">
                            {kam.proformasRechazadasTarifa}
                          </td>

                          {/* 4. Tasa de rechazo tarifario */}
                          <td className="py-2.5 px-1 text-center truncate">
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black inline-block ${
                                kam.tasaRechazoTarifario > 15
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : kam.tasaRechazoTarifario > 10
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}
                            >
                              {kam.tasaRechazoTarifario}%
                            </span>
                          </td>

                          {/* 5. Cantidad de excepciones solicitadas */}
                          <td className="py-2.5 px-1 text-center font-bold text-gray-800 dark:text-gray-200 truncate">
                            {kam.excepcionesSolicitadas}
                          </td>

                          {/* 6. Cantidad de excepciones aprobadas/rechazadas */}
                          <td className="py-2.5 px-1 text-center truncate">
                            <span className="inline-flex items-center gap-0.5 font-semibold text-[10px]">
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{kam.excepcionesAprobadas}✓</span>
                              <span className="text-gray-400">/</span>
                              <span className="text-rose-600 dark:text-rose-400 font-bold">{kam.excepcionesRechazadas}✗</span>
                            </span>
                          </td>

                          {/* 7. Cantidad de reprocesos */}
                          <td className="py-2.5 px-1 text-center truncate">
                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
                              {kam.cantidadReprocesos}
                            </span>
                          </td>

                          {/* 8. Tiempo promedio de resolución */}
                          <td className="py-2.5 px-1 text-center text-gray-700 dark:text-gray-300 font-medium truncate text-[10px]">
                            {kam.tiempoPromedioResolucionDias} d
                          </td>

                          {/* 9. Clientes con mayor cantidad de incidencias tarifarias (solo el primero con más incidencias) */}
                          <td className="py-2.5 px-2 truncate">
                            <span
                              className="inline-block px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 text-rose-800 dark:text-rose-300 text-[10px] font-bold truncate max-w-full align-middle"
                              title={kam.clientesMayorIncidencia[0]}
                            >
                              {kam.clientesMayorIncidencia[0]}
                            </span>
                          </td>

                          {/* 10. Descuentos promedio asociados a su cartera */}
                          <td className="py-2.5 px-1 text-center font-bold text-purple-700 dark:text-purple-300 truncate">
                            {kam.descuentoPromedioCarteraPct}%
                          </td>

                          {/* 11. Variación promedio respecto de tarifa estándar */}
                          <td className="py-2.5 px-1 text-center truncate">
                            <span
                              className={`text-[10px] font-bold ${
                                kam.variacionPromedioTarifaPct > 6
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : kam.variacionPromedioTarifaPct > 3
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-emerald-600 dark:text-emerald-400'
                              }`}
                            >
                              +{kam.variacionPromedioTarifaPct}%
                            </span>
                          </td>

                          {/* Acciones (Todos los botones en morado, sin scroll) */}
                          <td className="py-2.5 px-2 text-right truncate">
                            <div className="inline-flex items-center gap-1 justify-end">
                              <button
                                onClick={() => setSelectedKamModal(kam)}
                                className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-300 text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                                title="Ver análisis 360° del KAM e incidencias"
                              >
                                Ver
                              </button>
                              <button
                                onClick={() => {
                                  setNuevoMensajeKam(kam.nombre);
                                  setNuevoMensajeCliente(kam.clientesMayorIncidencia[0] || 'Cliente Corporativo');
                                  setNuevoMensajeAsunto(`Revisión de comportamiento tarifario cartera - ${kam.nombre}`);
                                  setNuevoMensajeOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                                title="Registrar requerimiento u observación comercial con este KAM"
                              >
                                Gestionar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBTAB: AUDITORÍA PRICING */}
          {dashboardSubtab === 'auditoria' && (
            <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-purple-600" />
                    <span>Auditoría Inmutable de Decisiones Tarifarias de Pricing</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Registro inmutable de usuario, fecha/hora, cliente, KAM, proforma, versión, acción y estado
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 flex-nowrap">
                  <div className="relative w-48 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar en bitácora..."
                      value={auditSearchTerm}
                      onChange={(e) => setAuditSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500 shadow-2xs"
                    />
                    {auditSearchTerm && (
                      <button
                        type="button"
                        onClick={() => setAuditSearchTerm('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Borrar búsqueda"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      showToast(
                        'Bitácora Exportada',
                        'El reporte de auditoría de pricing fue descargado en formato CSV.',
                        'success'
                      );
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 text-purple-900 dark:text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-600" />
                    <span>Exportar</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-purple-100 dark:border-white/10 rounded-xl shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-purple-50/70 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-[10px] border-b border-purple-100 dark:border-white/10">
                      <th className="py-2.5 px-3">Fecha & hora</th>
                      <th className="py-2.5 px-3">Usuario</th>
                      <th className="py-2.5 px-3">Acción</th>
                      <th className="py-2.5 px-3">Recurso / PF</th>
                      <th className="py-2.5 px-3">Cliente & KAM</th>
                      <th className="py-2.5 px-3">Estado anterior / nuevo</th>
                      <th className="py-2.5 px-3">Motivo / observaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {auditLogs.filter((log) => matchAnyData(log, auditSearchTerm)).length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          No se encontraron registros de auditoría que coincidan con la búsqueda.
                        </td>
                      </tr>
                    ) : (
                      auditLogs
                        .filter((log) => matchAnyData(log, auditSearchTerm))
                        .map((log) => {
                          const { fecha, hora } = splitFechaHora(log.fechaHora || log.ts);
                          return (
                            <tr key={log.id} className="hover:bg-purple-50/40 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-3 text-[11px] whitespace-nowrap">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-gray-800 dark:text-gray-200 block leading-tight font-mono text-[11px]">
                                    {fecha}
                                  </span>
                                  {hora && (
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block leading-tight font-mono">
                                      {hora}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold text-gray-900 dark:text-white block">
                                  {log.usuario}
                                </span>
                                <span className="text-[10px] text-purple-600 font-bold">{log.rol}</span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                                  {log.accion}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-purple-900 dark:text-purple-300">
                                {log.recurso}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold text-gray-900 dark:text-white block">
                                  {log.cliente || log.objetoAfectado}
                                </span>
                                <span className="text-[10px] text-gray-500">KAM: {log.kam || 'Cristián Peña'}</span>
                              </td>
                              <td className="py-3 px-3 text-[11px]">
                                {log.estadoAnterior ? (
                                  <div className="space-y-0.5 min-w-0">
                                    <span className="text-gray-400 dark:text-gray-500 line-through text-[10px] block leading-tight truncate" title={`Anterior: ${log.estadoAnterior}`}>
                                      {log.estadoAnterior}
                                    </span>
                                    <span className="font-bold text-purple-700 dark:text-purple-300 text-xs block leading-tight truncate" title={`Nuevo: ${log.estadoNuevo}`}>
                                      {log.estadoNuevo}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-gray-700 dark:text-gray-300 font-semibold text-xs">{log.estadoNuevo || '-'}</span>
                                )}
                              </td>
                              <td className="py-3 px-3 text-gray-600 dark:text-gray-400 max-w-[340px]">
                                <p className="line-clamp-3 leading-snug text-xs break-words" title={log.motivoObservaciones}>
                                  {log.motivoObservaciones || '-'}
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
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 2: RECHAZOS POR TARIFA (/?tab=rechazos)                           */}
      {/* ========================================================================= */}
      {currentSection === 'rechazos' && (() => {
        const baseRechazosList = proformas.filter(
          (p) =>
            p.estado.includes('Rechazada') ||
            p.estado.includes('Derivada') ||
            p.motivoRechazoPrincipal ||
            p.motivoRechazoPricing ||
            p.estado.includes('Tarifas Corregidas') ||
            excepciones.some((e) => e.proformaCodigo === p.id || e.proformaId === p.id)
        );

        const rechazosPendientesCount = baseRechazosList.filter(
          (p) => p.estado.includes('Rechazada') || Boolean(p.motivoRechazoPricing)
        ).length;
        const rechazosDerivadasCount = baseRechazosList.filter((p) => p.estado.includes('Derivada')).length;
        const rechazosCorregidasCount = baseRechazosList.filter(
          (p) => p.estado.includes('Tarifas Corregidas') || p.estadoSupervision === 'Pricing_Resuelto'
        ).length;
        const rechazosValidacionCount = baseRechazosList.filter(
          (p) => (p.estado.includes('Pendiente') && !p.estado.includes('Rechazada')) || p.estado === 'Pendiente'
        ).length;
        const rechazosExcepcionesCount = baseRechazosList.filter((p) =>
          excepciones.some((e) => e.proformaCodigo === p.id || e.proformaId === p.id)
        ).length;

        const filteredRechazos = baseRechazosList
          .filter((p) => {
            if (rechazosStatusTab === 'pendientes') {
              return p.estado.includes('Rechazada') || Boolean(p.motivoRechazoPricing);
            }
            if (rechazosStatusTab === 'derivadas') {
              return p.estado.includes('Derivada');
            }
            if (rechazosStatusTab === 'corregidas') {
              return p.estado.includes('Tarifas Corregidas') || p.estadoSupervision === 'Pricing_Resuelto';
            }
            if (rechazosStatusTab === 'validacion') {
              return p.estado.includes('Pendiente') && !p.estado.includes('Rechazada');
            }
            if (rechazosStatusTab === 'excepciones') {
              return excepciones.some((e) => e.proformaCodigo === p.id || e.proformaId === p.id);
            }
            return true;
          })
          .filter((p) => matchAnyData(p, rechazosSearchTerm));

        return (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Header de la sección con buscador */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertOctagon className="w-7 h-7 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100">
                    Rechazos por tarifa y reglas de pricing
                  </h1>
                  <p className="text-caption text-gray-600 dark:text-gray-400 mt-0.5">
                    Bandeja de proformas con discrepancias tarifarias, variaciones de cubicaje y revisión de acuerdos comerciales
                  </p>
                </div>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en rechazos..."
                  value={rechazosSearchTerm}
                  onChange={(e) => setRechazosSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500 shadow-xs"
                />
                {rechazosSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setRechazosSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Borrar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Pestañas de estado rápido con alineación simétrica y centrada */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setRechazosStatusTab('todos')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center text-center ${
                  rechazosStatusTab === 'todos'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-purple-100 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>Todos ({baseRechazosList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setRechazosStatusTab('pendientes')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 text-center ${
                  rechazosStatusTab === 'pendientes'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-900/40'
                }`}
              >
                <AlertOctagon className={`w-3.5 h-3.5 ${rechazosStatusTab === 'pendientes' ? 'text-white' : 'text-purple-600 dark:text-purple-400'}`} />
                <span>Pendientes pricing ({rechazosPendientesCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRechazosStatusTab('derivadas')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 text-center ${
                  rechazosStatusTab === 'derivadas'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                }`}
              >
                <span>Derivadas a KAM ({rechazosDerivadasCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRechazosStatusTab('corregidas')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 text-center ${
                  rechazosStatusTab === 'corregidas'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                }`}
              >
                <span>Resueltas o corregidas ({rechazosCorregidasCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRechazosStatusTab('validacion')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 text-center ${
                  rechazosStatusTab === 'validacion'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
                }`}
              >
                <span>En validación ({rechazosValidacionCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setRechazosStatusTab('excepciones')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 text-center ${
                  rechazosStatusTab === 'excepciones'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40 hover:bg-purple-100 dark:hover:bg-purple-900/40'
                }`}
              >
                <span>Excepciones ({rechazosExcepcionesCount})</span>
              </button>
            </div>

            {/* Tabla de Rechazos por Tarifa sin scroll horizontal, con anchos balanceados */}
            <div className="w-full bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl shadow-xs overflow-hidden">
              <table className="w-full table-fixed text-left text-xs">
                <colgroup>
                  <col className="w-[13%]" />
                  <col className="w-[18%]" />
                  <col className="w-[11%]" />
                  <col className="w-[11%]" />
                  <col className="w-[13%]" />
                  <col className="w-[7%]" />
                  <col className="w-[13%]" />
                  <col className="w-[14%]" />
                </colgroup>
                <thead>
                  <tr className="bg-purple-50/70 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-[10px] border-b border-purple-100 dark:border-white/10">
                    <th className="py-2.5 px-3 truncate">Proforma</th>
                    <th className="py-2.5 px-3 truncate">Cliente y RUT</th>
                    <th className="py-2.5 px-2 truncate">KAM</th>
                    <th className="py-2.5 px-2 truncate">Ejecutivo</th>
                    <th className="py-2.5 px-3 truncate">Tarifa aplicada vs esperada</th>
                    <th className="py-2.5 px-2 text-center truncate">Descuento</th>
                    <th className="py-2.5 px-2 text-center truncate">Estado</th>
                    <th className="py-2.5 pr-4 pl-2 text-right truncate">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredRechazos.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-500">
                        <AlertOctagon className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                          No se encontraron proformas con los filtros seleccionados
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Prueba cambiando de pestaña o limpiando el término de búsqueda
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredRechazos.map((pf) => {
                      const tarifaBase = pf.historialVersiones?.[0]?.items?.[1]?.tarifaBase || 15000;
                      const tarifaV2 = pf.historialVersiones?.[1]?.items?.[1]?.tarifaBase || 12800;
                      const diffPct = ((tarifaV2 - tarifaBase) / tarifaBase) * 100;
                      const fechaInfo = splitFechaHora(pf.fecha);
                      const isPendingRejection =
                        pf.estado.includes('Rechazada') || Boolean(pf.motivoRechazoPricing);

                      const excAsociada = excepciones.find(
                        (e) => e.proformaCodigo === pf.id || e.proformaId === pf.id
                      );

                      return (
                        <tr
                          key={pf.id}
                          className={`transition-colors ${
                            isPendingRejection
                              ? 'bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/40 dark:hover:bg-rose-950/30 border-l-4 border-l-rose-500'
                              : 'hover:bg-purple-50/30 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          {/* Proforma */}
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                              <span className="truncate">{pf.id}</span>
                              {pf.versionActual && (
                                <span className="px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                                  {pf.versionActual}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 block leading-tight">
                              <span>{fechaInfo.fecha}</span>
                              {fechaInfo.hora && (
                                <span className="block text-[9px] text-gray-400">{fechaInfo.hora}</span>
                              )}
                            </span>
                          </td>

                          {/* Cliente y RUT */}
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-gray-900 dark:text-white block truncate text-xs" title={pf.cliente}>
                              {pf.cliente}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono block">RUT: {pf.rut}</span>
                          </td>

                          {/* KAM */}
                          <td className="py-2.5 px-2 font-semibold text-gray-800 dark:text-gray-200 truncate text-xs">
                            {pf.kamNombre || 'Cristián Peña'}
                          </td>

                          {/* Ejecutivo */}
                          <td className="py-2.5 px-2 text-gray-600 dark:text-gray-400 truncate text-xs">
                            {pf.ejecutivoNombre || 'Ana Valenzuela'}
                          </td>

                          {/* Tarifa aplicada vs esperada */}
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="line-through text-gray-400 text-[10px]">
                                {formatCurrency(tarifaBase)}
                              </span>
                              <ArrowRight className="w-2.5 h-2.5 text-purple-600 shrink-0" />
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(tarifaV2)}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-500 block leading-tight">
                              Var: {diffPct < 0 ? `${diffPct.toFixed(1)}%` : '+0%'}
                            </span>
                          </td>

                          {/* Descuento */}
                          <td className="py-2.5 px-2 text-center font-semibold text-purple-700 dark:text-purple-300 text-xs">
                            10%
                          </td>

                          {/* Estado del caso (en 2 líneas claras sin cortes) */}
                          <td className="py-2.5 px-2 text-center">
                            {isPendingRejection ? (
                              <span className="w-full max-w-[130px] mx-auto py-1 px-1.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900 inline-flex flex-col items-center justify-center leading-tight text-center shadow-2xs">
                                <span className="flex items-center justify-center gap-1 font-extrabold text-[10px] whitespace-nowrap">
                                  <AlertOctagon className="w-2.5 h-2.5 text-rose-600 shrink-0" />
                                  Rechazada
                                </span>
                                <span className="text-[9px] font-normal opacity-90 whitespace-nowrap">(Pendiente pricing)</span>
                              </span>
                            ) : pf.estado.includes('Derivada') ? (
                              <span className="w-full max-w-[130px] mx-auto py-1 px-1.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-900 inline-flex flex-col items-center justify-center leading-tight text-center shadow-2xs">
                                <span className="whitespace-nowrap font-extrabold">Derivada</span>
                                <span className="text-[9px] font-normal opacity-90 whitespace-nowrap">(A KAM)</span>
                              </span>
                            ) : pf.estado.includes('Tarifas Corregidas') || pf.estadoSupervision === 'Pricing_Resuelto' ? (
                              <span className="w-full max-w-[130px] mx-auto py-1 px-1.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 inline-flex flex-col items-center justify-center leading-tight text-center shadow-2xs">
                                <span className="whitespace-nowrap font-extrabold">Corregida</span>
                                <span className="text-[9px] font-normal opacity-90 whitespace-nowrap">(Por pricing)</span>
                              </span>
                            ) : (
                              <span className="w-full max-w-[130px] mx-auto py-1 px-1.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 inline-flex flex-col items-center justify-center leading-tight text-center shadow-2xs">
                                <span className="truncate max-w-full font-semibold">{pf.estado}</span>
                              </span>
                            )}
                          </td>

                          {/* Acciones (Evaluar si tiene excepción + Resolver/Gestionar alineados a la derecha) */}
                          <td className="py-2.5 pr-4 pl-2 text-right">
                            <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                              {excAsociada && (
                                <button
                                  onClick={() => {
                                    setSelectedExcepcion(excAsociada);
                                    setExcepcionAnalisis(excAsociada.analisisPricing || '');
                                    setExcepcionObservaciones(excAsociada.observacionesPricing || '');
                                    setExcepcionDecision(
                                      excAsociada.estado === 'Aprobada' || excAsociada.estado === 'Rechazada'
                                        ? (excAsociada.estado as any)
                                        : 'Aprobada'
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                                  title="Evaluar excepción tarifaria"
                                >
                                  Evaluar
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setSelectedProformaResolucion(pf);
                                  setResolucionObservaciones(pf.observacionesPricing || '');
                                }}
                                className={`w-[70px] text-center py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap ${
                                  isPendingRejection
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20'
                                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                                }`}
                                title={isPendingRejection ? 'Resolver caso de rechazo tarifario pendiente' : 'Gestionar proforma'}
                              >
                                {isPendingRejection ? 'Resolver' : 'Gestionar'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* SECCIÓN 3: CLIENTES Y TARIFAS (/?tab=clientes)                            */}
      {/* ========================================================================= */}
      {currentSection === 'clientes' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-7 h-7 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100">
                  Clientes y tarifas
                </h1>
                <p className="text-caption text-gray-600 dark:text-gray-400">
                  Supervisión de acuerdos vigentes, tarifas homologadas por cliente y cadena consolidada KAM - Ejecutivo
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-4 shadow-xs space-y-3 h-fit">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  Cartera de clientes
                </h2>
                <span className="text-[11px] font-bold text-purple-600">
                  {clientesFiltrados.length} cuentas
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en clientes..."
                  value={clientSearchTerm}
                  onChange={(e) => setClientSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500"
                />
                {clientSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setClientSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Borrar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {(showAllClients ? clientesFiltrados : clientesFiltrados.slice(0, 10)).map((cli) => {
                  const isSelected = selectedClientDetail?.id === cli.id;
                  return (
                    <button
                      key={cli.id}
                      onClick={() => setSelectedClientDetail(cli)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 shadow-xs ring-1 ring-purple-400'
                          : 'bg-white dark:bg-slate-800/40 border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                          {cli.razonSocial}
                        </span>
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950 px-1.5 py-0.2 rounded font-mono">
                          {cli.rut}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>KAM: {cli.kamNombre || 'Cristián Peña'}</span>
                        <span className="font-semibold text-emerald-600">
                          {cli.kpis.tasaAprobacion}% V°B°
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {clientesFiltrados.length > 10 && (
                <div className="pt-2 border-t border-purple-100/70 dark:border-white/10 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllClients(!showAllClients)}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200 hover:underline cursor-pointer inline-flex items-center gap-1 transition-colors"
                  >
                    <span>{showAllClients ? 'Ver menos' : 'Ver más'}</span>
                    {showAllClients ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-6 shadow-xs space-y-6">
              {selectedClientDetail ? (
                <>
                  {/* CARD LIMPIA CON ESTILO ESTÁNDAR PARA LA CADENA CONSOLIDADA */}
                  <div className="p-4 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-800/40 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        Cadena consolidada: Cliente ➔ KAM ➔ Ejecutivo ➔ Tarifas
                      </span>
                      <span className="text-xs font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded-md">
                        ID: {selectedClientDetail.id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                      <span className="px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl border border-purple-100 dark:border-white/10 shadow-2xs">
                        🏢 {selectedClientDetail.razonSocial}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl border border-purple-100 dark:border-white/10 shadow-2xs">
                        💳 Cta: {selectedClientDetail.cuentaCorriente.numero}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="px-2.5 py-1.5 bg-purple-100 text-purple-900 dark:bg-purple-900/70 dark:text-purple-100 rounded-xl font-bold shadow-2xs">
                        👔 KAM: {selectedClientDetail.kamNombre || 'Cristián Peña'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="px-2.5 py-1.5 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 rounded-xl border border-purple-100 dark:border-white/10 shadow-2xs">
                        📋 Ejec: {selectedClientDetail.ejecutivoNombre || 'Ana Valenzuela'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/10">
                      <span className="text-[11px] text-gray-500 block mb-1">Acuerdo vigente</span>
                      <span className="font-bold text-xs text-gray-900 dark:text-white block">
                        {selectedClientDetail.condicionesComerciales.tipo}
                      </span>
                      <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                        {selectedClientDetail.condicionesComerciales.descuentoAcordado}
                      </span>
                    </div>

                    <div className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/10">
                      <span className="text-[11px] text-gray-500 block mb-1">Plazo de pago</span>
                      <span className="font-bold text-xs text-gray-900 dark:text-white block">
                        {selectedClientDetail.condicionesComerciales.plazoPagoDias} días crédito
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Vigencia: {selectedClientDetail.condicionesComerciales.validezHasta}
                      </span>
                    </div>

                    <div className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/10">
                      <span className="text-[11px] text-gray-500 block mb-1">Línea de crédito</span>
                      <span className="font-bold text-xs text-emerald-600 block">
                        {formatCurrency(selectedClientDetail.cuentaCorriente.saldoDisponible)} disp.
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Límite: {formatCurrency(selectedClientDetail.cuentaCorriente.lineaCredito)}
                      </span>
                    </div>
                  </div>

                  {/* Tabla de Tarifas Vigentes */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center justify-between">
                      <span>Tarifas y descuentos homologados con pricing</span>
                      <span className="text-[11px] text-purple-600 font-semibold lowercase">Acuerdo comercial activo</span>
                    </h3>
                    <div className="overflow-x-auto border border-gray-200 dark:border-white/10 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-purple-50/70 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-[10px] border-b border-purple-100 dark:border-white/10">
                            <th className="py-2.5 px-3">Servicio o tramo</th>
                            <th className="py-2.5 px-3">Tarifa base</th>
                            <th className="py-2.5 px-3">Descuento</th>
                            <th className="py-2.5 px-3">Tarifa facturable</th>
                            <th className="py-2.5 px-3">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-gray-800 dark:text-gray-200">
                              Flete Troncal Express RM a Regiones
                            </td>
                            <td className="py-2.5 px-3 text-gray-500">$8.500 / guía</td>
                            <td className="py-2.5 px-3 font-bold text-purple-700 dark:text-purple-300">10%</td>
                            <td className="py-2.5 px-3 font-black text-gray-900 dark:text-white">$7.650</td>
                            <td className="py-2.5 px-3">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 text-[10px] font-bold">
                                Vigente
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-gray-800 dark:text-gray-200">
                              Recargo Volumétrico Sobredimensión
                            </td>
                            <td className="py-2.5 px-3 text-gray-500">$15.000 / m³</td>
                            <td className="py-2.5 px-3 font-bold text-purple-700 dark:text-purple-300">14.6% (Excepción)</td>
                            <td className="py-2.5 px-3 font-black text-gray-900 dark:text-white">$12.800</td>
                            <td className="py-2.5 px-3">
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 text-[10px] font-bold">
                                Excepción aprobada
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Historial de Proformas del Cliente (Supervisión Pricing) */}
                  <div className="space-y-2 pt-2 border-t border-purple-100/70 dark:border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-purple-600" />
                          Historial de proformas del cliente ({proformasDelCliente.length})
                        </h3>
                        <span className="text-[11px] text-gray-500">
                          Registro comercial y versiones emitidas
                        </span>
                      </div>

                      <div className="relative w-full sm:w-56">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Buscar en proformas..."
                          value={clientProformasSearchTerm}
                          onChange={(e) => setClientProformasSearchTerm(e.target.value)}
                          className="w-full pl-7 pr-7 py-1 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500"
                        />
                        {clientProformasSearchTerm && (
                          <button
                            type="button"
                            onClick={() => setClientProformasSearchTerm('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 cursor-pointer"
                            title="Borrar búsqueda"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>

                    {proformasDelCliente.filter((pf) => matchAnyData(pf, clientProformasSearchTerm)).length === 0 ? (
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50 text-center text-xs text-gray-500 border border-gray-100 dark:border-white/5">
                        No se encontraron proformas para {selectedClientDetail.razonSocial} con el filtro aplicado.
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-200 dark:border-white/10 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-purple-50/70 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-[10px] border-b border-purple-100 dark:border-white/10">
                              <th className="py-2.5 px-3">ID proforma</th>
                              <th className="py-2.5 px-3">Servicio o período</th>
                              <th className="py-2.5 px-3 text-right">Monto</th>
                              <th className="py-2.5 px-3 text-center">Versión</th>
                              <th className="py-2.5 px-3 text-center">Estado comercial</th>
                              <th className="py-2.5 px-3 text-right">Acción pricing</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {proformasDelCliente
                              .filter((pf) => matchAnyData(pf, clientProformasSearchTerm))
                              .map((pf) => (
                              <tr key={pf.id} className="hover:bg-purple-50/30 dark:hover:bg-slate-800/40 transition-colors">
                                <td className="py-2.5 px-3 font-mono font-bold text-purple-700 dark:text-purple-300">
                                  {pf.id}
                                </td>
                                <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 font-medium">
                                  {pf.servicio || 'Facturación Especial Mensual'}
                                  <span className="block text-[10px] text-gray-500 font-normal">Emisión: {pf.fecha}</span>
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">
                                  {pf.montoFormatted}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300">
                                    {pf.versionActual || 'v1'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    pf.estado.includes('Aprobada') || pf.estado === 'Facturado'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
                                      : pf.estado.includes('Rechazada') || pf.estado === 'Derivada a KAM'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                                  }`}>
                                    {pf.estado}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                  <button
                                    onClick={() => setSelectedProformaDiff(pf)}
                                    className="px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs"
                                  >
                                    Ver detalle / diff
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Historial de Modificaciones Asociadas a Pricing */}
                  <div className="space-y-2 pt-2 border-t border-purple-100/70 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <History className="w-4 h-4 text-purple-600" />
                        Historial de modificaciones asociadas a pricing
                      </h3>
                      <span className="text-[11px] text-gray-500">
                        Trazabilidad de dictámenes, acuerdos y tarifas
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {listaModificacionesCliente.length === 0 ? (
                        <p className="text-xs text-gray-400 italic py-2">
                          Sin modificaciones tarifarias registradas para este cliente.
                        </p>
                      ) : (
                        (showAllModificaciones
                          ? listaModificacionesCliente
                          : listaModificacionesCliente.slice(0, 3)
                        ).map((mod) => (
                          <div
                            key={mod.id}
                            className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${mod.badgeColor}`}>
                                  {mod.accion}
                                </span>
                                {mod.recurso && (
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    {mod.recurso}
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-500">
                                  {mod.usuario.startsWith('por ') ? mod.usuario : `por ${mod.usuario}`}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                                {mod.detalle}
                              </p>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 shrink-0 self-start sm:self-center">
                              {mod.fecha}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {listaModificacionesCliente.length > 3 && (
                      <div className="pt-2 border-t border-purple-100/70 dark:border-white/10 text-center">
                        <button
                          type="button"
                          onClick={() => setShowAllModificaciones(!showAllModificaciones)}
                          className="text-xs font-bold text-purple-700 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200 hover:underline cursor-pointer inline-flex items-center gap-1 transition-colors"
                        >
                          <span>{showAllModificaciones ? 'Ver menos' : 'Ver más'}</span>
                          {showAllModificaciones ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-12 text-center text-gray-500 text-xs">
                  Selecciona un cliente para ver su información consolidada.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECCIÓN 5: GESTIÓN KAM Y SALESFORCE (/?tab=kam)                           */}
      {/* ========================================================================= */}
      {currentSection === 'kam' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Share2 className="w-7 h-7 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100">
                  Gestión KAM y Salesforce
                </h1>
                <p className="text-caption text-gray-600 dark:text-gray-400 mt-0.5">
                  Trazabilidad de acuerdos tarifarios, sincronización de oportunidades con Salesforce y comunicación formal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSyncSalesforce}
                disabled={isSyncingSalesforce}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSalesforce ? 'animate-spin' : ''}`} />
                <span>Sincronizar Salesforce</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Salesforce CRM sync
                </span>
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Conectado en tiempo real
                </span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Búsqueda en Salesforce..."
                  value={sfSearchTerm}
                  onChange={(e) => setSfSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500 shadow-2xs"
                />
                {sfSearchTerm && (
                  <button
                    type="button"
                    onClick={() => setSfSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Borrar búsqueda"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {salesforceOps
                .filter((op) => matchAnyData(op, sfSearchTerm))
                .map((op) => (
                <div
                  key={op.opportunityId}
                  className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/10 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300">
                      {op.opportunityId}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        op.syncStatus === 'Sincronizado'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {op.syncStatus}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                    {op.accountName}
                  </h4>
                  <p className="text-[11px] text-gray-500 truncate">{op.opportunityName}</p>

                  <div className="pt-2 border-t border-gray-200/60 dark:border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">KAM: <strong>{op.kamName}</strong></span>
                    <button
                      onClick={() => {
                        setNuevoMensajeCliente(op.accountName);
                        setNuevoMensajeKam(op.kamName);
                        setNuevoMensajeAsunto(`Observación tarifaria - ${op.opportunityName}`);
                        setNuevoMensajeCuerpo('');
                        setNuevoMensajeOpen(true);
                      }}
                      className="px-2 py-0.5 rounded-lg bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-800 dark:text-purple-300 font-bold text-[10px] transition-all cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                    >
                      <Send className="w-2.5 h-2.5" />
                      <span>+ Observación</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-white/10 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-600" />
                  <span>Hilo de comunicación formal con KAMs</span>
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Trazabilidad de acuerdos tarifarios vinculada a Salesforce
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Búsqueda en comunicaciones..."
                    value={comsSearchTerm}
                    onChange={(e) => setComsSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-purple-200/80 dark:border-white/10 rounded-xl text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500 shadow-2xs"
                  />
                  {comsSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setComsSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Borrar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    setNuevoMensajeCliente('Retail Logistics Chile S.A.');
                    setNuevoMensajeKam('Cristián Peña');
                    setNuevoMensajeAsunto('');
                    setNuevoMensajeCuerpo('');
                    setNuevoMensajeOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Requerimiento de pricing</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {comunicaciones
                .filter((com) => matchAnyData(com, comsSearchTerm))
                .map((com) => {
                  const isOpen = com.estado !== 'Resuelta';
                  return (
                    <div
                      key={com.id}
                      className={`p-4 rounded-2xl border space-y-3 transition-all ${
                        isOpen
                          ? 'bg-purple-50/30 dark:bg-slate-800/80 border-purple-200 dark:border-purple-900/50 shadow-2xs'
                          : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200/70 dark:border-white/10'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-purple-900 dark:text-purple-300">
                            {com.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              com.prioridad === 'Alta'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            Priority {com.prioridad}
                          </span>
                          <span className="font-bold text-xs text-gray-900 dark:text-white">
                            {com.clienteNombre}
                          </span>
                        </div>

                        <div className="text-[11px] text-gray-500 flex items-center gap-3">
                          <span>Proforma: <strong>{com.proformaId}</strong></span>
                          <span>KAM: <strong>{com.kamNombre}</strong></span>
                        </div>
                      </div>

                      <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200/60 dark:border-purple-800/40 text-xs space-y-1">
                        <div className="flex justify-between font-bold text-purple-900 dark:text-purple-300">
                          <span>📤 Solicitud pricing ({com.usuarioPricing}): {com.asunto}</span>
                          <span className="text-[10px] text-purple-700 dark:text-purple-400 font-normal">
                            {com.fechaEnvio}
                          </span>
                        </div>
                        <p className="text-purple-950 dark:text-purple-200">{com.mensajePricing}</p>
                      </div>

                      {com.respuestaKAM && (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40 text-xs space-y-1 ml-4">
                          <div className="flex justify-between font-bold text-emerald-900 dark:text-emerald-300">
                            <span>📥 Respuesta KAM ({com.kamNombre}):</span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-normal">
                              {com.fechaRespuesta}
                            </span>
                          </div>
                          <p className="text-emerald-950 dark:text-emerald-200">{com.respuestaKAM}</p>
                        </div>
                      )}

                      {/* Botón explícito para Registrar Observación de Pricing sobre el hilo */}
                      <div className="pt-2 border-t border-gray-200/60 dark:border-white/5 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[10px] text-gray-500">
                          Trazabilidad vinculada a Salesforce • ID: {com.salesforceOpportunityId || 'OPP-STK-2026-8891'}
                        </span>
                        <button
                          onClick={() => {
                            setNuevoMensajeCliente(com.clienteNombre);
                            setNuevoMensajeKam(com.kamNombre);
                            setNuevoMensajeAsunto(`Observación de pricing a ${com.id} - ${com.asunto}`);
                            setNuevoMensajeCuerpo('');
                            setNuevoMensajeOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-900 dark:text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Send className="w-3 h-3 text-purple-600" />
                          <span>Registrar observación de pricing</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: COMPARADOR DE VERSIONES (DIFF IDÉNTICO A JEFATURA)                */}
      {/* ========================================================================= */}
      {selectedProformaDiff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-white/10 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal Diff */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
                  <GitCompare className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Comparador de Versiones: {selectedProformaDiff.id}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 font-mono">
                      v1 ➔ v2
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cliente: <strong className="text-gray-800 dark:text-gray-200">{selectedProformaDiff.cliente}</strong> (RUT: {selectedProformaDiff.rut}) • Responsable: {selectedProformaDiff.ejecutivoNombre || 'Ana Valenzuela'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProformaDiff(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparación de Encabezado / Totales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Versión 1 (Original / Rechazada) */}
              <div className="p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">
                    VERSIÓN 1 (RECHAZADA POR CLIENTE)
                  </span>
                  <span className="text-xs font-mono text-gray-500">
                    24/08/2026 10:15
                  </span>
                </div>
                <div className="text-2xl font-black text-red-900 dark:text-red-200">
                  {formatCurrency(6800000)}
                </div>
                <div className="text-xs text-red-800/90 dark:text-red-300/90">
                  <strong>Motivo de rechazo:</strong> {selectedProformaDiff.motivoRechazoPrincipal || 'Diferencia en recubitaje / medidas de SKUs volumétricos'}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Obs: El cliente indica que 14 bultos fueron clasificados como Sobredimensión cuando correspondía Tarifa Estándar.
                </p>
              </div>

              {/* Versión 2 (Ajustada por Facturación / Pricing) */}
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    VERSIÓN 2 (NUEVA VERSIÓN AJUSTADA)
                  </span>
                  <span className="text-xs font-mono text-gray-500">
                    25/08/2026 09:30
                  </span>
                </div>
                <div className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
                  {formatCurrency(selectedProformaDiff.monto || 6540000)}
                </div>
                <div className="text-xs text-emerald-800/90 dark:text-emerald-300/90">
                  <strong>Ajuste realizado:</strong> Recálculo con factor volumétrico estándar y corrección de sobredimensión
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                  Obs: Se re-clasificaron los 14 bultos a Tarifa Estándar según contrato comercial.
                </p>
              </div>
            </div>

            {/* Comparador de Cambios por Ítem (Diff Tabla) */}
            <div>
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                Desglose de Ítems y Modificaciones entre Versiones
              </h3>

              <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100/70 dark:bg-slate-800/70 text-[11px] font-bold text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-white/10">
                      <th className="py-2.5 px-3">Código & Concepto</th>
                      <th className="py-2.5 px-3 text-right">Cant.</th>
                      <th className="py-2.5 px-3 text-right">Tarifa v1</th>
                      <th className="py-2.5 px-3 text-right">Tarifa v2 (Nueva)</th>
                      <th className="py-2.5 px-3 text-right">Total v1</th>
                      <th className="py-2.5 px-3 text-right">Total v2</th>
                      <th className="py-2.5 px-3 text-center">Variación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    <tr>
                      <td className="py-2.5 px-3 font-medium">
                        <span className="font-mono text-purple-700 dark:text-purple-300 mr-1.5 font-bold">
                          SRV-STK-01
                        </span>
                        Flete Express RM a Regiones
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">450</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-500">$8.500 (10%)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">$8.500 (10%)</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-500">$3.442.500</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">$3.442.500</td>
                      <td className="py-2.5 px-3 text-center text-gray-400 font-mono">—</td>
                    </tr>
                    <tr className="bg-amber-50/40 dark:bg-amber-950/20">
                      <td className="py-2.5 px-3 font-medium">
                        <span className="font-mono text-purple-700 dark:text-purple-300 mr-1.5 font-bold">
                          SRV-VOL-02
                        </span>
                        Recargo Volumétrico Sobredimensión
                        <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                          Modificado
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">106</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-500">$15.000 (5%)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">$15.000 (5%)</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-500">$1.710.000</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">$1.510.500</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        $-199.500
                      </td>
                    </tr>
                    <tr className="bg-amber-50/40 dark:bg-amber-950/20">
                      <td className="py-2.5 px-3 font-medium">
                        <span className="font-mono text-purple-700 dark:text-purple-300 mr-1.5 font-bold">
                          SRV-EXT-03
                        </span>
                        Despacho Zona Extrema (Aysén / Magallanes)
                        <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded">
                          Modificado
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">65</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-500">$28.000 (10%)</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">$27.000 (10%)</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-500">$1.638.000</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900 dark:text-white">$1.587.000</td>
                      <td className="py-2.5 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        $-51.000
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Botones de Acción desde el Modal */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                onClick={() => setSelectedProformaDiff(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Comparador
              </button>

              <button
                onClick={() => {
                  const pf = selectedProformaDiff;
                  setSelectedProformaDiff(null);
                  setSelectedProformaResolucion(pf);
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Proceder a Resolver</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RESOLUCIÓN Y GESTIÓN DE PRICING                                  */}
      {/* ========================================================================= */}
      {selectedProformaResolucion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-purple-200 dark:border-white/10 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Dictamen y Resolución de Pricing
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedProformaResolucion.id} • <strong className="text-gray-700 dark:text-gray-300">{selectedProformaResolucion.cliente}</strong> (RUT: {selectedProformaResolucion.rut})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProformaResolucion(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Motivo del Rechazo */}
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 dark:text-rose-300">
                  <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Motivo del rechazo registrado:</span>
                </div>
                <p className="text-xs text-rose-950 dark:text-rose-200 pl-5.5 font-medium">
                  {selectedProformaResolucion.motivoRechazoPrincipal ||
                    selectedProformaResolucion.motivoRechazoPricing ||
                    selectedProformaResolucion.historialVersiones?.[0]?.motivo ||
                    'Discrepancia en recubitaje o tarifa especial'}
                </p>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-200 block mb-2">
                  Acción de Resolución de Pricing
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'Validada', label: 'Validar Condición Tarifaria', desc: 'Aprueba tarifas y libera emisión' },
                    { id: 'Corregida', label: 'Solicitar Corrección a FE', desc: 'Devuelve con notas al ejecutivo' },
                    { id: 'Solicitar_KAM', label: 'Solicitar Revisión al KAM', desc: 'Deriva a negociación comercial' },
                    { id: 'Rechazada_Definitiva', label: 'Rechazo Definitivo', desc: 'Tarifa inviable / sin margen' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setResolucionAccion(act.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        resolucionAccion === act.id
                          ? 'bg-purple-50 dark:bg-purple-950/80 border-purple-600 text-purple-900 dark:text-purple-200 ring-2 ring-purple-600/30 font-semibold'
                          : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-purple-50/40'
                      }`}
                    >
                      <span className="font-bold block text-xs text-gray-900 dark:text-white">{act.label}</span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">{act.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">
                  Observaciones & Justificación Técnica de Pricing *
                </label>
                <textarea
                  rows={4}
                  value={resolucionObservaciones}
                  onChange={(e) => setResolucionObservaciones(e.target.value)}
                  placeholder="Describe la condición tarifaria autorizada, referencia de addendum o motivo de la decisión..."
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedProformaResolucion(null)}
                className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarResolucion}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Confirmar Resolución
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: EVALUACIÓN DE EXCEPCIÓN TARIFARIA                                */}
      {/* ========================================================================= */}
      {selectedExcepcion && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-purple-200 dark:border-white/10 shadow-2xl p-6 sm:p-7 space-y-4 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header Modal: Identificación de la Excepción */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Dictamen de Excepción Tarifaria
                    </h3>
                    <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/70 px-2 py-0.5 rounded-md">
                      {selectedExcepcion.id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    <strong className="text-gray-700 dark:text-gray-300">{selectedExcepcion.clienteNombre}</strong> (RUT: {selectedExcepcion.rut}) • Proforma: <strong className="text-purple-700 dark:text-purple-300">{selectedExcepcion.proformaCodigo} ({selectedExcepcion.versionProforma})</strong> • KAM: <strong>{selectedExcepcion.kamNombre}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedExcepcion(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 1. Tarjeta Resumen: Identificar Excepción y Condiciones Solicitadas */}
            <div className="p-3.5 bg-purple-50/70 dark:bg-slate-800/80 rounded-xl border border-purple-100 dark:border-white/10 space-y-2 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <span className="text-[10px] text-gray-500 block">Tarifa Estándar</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{formatCurrency(selectedExcepcion.tarifaEstandar)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Tarifa Solicitada</span>
                  <span className="font-black text-purple-900 dark:text-purple-300">{formatCurrency(selectedExcepcion.tarifaSolicitada)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Descuento</span>
                  <span className="font-bold text-amber-600">{selectedExcepcion.descuentoSolicitadoPct}% (Base: {selectedExcepcion.descuentoEstandarPct}%)</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 block">Impacto Estimado</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(selectedExcepcion.impactoFinancieroEstimado)}</span>
                </div>
              </div>
              <div className="pt-1.5 border-t border-purple-200/50 dark:border-white/5 flex items-start gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-600 dark:text-gray-300">
                  <strong className="text-gray-800 dark:text-gray-200">Justificación KAM:</strong> {selectedExcepcion.justificacionKAM}
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* 2. Indicar si la condición tarifaria es válida (Decisión formal) */}
              <div>
                <label className="font-bold text-gray-800 dark:text-gray-200 block mb-1.5 flex items-center justify-between">
                  <span>Dictamen y Validación de Condición Tarifaria:</span>
                  <span className="text-[10px] text-purple-600 font-semibold">Selecciona la resolución correspondiente</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Opción 1: Condición Válida */}
                  <button
                    type="button"
                    onClick={() => setExcepcionDecision('Aprobada')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      excepcionDecision === 'Aprobada'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-600/30 shadow-xs scale-[1.01]'
                        : 'bg-gray-50 dark:bg-slate-800/80 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-emerald-50/40 hover:border-emerald-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      excepcionDecision === 'Aprobada'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      <CheckCircle2 className="w-4.5 h-4.5" />
                    </div>
                    <span className="font-bold text-xs leading-tight">Condición Válida</span>
                    <span className={`text-[10px] font-medium leading-tight ${
                      excepcionDecision === 'Aprobada' ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500'
                    }`}>
                      (Aprobar Excepción)
                    </span>
                  </button>

                  {/* Opción 2: Condición No Válida */}
                  <button
                    type="button"
                    onClick={() => setExcepcionDecision('Rechazada')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      excepcionDecision === 'Rechazada'
                        ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-600 text-rose-900 dark:text-rose-200 ring-2 ring-rose-600/30 shadow-xs scale-[1.01]'
                        : 'bg-gray-50 dark:bg-slate-800/80 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-rose-50/40 hover:border-rose-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      excepcionDecision === 'Rechazada'
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400'
                    }`}>
                      <XCircle className="w-4.5 h-4.5" />
                    </div>
                    <span className="font-bold text-xs leading-tight">Condición No Válida</span>
                    <span className={`text-[10px] font-medium leading-tight ${
                      excepcionDecision === 'Rechazada' ? 'text-rose-700 dark:text-rose-300' : 'text-gray-500'
                    }`}>
                      (Rechazar Excepción)
                    </span>
                  </button>

                  {/* Opción 3: Modificar Proforma */}
                  <button
                    type="button"
                    onClick={() => setExcepcionDecision('Solicitar_Modificacion')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      excepcionDecision === 'Solicitar_Modificacion'
                        ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-600 text-amber-950 dark:text-amber-200 ring-2 ring-amber-600/30 shadow-xs scale-[1.01]'
                        : 'bg-gray-50 dark:bg-slate-800/80 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-amber-50/40 hover:border-amber-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      excepcionDecision === 'Solicitar_Modificacion'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400'
                    }`}>
                      <RotateCcw className="w-4.5 h-4.5" />
                    </div>
                    <span className="font-bold text-xs leading-tight">Modificar Proforma</span>
                    <span className={`text-[10px] font-medium leading-tight ${
                      excepcionDecision === 'Solicitar_Modificacion' ? 'text-amber-700 dark:text-amber-300' : 'text-gray-500'
                    }`}>
                      (Devolver a Facturación)
                    </span>
                  </button>

                  {/* Opción 4: Revisión con KAM */}
                  <button
                    type="button"
                    onClick={() => setExcepcionDecision('Solicitud_KAM')}
                    className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      excepcionDecision === 'Solicitud_KAM'
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-950 dark:text-indigo-200 ring-2 ring-indigo-600/30 shadow-xs scale-[1.01]'
                        : 'bg-gray-50 dark:bg-slate-800/80 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-indigo-50/40 hover:border-indigo-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      excepcionDecision === 'Solicitud_KAM'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400'
                    }`}>
                      <MessageSquare className="w-4.5 h-4.5" />
                    </div>
                    <span className="font-bold text-xs leading-tight">Revisión con KAM</span>
                    <span className={`text-[10px] font-medium leading-tight ${
                      excepcionDecision === 'Solicitud_KAM' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500'
                    }`}>
                      (Solicitar Adenda)
                    </span>
                  </button>
                </div>
              </div>

              {/* 3. Registrar Análisis de Pricing */}
              <div>
                <label className="font-bold text-gray-800 dark:text-gray-200 block mb-1">
                  Registrar Análisis de Pricing (Evaluación de margen, volumen y estructura de costo):
                </label>
                <textarea
                  rows={2}
                  value={excepcionAnalisis}
                  onChange={(e) => setExcepcionAnalisis(e.target.value)}
                  placeholder="Ej: Margen de contribución proyectado en 22.4%. Volumen comprometido compensa diferencial de tarifa tramo troncal..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              {/* 4. Registrar Observaciones Formales */}
              <div>
                <label className="font-bold text-gray-800 dark:text-gray-200 block mb-1">
                  Registrar Observaciones y Condiciones Formales (Dictamen vinculante para Facturación/KAM):
                </label>
                <textarea
                  rows={2}
                  value={excepcionObservaciones}
                  onChange={(e) => setExcepcionObservaciones(e.target.value)}
                  placeholder="Ej: Autorizable exclusivamente sujeta a cumplimiento de métrica de volumen mínimo mensual acordada en preventa..."
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-800 dark:text-gray-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 font-sans"
                />
              </div>

              {/* 5. Trazabilidad: Usuario y Fecha de Resolución */}
              <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 text-[11px] text-purple-900 dark:text-purple-300 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  Resolutor: <strong>Rodrigo Palma (Encargado de Pricing)</strong>
                </span>
                <span className="font-mono text-[10px] text-gray-500 dark:text-gray-400">
                  📅 Fecha: {new Date().toLocaleDateString('es-CL')} (Registro inmutable en bitácora)
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setSelectedExcepcion(null)}
                className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarExcepcion}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Dictamen y Registrar Trazabilidad</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: NUEVO REQUERIMIENTO A KAM                                        */}
      {/* ========================================================================= */}
      {nuevoMensajeOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-purple-200 dark:border-white/10 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
                  <Share2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Registrar Observación / Requerimiento de Pricing
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Trazabilidad formal con KAM y sincronización en Salesforce CRM
                  </p>
                </div>
              </div>

              <button
                onClick={() => setNuevoMensajeOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEnviarMensajeKAM} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">
                    KAM Destinatario
                  </label>
                  <select
                    value={nuevoMensajeKam}
                    onChange={(e) => setNuevoMensajeKam(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-xs outline-none focus:border-purple-500 font-medium"
                  >
                    {MOCK_KAMS.map((k) => (
                      <option key={k.id} value={k.nombre}>
                        {k.nombre} ({k.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">
                    Prioridad
                  </label>
                  <select
                    value={nuevoMensajePrioridad}
                    onChange={(e) => setNuevoMensajePrioridad(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-xs outline-none focus:border-purple-500 font-medium"
                  >
                    <option value="Alta">Alta (Urgente cierre)</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">
                  Cliente Comercial
                </label>
                <input
                  type="text"
                  value={nuevoMensajeCliente}
                  onChange={(e) => setNuevoMensajeCliente(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-xs outline-none focus:border-purple-500 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">
                  Asunto de la Observación / Consulta
                </label>
                <input
                  type="text"
                  placeholder="Ej: Observación tarifaria para campaña Q3 / Verificación de addendum en Salesforce"
                  value={nuevoMensajeAsunto}
                  onChange={(e) => setNuevoMensajeAsunto(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-xs outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 dark:text-gray-200 block mb-1">
                  Registrar Observaciones Técnicas y Condiciones de Pricing *
                </label>
                <textarea
                  rows={4}
                  placeholder="Detalla las observaciones tarifarias, márgenes exigidos, addendum solicitado o condiciones de autorización..."
                  value={nuevoMensajeCuerpo}
                  onChange={(e) => setNuevoMensajeCuerpo(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-xl text-xs outline-none focus:border-purple-500 font-sans"
                  required
                />
              </div>

              {/* Metadata de Trazabilidad */}
              <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 text-[11px] text-purple-900 dark:text-purple-300 flex items-center justify-between">
                <span className="font-semibold">👤 Resolutor: Rodrigo Palma (Pricing)</span>
                <span className="font-mono text-[10px] text-gray-500">📅 {new Date().toLocaleDateString('es-CL')}</span>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setNuevoMensajeOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold text-xs cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Guardar y Registrar Observación de Pricing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL: DETALLE 360° E INCIDENCIAS DEL KAM */}
      {selectedKamModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-white/10 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header del Modal */}
            <div className="p-5 border-b border-purple-100 dark:border-white/10 flex items-center justify-between bg-purple-50/50 dark:bg-purple-950/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {selectedKamModal.avatar}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{selectedKamModal.nombre}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold">
                      Key Account Manager
                    </span>
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span>✉️ {selectedKamModal.email}</span>
                    <span>📞 {selectedKamModal.telefono}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedKamModal(null)}
                className="p-1.5 rounded-xl hover:bg-gray-200/60 dark:hover:bg-slate-800 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido con Scroll */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Grid de los 11 Indicadores de Desempeño */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                  <span>Desempeño Tarifario y Métricas Consolidadas</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/5">
                    <span className="text-[10px] text-gray-500 block font-medium">1. Cartera Clientes</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 block">
                      {selectedKamModal.carteraClientesCount} cuentas
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/5">
                    <span className="text-[10px] text-gray-500 block font-medium">2. Proformas Totales</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 block">
                      {selectedKamModal.proformasTotales} proformas
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/5">
                    <span className="text-[10px] text-gray-500 block font-medium">3. Rechazos Tarifa</span>
                    <span className="text-sm font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                      {selectedKamModal.proformasRechazadasTarifa} casos
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/5">
                    <span className="text-[10px] text-gray-500 block font-medium">4. Tasa Rechazo %</span>
                    <span
                      className={`text-sm font-black mt-0.5 block ${
                        selectedKamModal.tasaRechazoTarifario > 10
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {selectedKamModal.tasaRechazoTarifario}%
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/5">
                    <span className="text-[10px] text-gray-500 block font-medium">5. Excep. Solicitadas</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 block">
                      {selectedKamModal.excepcionesSolicitadas}
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/5">
                    <span className="text-[10px] text-gray-500 block font-medium">6. Excep. Aprob/Rech</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 block">
                      <span className="text-emerald-600 font-bold">{selectedKamModal.excepcionesAprobadas}✓</span> / <span className="text-rose-600 font-bold">{selectedKamModal.excepcionesRechazadas}✗</span>
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/5">
                    <span className="text-[10px] text-gray-500 block font-medium">7. Reprocesos</span>
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">
                      {selectedKamModal.cantidadReprocesos} versiones
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/5">
                    <span className="text-[10px] text-gray-500 block font-medium">8. Tiempo Resol.</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 block">
                      {selectedKamModal.tiempoPromedioResolucionDias} días
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/5 col-span-2">
                    <span className="text-[10px] text-gray-500 block font-medium">10. Descuento Promedio Cartera</span>
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-300 mt-0.5 block">
                      {selectedKamModal.descuentoPromedioCarteraPct}% descuento comercial
                    </span>
                  </div>

                  <div className="p-2.5 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200/60 dark:border-white/5 col-span-2">
                    <span className="text-[10px] text-gray-500 block font-medium">11. Variación vs Tarifa Estándar</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 block">
                      +{selectedKamModal.variacionPromedioTarifaPct}% respecto a tarifa base configurada
                    </span>
                  </div>
                </div>
              </div>

              {/* 9. Clientes con Mayor Cantidad de Incidencias Tarifarias */}
              <div className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-800/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5 uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>9. Clientes con Mayor Cantidad de Incidencias Tarifarias</span>
                  </h4>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-900/60 px-2 py-0.5 rounded-full">
                    {selectedKamModal.clientesMayorIncidencia.length} cuentas críticas
                  </span>
                </div>
                <p className="text-[11px] text-rose-800/90 dark:text-rose-300/90">
                  Cuentas de la cartera de este KAM que han presentado mayor frecuencia de rechazos por tarifa o solicitudes de excepción:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {selectedKamModal.clientesMayorIncidencia.map((cliente, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-rose-200 dark:border-rose-900/40 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                          {cliente}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded">
                        Requiere revisión
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer de Acciones */}
            <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-slate-950/50 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSelectedKamModal(null)}
                className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
              >
                Cerrar
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const kamName = selectedKamModal.nombre;
                    setSelectedKamModal(null);
                    setRechazosSearchTerm(kamName);
                    router.push('/?tab=rechazos');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-950 dark:hover:bg-purple-900 dark:text-purple-300 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Ver Proformas Rechazadas</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const kamName = selectedKamModal.nombre;
                    const clienteSugerido = selectedKamModal.clientesMayorIncidencia[0] || 'Cliente Corporativo';
                    setSelectedKamModal(null);
                    setNuevoMensajeKam(kamName);
                    setNuevoMensajeCliente(clienteSugerido);
                    setNuevoMensajeAsunto(`Gestión tarifaria con KAM - ${kamName}`);
                    setNuevoMensajeOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Registrar Requerimiento / Gestión con KAM</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
