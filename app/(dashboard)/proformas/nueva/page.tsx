'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send,
  Save,
  Search,
  Building2,
  CheckCircle2,
  UserCheck,
  CreditCard,
  Check,
  Calendar,
  Package,
  Sparkles,
  Tag,
  Clock,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Layers,
  FileCheck2,
  FileSpreadsheet,
  Eye,
  Coins,
  UploadCloud,
  Paperclip,
  X,
  FileText,
  Percent,
  BadgePercent,
  AlertTriangle,
  ArrowDown,
} from 'lucide-react';
import { MOCK_PROFORMAS } from '@/lib/mock-data';
import { CLIENTES_STARKEN, ClienteReal, CuentaCorriente } from '@/lib/data/clientes';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/context/theme-context';
import { useToast } from '@/context/toast-context';
import { pickMessage, MENSAJES_PROFORMA_CREADA } from '@/lib/messages';

import { CargaValoradaSection } from '@/components/proformas/CargaValoradaSection';
import { ConsolidacionOfsSection } from '@/components/proformas/ConsolidacionOfsSection';
import { AplicarDescuentoSection } from '@/components/proformas/AplicarDescuentoSection';
import { ObservacionesSection } from '@/components/proformas/ObservacionesSection';
import { InconsistenciasVolumetricasModal } from '@/components/proformas/InconsistenciasVolumetricasModal';
import { ProformaExitoModal } from '@/components/proformas/ProformaExitoModal';

export default function NuevaProformaPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const { showToast } = useToast();

  // Wizard Step state: 1 | 2 | 3
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Scroll to top when changing wizard step
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<ClienteReal | null>(null);
  const [selectedCuentas, setSelectedCuentas] = useState<CuentaCorriente[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Step 2: Period & Filter state
  const [filtroPeriodo, setFiltroPeriodo] = useState<'mes_anterior' | 'mes_actual' | 'personalizado'>('mes_anterior');
  const [fechaDesde, setFechaDesde] = useState('2026-06-01');
  const [fechaHasta, setFechaHasta] = useState('2026-06-30');
  const [aliasProforma, setAliasProforma] = useState('');

  // Step 3: Form fields
  const [rut, setRut] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [contacto, setContacto] = useState('');
  const [email, setEmail] = useState('');
  const [tipoAcuerdo, setTipoAcuerdo] = useState('Tarifa diferenciada');
  const [acuerdoPrecargado, setAcuerdoPrecargado] = useState('Tarifa diferenciada');
  const [isAcuerdoEditado, setIsAcuerdoEditado] = useState(false);
  const [monto, setMonto] = useState('');
  const [observaciones, setObservaciones] = useState('');
  // Step 3: Opciones Comerciales Especiales
  const [tieneTarifaExcel, setTieneTarifaExcel] = useState<'SI' | 'NO'>('NO');
  const [archivoExcelTarifa, setArchivoExcelTarifa] = useState<{ nombre: string; tamano: string } | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  // Propuestas de Visualización Carga Valorada y Descuento
  const [opcionCargaValorada, setOpcionCargaValorada] = useState<'A' | 'B' | 'C'>('A');
  const [simularEstadoCargaValorada, setSimularEstadoCargaValorada] = useState<'AUTO' | 'ACTIVA' | 'INACTIVA'>('AUTO');
  const [opcionDescuentoResumen, setOpcionDescuentoResumen] = useState<'1' | '2' | '3'>('1');

  const [aplicaCargaValorada, setAplicaCargaValorada] = useState<'SI' | 'NO'>('SI');
  const [valorUf, setValorUf] = useState('40844.00');
  const [montoCargaValoradaUf, setMontoCargaValoradaUf] = useState('0.80');
  const [detalleCargaValorada, setDetalleCargaValorada] = useState('Aplica cobertura valorada 0.8% del valor declarado (Máx 500 UF)');
  const [cargaValoradaPrecargada, setCargaValoradaPrecargada] = useState({
    aplica: 'SI' as 'SI' | 'NO',
    valorUf: '40844.00',
    montoUf: '0.80',
    detalle: 'Aplica cobertura valorada 0.8% del valor declarado (Máx 500 UF)',
  });
  const [isCargaValoradaEditada, setIsCargaValoradaEditada] = useState(false);
  const [isEditingCargaValorada, setIsEditingCargaValorada] = useState(false);

  const handleResetCargaValorada = () => {
    setValorUf(cargaValoradaPrecargada.valorUf);
    setMontoCargaValoradaUf(cargaValoradaPrecargada.montoUf);
    setDetalleCargaValorada(cargaValoradaPrecargada.detalle);
    setIsCargaValoradaEditada(false);
    setIsEditingCargaValorada(false);
  };

  const [consolidarOfs, setConsolidarOfs] = useState<'SI-EXACTO' | 'SI-SOLO NOMBRE' | 'NO'>('SI-EXACTO');
  const [consolidarOfsPrecargado, setConsolidarOfsPrecargado] = useState<'SI-EXACTO' | 'SI-SOLO NOMBRE' | 'NO'>('SI-EXACTO');
  const [detalleConsolidado, setDetalleConsolidado] = useState('Consolidación de OFs por Centro de Distribución y fecha entrega.');
  const [isConsolidadoEditado, setIsConsolidadoEditado] = useState(false);
  const [isEditingConsolidado, setIsEditingConsolidado] = useState(false);

  const handleResetConsolidado = () => {
    setConsolidarOfs(consolidarOfsPrecargado);
    setIsConsolidadoEditado(false);
    setIsEditingConsolidado(false);
  };

  const handleSelectConsolidadoOption = (opt: 'SI-EXACTO' | 'SI-SOLO NOMBRE' | 'NO') => {
    setConsolidarOfs(opt);
    setIsConsolidadoEditado(opt !== consolidarOfsPrecargado);
  };

  const [aplicaAjusteIpc, setAplicaAjusteIpc] = useState<'SI' | 'NO'>('NO');
  const [porcentajeIpc, setPorcentajeIpc] = useState('3.5');

  // Step 3: Descuentos & Archivos de Respaldo
  const [tipoDescuento, setTipoDescuento] = useState<'porcentaje' | 'monto' | 'ninguno'>('porcentaje');
  const [valorDescuento, setValorDescuento] = useState('10');
  const [archivosAdjuntos, setArchivosAdjuntos] = useState<Array<{ id: string; nombre: string; tamano: string; fecha: string }>>([
    { id: '1', nombre: 'Acuerdo_Comercial_Tarifas_2026.pdf', tamano: '1.4 MB', fecha: '23/07/2026' }
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setArchivoExcelTarifa({
        nombre: file.name,
        tamano: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
      setTipoAcuerdo('Tarifa Especial Personalizada (vía Excel)');
      setIsAcuerdoEditado(true);
      setTieneTarifaExcel('SI');
    }
  };

  const handleRemoveExcelTarifa = () => {
    setArchivoExcelTarifa(null);
    setTipoAcuerdo(acuerdoPrecargado);
    setIsAcuerdoEditado(false);
    setTieneTarifaExcel('NO');
  };

  // Helper file uploader mock
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newFile = {
        id: Date.now().toString(),
        nombre: file.name,
        tamano: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        fecha: new Date().toLocaleDateString('es-CL'),
      };
      setArchivosAdjuntos([...archivosAdjuntos, newFile]);
    }
  };

  const handleRemoveFile = (id: string) => {
    setArchivosAdjuntos(archivosAdjuntos.filter((f) => f.id !== id));
  };

  // Dynamic calculation based on selected period preset & custom date range
  const calculateDynamicMetrics = () => {
    if (selectedCuentas.length === 0) {
      return { totalOfs: 0, montoCalculadoTotal: 0 };
    }

    const baseSaldo = selectedCuentas.reduce((acc, c) => acc + c.saldoFacturable, 0);
    const baseOfs = selectedCuentas.length * 1572 + 201;

    if (filtroPeriodo === 'mes_anterior') {
      return {
        totalOfs: baseOfs,
        montoCalculadoTotal: baseSaldo,
      };
    }

    if (filtroPeriodo === 'mes_actual') {
      // Mes Actual: ~20 días transcurridos a la fecha actual
      return {
        totalOfs: Math.round(selectedCuentas.length * 1045 + 118),
        montoCalculadoTotal: Math.round(baseSaldo * 0.68),
      };
    }

    // Personalizado: si las fechas están vacías o incompletas, retorna 0
    if (!fechaDesde || !fechaHasta) {
      return { totalOfs: 0, montoCalculadoTotal: 0 };
    }

    try {
      const d1 = new Date(fechaDesde);
      const d2 = new Date(fechaHasta);
      if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        return { totalOfs: 0, montoCalculadoTotal: 0 };
      }
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const days = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);
      const ratio = days / 30;

      return {
        totalOfs: Math.round(baseOfs * ratio),
        montoCalculadoTotal: Math.round(baseSaldo * ratio),
      };
    } catch {
      return { totalOfs: 0, montoCalculadoTotal: 0 };
    }
  };

  const { totalOfs, montoCalculadoTotal } = calculateDynamicMetrics();

  // Calculate Carga Valorada in CLP
  const tieneCargaValoradaCliente = Boolean(selectedCliente?.condicionesGenerales?.tieneCargaValorada);
  const montoCargaValoradaClp = (tieneCargaValoradaCliente && aplicaCargaValorada === 'SI')
    ? Math.round((Number(montoCargaValoradaUf) || 0.8) * (Number(valorUf) || 40844))
    : 0;

  // Calculate base total with Carga Valorada
  const montoBase = monto ? Number(monto) : montoCalculadoTotal;
  const subtotalConCarga = montoBase + montoCargaValoradaClp;

  // Calculate discount and final net amount
  const pctDescuentoCliente = (() => {
    if (!selectedCliente || !selectedCliente.condicionesGenerales?.tieneDescuento) return 0;
    const match = selectedCliente.condicionesGenerales.descuento.match(/(\d+)%/);
    return match ? Number(match[1]) : 10;
  })();

  const montoDescuentoCalculado = selectedCliente?.condicionesGenerales?.tieneDescuento
    ? Math.round((subtotalConCarga * pctDescuentoCliente) / 100)
    : 0;

  const montoFinalConDescuento = Math.max(0, subtotalConCarga - montoDescuentoCalculado);

  // Step Validation Booleans
  const isStep1Valid = Boolean(selectedCliente && selectedCuentas.length > 0);
  const isStep2Valid = Boolean(isStep1Valid && fechaDesde && fechaHasta);
  const isStep3Valid = Boolean(isStep2Valid && razonSocial && rut && tipoAcuerdo);

  // Search filter (Normalizes accents, dots, and hyphens)
  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

  const queryNormalized = normalizeText(searchTerm);

  const filteredClientes = queryNormalized
    ? CLIENTES_STARKEN.filter((c) => {
      const razonNormalized = normalizeText(c.razonSocial);
      const rutRawNormalized = normalizeText(c.rut);
      const rutFormattedNormalized = normalizeText(c.rutFormateado);

      return (
        razonNormalized.includes(queryNormalized) ||
        rutRawNormalized.includes(queryNormalized) ||
        rutFormattedNormalized.includes(queryNormalized)
      );
    }).slice(0, 15)
    : [];

  const getAcuerdoTipoFromCliente = (cliente: ClienteReal): string => {
    const t = (cliente.condicionesGenerales?.tarifa || cliente.condicionesGenerales?.descuento || '').toLowerCase();
    if (t.includes('volumétrico') || t.includes('volumetrico') || t.includes('descuento')) {
      return 'Descuento volumétrico';
    }
    if (t.includes('marco') || t.includes('e-commerce') || t.includes('marketplace')) {
      return 'Acuerdo marco';
    }
    if (t.includes('regional') || t.includes('valores')) {
      return 'Tarifa especial regional';
    }
    return 'Tarifa diferenciada';
  };

  const getCargaValoradaInfoFromCliente = (cliente: ClienteReal) => {
    const text = cliente.condicionesGenerales?.cargaValorada || 'Aplica cobertura valorada estándar 0.5% UF.';
    let montoUf = '0.50';
    if (text.includes('0.8%')) montoUf = '0.80';
    if (text.includes('1.2%')) montoUf = '1.20';
    if (text.includes('10 UF') || text.includes('15%')) montoUf = '1.50';

    return {
      aplica: 'SI' as 'SI' | 'NO',
      valorUf: '40844.00',
      montoUf,
      detalle: text,
    };
  };

  const getConsolidadoInfoFromCliente = (cliente: ClienteReal) => {
    const text = cliente.condicionesGenerales?.consolidado || 'Consolidación de OFs por Centro de Distribución y fecha entrega.';
    let option: 'SI-EXACTO' | 'SI-SOLO NOMBRE' | 'NO' = 'SI-EXACTO';

    if (text.toLowerCase().includes('sin consolidación') || text.toLowerCase().includes('individuales')) {
      option = 'NO';
    } else if (text.toLowerCase().includes('mismo cliente') || text.toLowerCase().includes('solo nombre')) {
      option = 'SI-SOLO NOMBRE';
    } else {
      option = 'SI-EXACTO';
    }

    return {
      option,
      detalle: text,
    };
  };

  const handleSelectCliente = (cliente: ClienteReal) => {
    setSelectedCliente(cliente);
    setRazonSocial(cliente.razonSocial);
    setRut(cliente.rutFormateado);
    setSearchTerm('');
    setShowDropdown(false);
    setSelectedCuentas([]);

    const defaultAcuerdo = getAcuerdoTipoFromCliente(cliente);
    setAcuerdoPrecargado(defaultAcuerdo);
    setTipoAcuerdo(defaultAcuerdo);
    setIsAcuerdoEditado(false);
    setTieneTarifaExcel('NO');
    setArchivoExcelTarifa(null);

    const cvInfo = getCargaValoradaInfoFromCliente(cliente);
    setCargaValoradaPrecargada(cvInfo);
    setAplicaCargaValorada(cvInfo.aplica);
    setValorUf(cvInfo.valorUf);
    setMontoCargaValoradaUf(cvInfo.montoUf);
    setDetalleCargaValorada(cvInfo.detalle);
    setIsCargaValoradaEditada(false);
    setIsEditingCargaValorada(false);

    const consInfo = getConsolidadoInfoFromCliente(cliente);
    setConsolidarOfsPrecargado(consInfo.option);
    setConsolidarOfs(consInfo.option);
    setDetalleConsolidado(consInfo.detalle);
    setIsConsolidadoEditado(false);
    setIsEditingConsolidado(false);
  };

  // Toggle single account
  const toggleCuenta = (cta: CuentaCorriente) => {
    if (selectedCuentas.some((c) => c.id === cta.id)) {
      setSelectedCuentas(selectedCuentas.filter((c) => c.id !== cta.id));
    } else {
      setSelectedCuentas([...selectedCuentas, cta]);
    }
  };

  // Select all / Deselect all
  const isAllSelected =
    selectedCliente &&
    selectedCliente.cuentasCorrientes.length > 0 &&
    selectedCuentas.length === selectedCliente.cuentasCorrientes.length;

  const toggleSelectAll = () => {
    if (!selectedCliente) return;
    if (isAllSelected) {
      setSelectedCuentas([]);
    } else {
      setSelectedCuentas([...selectedCliente.cuentasCorrientes]);
    }
  };

  // Handle Preset Period Quick Select
  const handlePeriodPreset = (preset: 'mes_anterior' | 'mes_actual' | 'personalizado') => {
    setFiltroPeriodo(preset);
    if (preset === 'mes_anterior') {
      setFechaDesde('2026-06-01');
      setFechaHasta('2026-06-30');
    } else if (preset === 'mes_actual') {
      setFechaDesde('2026-07-01');
      setFechaHasta('2026-07-20');
    } else if (preset === 'personalizado') {
      setFechaDesde('');
      setFechaHasta('');
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // STEP NAVIGATION & VALIDATIONS
  const handleGoToStep2 = () => {
    if (!selectedCliente) {
      showToast('Por favor busca y selecciona un cliente para continuar.', 'error');
      return;
    }
    if (selectedCuentas.length === 0) {
      showToast('Debes seleccionar al menos una Cuenta Corriente asociada para continuar.', 'error');
      return;
    }
    setCurrentStep(2);
  };

  const handleGoToStep3 = () => {
    if (!selectedCliente || selectedCuentas.length === 0) {
      showToast('Por favor selecciona un cliente y sus cuentas corrientes en el Paso 1 para continuar.', 'error');
      return;
    }
    if (!fechaDesde || !fechaHasta) {
      showToast('Por favor selecciona un período de fechas válido.', 'error');
      return;
    }
    setCurrentStep(3);
  };

  // Validation Banner & Auto-scroll State
  const [validationErrors, setValidationErrors] = useState<
    Array<{ id: string; targetId: string; title: string; message: string }>
  >([]);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  const scrollToSection = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedSection(targetId);
      setTimeout(() => setHighlightedSection(null), 3500);
    }
  };

  // Inconsistencias & Success Modal state
  const [showInconsistenciasModal, setShowInconsistenciasModal] = useState(false);
  const [opcionModalPropuesta, setOpcionModalPropuesta] = useState<'1' | '2' | '3'>('1');
  const [showExitoModal, setShowExitoModal] = useState(false);
  const [pendingProformaId, setPendingProformaId] = useState('');
  const [isSubmittingProforma, setIsSubmittingProforma] = useState(false);
  const [savedProformaMontoFormatted, setSavedProformaMontoFormatted] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Array<{ id: string; targetId: string; title: string; message: string }> = [];

    // 1. Cliente Validation
    if (!selectedCliente) {
      errors.push({
        id: 'cliente',
        targetId: 'section-cliente',
        title: 'Cliente sin seleccionar',
        message: 'Por favor busca por RUT o Razón Social y selecciona una empresa registrada.',
      });
    } else if (selectedCuentas.length === 0) {
      // 2. Cuentas Corrientes Validation
      errors.push({
        id: 'cuentas',
        targetId: 'section-cuentas',
        title: 'Cuentas corrientes no seleccionadas',
        message: 'Debes marcar al menos una cuenta corriente asociada para consolidar la facturación.',
      });
    }

    // 3. Período Validation
    if (!fechaDesde || !fechaHasta) {
      errors.push({
        id: 'periodo',
        targetId: 'section-periodo',
        title: 'Período de consulta incompleto',
        message: 'Ingresa un rango de fechas válido (desde y hasta) para calcular las OFs.',
      });
    } else if (fechaDesde > fechaHasta) {
      errors.push({
        id: 'periodo-rango',
        targetId: 'section-periodo',
        title: 'Rango de fechas inconsistente',
        message: 'La Fecha Desde no puede ser posterior a la Fecha Hasta de consulta.',
      });
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      showToast(
        'Selecciona las cuentas corrientes correspondientes.',
        'error',
        4500,
        `Campos Pendientes (${errors.length})`
      );

      // Auto-scroll smooth a la primera sección con datos faltantes
      if (errors[0]) {
        scrollToSection(errors[0].targetId);
      }
      return;
    }

    setValidationErrors([]);
    setIsSubmittingProforma(true);

    setTimeout(() => {
      const calculatedMonto = monto ? Number(monto) : montoFinalConDescuento;
      const newId = `PF-2026-0${144 + Math.floor(Math.random() * 80)}`;
      const formattedMonto = formatCurrency(calculatedMonto);

      const cuentasLabel =
        selectedCuentas.length === selectedCliente?.cuentasCorrientes.length
          ? `Todas (${selectedCuentas.length} Cuentas)`
          : selectedCuentas.map((c) => c.id).join(', ');

      MOCK_PROFORMAS.unshift({
        id: newId,
        cliente: aliasProforma ? `${razonSocial} (${aliasProforma})` : razonSocial,
        rut,
        cuentaCorrienteId: cuentasLabel,
        cuentaCorrienteNombre: selectedCuentas.map((c) => c.nombre).join(' | '),
        monto: calculatedMonto,
        montoFormatted: formattedMonto,
        estado: 'Pendiente de Validación' as any,
        fecha: new Date().toLocaleDateString('es-CL'),
        tipoAcuerdo: tipoAcuerdo || 'Tarifa diferenciada',
      });

      setPendingProformaId(newId);
      setSavedProformaMontoFormatted(formattedMonto);
      setIsSubmittingProforma(false);
      setShowExitoModal(true);
    }, 1200);
  };

  const handleDownloadProforma = () => {
    const clienteNombre = selectedCliente?.razonSocial || razonSocial;
    const element = document.createElement('a');
    const file = new Blob([`ANEXO Y PROFORMA DE FACTURACIÓN ESPECIAL\nID Proforma: ${pendingProformaId}\nCliente: ${clienteNombre}\nMonto Estimado: ${savedProformaMontoFormatted}\n\nResumen de OFs Discrepantes (14 OFs observadas por cubitaje)\nOF,Largo(cm),Ancho(cm),Alto(cm),Peso(kg),Estado\nOF-901,120,80,100,45.5,Discrepancia Cubitaje\nOF-904,60,40,50,12.0,Discrepancia Volumen`], {
      type: 'text/csv;charset=utf-8;',
    });
    element.href = URL.createObjectURL(file);
    element.download = `Proforma_${pendingProformaId}_Inconsistencias.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast(
      `Descarga de la Proforma ${pendingProformaId} iniciada.`,
      'success'
    );
  };

  const handleEnviarProforma = () => {
    const clienteNombre = selectedCliente?.razonSocial || razonSocial;
    const clienteEmail = selectedCliente?.rut ? `facturacion@${selectedCliente.rut}.cl` : 'facturacion@cliente.cl';
    const subject = encodeURIComponent(`Proforma Comercial Validada ${pendingProformaId} - Starken`);
    const body = encodeURIComponent(
      `Estimado cliente ${clienteNombre},\n\nAdjuntamos la Proforma Comercial ${pendingProformaId} debidamente ajustada y validada por la Subgerencia de Facturación Especial Starken.\n\nMonto Final Neto: ${savedProformaMontoFormatted}\n\nQuedamos atentos a cualquier duda.\n\nSaludos cordiales,\nSubgerencia de Facturación Especial Starken`
    );

    // 1. Abrir Outlook con mensaje pre-escrito via mailto:
    window.location.href = `mailto:${clienteEmail}?subject=${subject}&body=${body}`;

    // 2. Marcar proforma como emitida y pasar al Modal 2 de confirmación
    const proforma = MOCK_PROFORMAS.find((p) => p.id === pendingProformaId);
    if (proforma) {
      proforma.estado = 'Pendiente' as any;
    }

    showToast(
      `Proforma ${pendingProformaId} creada y borrador de correo preparado en Outlook.`,
      'success'
    );

    setShowInconsistenciasModal(false);
    setShowExitoModal(true);
  };

  const handleFinishFlow = () => {
    setShowExitoModal(false);
    router.push(`/?highlight=${pendingProformaId}&toast=created`);
  };

  const handleCloseModalToHome = () => {
    setShowInconsistenciasModal(false);
    setShowExitoModal(false);
    router.push(`/?highlight=${pendingProformaId}&toast=created`);
  };

  return (
    <div className="max-w-[1560px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100">Crear nueva proforma</h1>
        <p className="text-caption text-gray-600 dark:text-gray-400">
          Asistente guiado por pasos para generar proformas comerciales de facturación especial.
        </p>
      </div>

      {/* 2-COLUMN MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: FORM CARDS (2 COLUMNS WIDTH) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6 pb-12 mb-8">
            {/* BUSCADOR DE CLIENTE */}
            <div
              id="section-cliente"
              className={`bg-white dark:bg-slate-800 border rounded-xl p-6 shadow-sm relative transition-all duration-300 ${highlightedSection === 'section-cliente'
                ? 'border-amber-500 ring-4 ring-amber-500/25 shadow-lg'
                : 'border-purple-900/15 dark:border-white/10'
                }`}
              ref={dropdownRef}
            >
              <label className="block text-eyebrow font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Search className={`w-4 h-4 ${theme.accentText}`} />
                Buscar cliente por RUT o razón social
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Escribe el RUT o nombre (ej: Cencosud, Bubba, Falabella, Santander, 81.201.000)..."
                  className="w-full h-11 pl-4 pr-10 bg-purple-50/40 dark:bg-white/5 border border-purple-900/20 dark:border-white/10 rounded-lg text-body text-gray-900 dark:text-gray-100 font-medium focus:border-purple-600 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-xs"
                />
                <Building2 className={`w-4 h-4 absolute right-3 top-3.5 ${theme.accentText} pointer-events-none`} />

                {/* Autocomplete Dropdown */}
                {showDropdown && filteredClientes.length > 0 && (
                  <div className="absolute left-0 right-0 top-12 bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-lg shadow-xl z-30 max-h-64 overflow-y-auto divide-y divide-purple-50">
                    {filteredClientes.map((c) => (
                      <button
                        key={c.rut}
                        type="button"
                        onClick={() => handleSelectCliente(c)}
                        className="w-full text-left p-3 hover:bg-purple-50/80 dark:hover:bg-white/10 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex flex-col">
                          <span className={`text-body font-bold text-gray-900 dark:text-gray-100 group-hover:${theme.accentText}`}>
                            {c.razonSocial}
                          </span>
                          <span className="text-caption text-gray-600 dark:text-gray-400 font-mono">
                            RUT: {c.rutFormateado} · Cuentas Corrientes: {c.cuentasCorrientes.length}
                          </span>
                        </div>
                        <span
                          className={`text-micro font-bold px-2.5 py-0.5 rounded transition-all border ${
                            theme.id === 'mocha'
                              ? 'bg-amber-100/90 text-amber-950 border-amber-300/80 group-hover:!bg-amber-900 group-hover:!text-white group-hover:!border-amber-900 shadow-xs'
                              : theme.id === 'dark'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30 group-hover:!bg-emerald-500 group-hover:!text-slate-950 group-hover:!border-emerald-500 shadow-xs'
                              : 'bg-purple-100 text-purple-800 border-purple-200 group-hover:!bg-purple-600 group-hover:!text-white group-hover:!border-purple-600 shadow-xs'
                          }`}
                        >
                          Seleccionar
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && searchTerm.trim() && filteredClientes.length === 0 && (
                  <div className="absolute left-0 right-0 top-12 bg-white dark:bg-slate-800 border border-purple-900/15 dark:border-white/10 rounded-lg shadow-xl z-30 p-4 text-center text-body text-gray-600 dark:text-gray-400">
                    No se encontró ningún cliente registrado con ese criterio. Puedes ingresarlo manualmente a continuación.
                  </div>
                )}
              </div>

              {selectedCliente && (
                <div className="mt-3 p-3 bg-purple-50/80 dark:bg-purple-500/10 border border-purple-200/80 dark:border-white/10 rounded-lg flex items-center justify-between text-body text-purple-950 dark:text-purple-200">
                  <div className="flex items-center gap-2">
                    <UserCheck className={`w-4 h-4 ${theme.accentText} shrink-0`} />
                    <span>
                      Cliente seleccionado: <strong className={theme.accentText}>{selectedCliente.razonSocial}</strong> ({selectedCliente.rutFormateado})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCliente(null);
                      setSelectedCuentas([]);
                      setRazonSocial('');
                      setRut('');
                    }}
                    className={`text-caption font-semibold ${theme.accentText} underline hover:opacity-80`}
                  >
                    Cambiar cliente
                  </button>
                </div>
              )}
            </div>

            {/* SELECCIÓN DE CUENTAS CORRIENTES */}
            {selectedCliente && (
              <div
                id="section-cuentas"
                className={`bg-white dark:bg-slate-800 border rounded-xl p-6 shadow-sm space-y-4 transition-all duration-300 ${highlightedSection === 'section-cuentas'
                  ? 'border-amber-500 ring-4 ring-amber-500/25 shadow-lg'
                  : 'border-purple-900/15 dark:border-white/10'
                  }`}
              >
                {/* Section Header */}
                <div className="border-b border-gray-100 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className={`w-4 h-4 ${theme.accentText}`} />
                    <h2 className="text-eyebrow font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                      Selecciona las cuentas corrientes asociadas
                    </h2>
                  </div>
                </div>

                {/* Master Checkbox Header Row */}
                <div className="flex items-center justify-between px-3.5 py-2 bg-purple-50/50 dark:bg-white/5 border border-purple-900/10 dark:border-white/10 rounded-lg text-body">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center gap-3 font-bold text-purple-900 dark:text-purple-300 hover:text-purple-700 dark:hover:text-purple-200 transition-colors select-none"
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${isAllSelected ? `${theme.checkboxBg} text-white` : 'border-gray-300 dark:border-white/20 bg-white dark:bg-slate-900/50'
                        }`}
                    >
                      {isAllSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-body font-bold">
                      {isAllSelected ? 'Desseleccionar todas las cuentas' : `Seleccionar todas (${selectedCliente.cuentasCorrientes.length})`}
                    </span>
                  </button>
                  <span className={`text-body ${theme.accentText} font-bold`}>
                    {selectedCuentas.length} de {selectedCliente.cuentasCorrientes.length} seleccionadas
                  </span>
                </div>

                {/* Accounts List (Vertical Column Layout) */}
                <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
                  {selectedCliente.cuentasCorrientes.map((cta) => {
                    const isSelected = selectedCuentas.some((c) => c.id === cta.id);

                    return (
                      <div
                        key={cta.id}
                        onClick={() => toggleCuenta(cta)}
                        className={`h-[45px] px-3.5 rounded-lg border cursor-pointer transition-all flex items-center justify-between shrink-0 select-none ${isSelected
                          ? 'bg-gradient-to-r from-purple-50/90 via-white to-indigo-50/80 dark:from-emerald-500/10 dark:via-slate-800 dark:to-purple-500/10 border-purple-900/10 dark:border-emerald-400/40 shadow-sm dark:shadow-none'
                          : 'bg-gray-50/60 dark:bg-white/5 border-purple-900/10 dark:border-white/10 hover:bg-purple-50/40 dark:hover:bg-white/10 hover:border-purple-300/50 dark:hover:border-white/20'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${isSelected ? `${theme.checkboxBg} text-white` : 'border-gray-300 dark:border-white/20 bg-white dark:bg-slate-900/50'
                              }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>

                          <span className={`inline-flex items-center text-micro font-extrabold font-mono ${theme.badgeBg} px-2 py-0.5 rounded shrink-0`}>
                            {cta.id}
                          </span>
                          <span className="text-body font-bold text-gray-900 dark:text-gray-100 truncate min-w-0" title={cta.nombre}>
                            {cta.nombre}
                          </span>
                          <span className="text-micro text-gray-600 dark:text-gray-500 font-medium shrink-0 hidden sm:inline">
                            • {cta.unidadNegocio}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* COMPONENTE DE PERÍODO DE CONSULTA Y CÁLCULO DE OFs (INTEGRADO DIRECTAMENTE) */}
            {selectedCliente && (
              <div
                id="section-periodo"
                className={`bg-white dark:bg-slate-800 border rounded-xl p-6 shadow-sm space-y-5 transition-all duration-300 ${highlightedSection === 'section-periodo'
                  ? 'border-amber-500 ring-4 ring-amber-500/25 shadow-lg'
                  : 'border-purple-900/15 dark:border-white/10'
                  }`}
              >
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className={`w-4 h-4 ${theme.accentText}`} />
                    <h2 className="text-eyebrow font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                      Período de consulta y cálculo de órdenes de flete (OFs)
                    </h2>
                  </div>
                  <div className="flex items-center gap-1.5 text-caption text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-2.5 py-1 rounded border border-gray-200/60 dark:border-white/10 font-medium">
                    <Clock className={`w-3.5 h-3.5 ${theme.accentText}`} />
                    Rango cliente: <strong className="text-gray-900 dark:text-gray-100">20/05/2026 ➔ 20/07/2026</strong>
                  </div>
                </div>

                {/* Preset Buttons */}
                <div className="space-y-2">
                  <label className="block text-eyebrow font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Seleccionar rango de período
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => handlePeriodPreset('mes_anterior')}
                      className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between ${filtroPeriodo === 'mes_anterior'
                        ? `bg-purple-50/90 dark:bg-purple-500/15 ${theme.accentBorder} ${theme.accentText} dark:text-gray-100 ring-2 ${theme.accentRing} shadow-xs`
                        : 'bg-gray-50/70 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-purple-50/30 dark:hover:bg-white/10 hover:border-purple-200 dark:hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-body font-bold">Mes anterior (recomendado)</span>
                        {filtroPeriodo === 'mes_anterior' && <CheckCircle2 className={`w-4 h-4 ${theme.accentText}`} />}
                      </div>
                      <span className="text-caption text-gray-600 dark:text-gray-400 font-medium">01/06/2026 — 30/06/2026</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePeriodPreset('mes_actual')}
                      className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between ${filtroPeriodo === 'mes_actual'
                        ? `bg-purple-50/90 dark:bg-purple-500/15 ${theme.accentBorder} ${theme.accentText} dark:text-gray-100 ring-2 ${theme.accentRing} shadow-xs`
                        : 'bg-gray-50/70 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-purple-50/30 dark:hover:bg-white/10 hover:border-purple-200 dark:hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-body font-bold">Mes actual</span>
                        {filtroPeriodo === 'mes_actual' && <CheckCircle2 className={`w-4 h-4 ${theme.accentText}`} />}
                      </div>
                      <span className="text-caption text-gray-600 dark:text-gray-400 font-medium">01/07/2026 — 20/07/2026</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePeriodPreset('personalizado')}
                      className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between ${filtroPeriodo === 'personalizado'
                        ? `bg-purple-50/90 dark:bg-purple-500/15 ${theme.accentBorder} ${theme.accentText} dark:text-gray-100 ring-2 ${theme.accentRing} shadow-xs`
                        : 'bg-gray-50/70 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-purple-50/30 dark:hover:bg-white/10 hover:border-purple-200 dark:hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-body font-bold">Rango Personalizado</span>
                        {filtroPeriodo === 'personalizado' && <CheckCircle2 className={`w-4 h-4 ${theme.accentText}`} />}
                      </div>
                      <span className="text-caption text-gray-600 dark:text-gray-400 font-medium">Elegir fechas exactas</span>
                    </button>
                  </div>
                </div>

                {/* Custom Date Pickers */}
                {filtroPeriodo === 'personalizado' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-purple-50/30 dark:bg-white/5 border border-purple-100 dark:border-white/10 rounded-lg">
                    <div>
                      <label className="block text-eyebrow font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Fecha Desde
                      </label>
                      <input
                        type="date"
                        min="2026-05-20"
                        max="2026-07-20"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)}
                        className="w-full h-10 px-3 bg-white dark:bg-slate-900/50 border border-purple-900/20 dark:border-white/10 rounded-md text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600"
                      />
                    </div>
                    <div>
                      <label className="block text-eyebrow font-semibold text-gray-700 dark:text-gray-300 uppercase mb-1">
                        Fecha Hasta
                      </label>
                      <input
                        type="date"
                        min="2026-05-20"
                        max="2026-07-20"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)}
                        className="w-full h-10 px-3 bg-white dark:bg-slate-900/50 border border-purple-900/20 dark:border-white/10 rounded-md text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                )}

                {/* REAL TIME OFs SUMMARY KPI CARD */}
                <div>
                  <div className="bg-white dark:bg-slate-900/50 border border-gray-200/90 dark:border-white/10 p-4.5 rounded-xl shadow-2xs flex items-center gap-4">
                    <div className={`w-11 h-11 bg-purple-50 dark:bg-purple-500/10 ${theme.accentText} rounded-xl flex items-center justify-center shrink-0 border border-purple-100/60 dark:border-white/10`}>
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">Total de OFs calculadas</span>
                      <span className="text-xl font-extrabold text-gray-900 dark:text-gray-100">{totalOfs.toLocaleString('es-CL')} Órdenes de Flete</span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS (BOTÓN ÚNICO DE CREAR PROFORMA) */}
                <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-100 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => router.push('/')}
                    className="px-4 h-11 border border-purple-900/20 dark:border-white/10 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-body font-semibold rounded-lg hover:bg-purple-50 dark:hover:bg-white/5 transition-colors inline-flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-gray-500" />
                    <span>Guardar borrador</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingProforma}
                    className={`px-6 h-11 bg-gradient-to-r ${theme.buttonGradient} text-white text-body font-bold rounded-lg transition-all inline-flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] ${isSubmittingProforma ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingProforma ? 'Creando...' : 'Crear proforma'}</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* RIGHT COLUMN: PERSISTENT STEP-BY-STEP SUMMARY SIDEBAR (1 COLUMN WIDTH) */}
        <div className="lg:col-span-1 sticky top-20 space-y-4 pb-12 mb-8">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-purple-900/15 dark:border-white/10 rounded-xl p-5 shadow-sm space-y-4 relative overflow-hidden">
            {/* Glossy Header Bar */}
            <div className="flex items-center justify-between border-b border-purple-900/10 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 className={`w-4 h-4 ${theme.accentText}`} />
                <h3 className="text-eyebrow font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                  Resumen de la proforma
                </h3>
              </div>
            </div>

            {/* SUMMARY SECTION 1: CLIENTE & CUENTAS */}
            <div className="space-y-2 border-b border-gray-100 dark:border-white/10 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                  Cliente y cuentas
                </span>
                {selectedCliente && selectedCuentas.length > 0 ? (
                  <span className="text-micro text-emerald-600 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> OK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-micro font-extrabold text-amber-800 dark:text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                    <span>Pendiente</span>
                  </span>
                )}
              </div>

              {selectedCliente ? (
                <div className="p-3 bg-purple-50/60 dark:bg-purple-500/10 border border-purple-100 dark:border-white/10 rounded-lg space-y-1.5 text-xs">
                  <p className="font-bold text-gray-900 dark:text-gray-100 leading-snug">{selectedCliente.razonSocial}</p>
                  <p className={`text-[14px] font-extrabold font-mono ${theme.accentText}`}>{selectedCliente.rutFormateado}</p>
                  <div className="pt-1.5 border-t border-purple-100 dark:border-white/10 flex items-center justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Cuentas elegidas:</span>
                    <span className={`font-bold ${theme.accentText}`}>
                      {selectedCuentas.length} de {selectedCliente.cuentasCorrientes.length}
                    </span>
                  </div>
                  {selectedCuentas.length > 0 && (
                    <p className="text-caption text-gray-600 dark:text-gray-400 truncate pt-0.5">
                      {selectedCuentas.map((c) => c.id).join(', ')}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-caption text-gray-600 dark:text-gray-400 italic">No has seleccionado cliente aún.</p>
              )}
            </div>

            {/* SUMMARY SECTION 2: PERÍODO & OFS */}
            <div className="space-y-2 border-b border-gray-100 dark:border-white/10 pb-3">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1">
                  Período y OFs
                </span>
                {selectedCliente ? (
                  <span className="text-micro text-emerald-600 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> OK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-micro font-extrabold text-amber-800 dark:text-amber-300 bg-amber-500/15 border border-amber-500/40 px-2.5 py-0.5 rounded-full shadow-2xs">
                    <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                    <span>En espera</span>
                  </span>
                )}
              </div>

              {selectedCliente ? (
                <div className="p-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/10 rounded-lg space-y-1.5 text-caption">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-caption">Período:</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100 text-caption">
                      {fechaDesde && fechaHasta ? `${fechaDesde} ➔ ${fechaHasta}` : 'Por definir'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
                    <span className="text-gray-600 dark:text-gray-400 text-caption">Órdenes (OFs):</span>
                    <span className={`font-extrabold ${theme.accentText}`}>{totalOfs.toLocaleString('es-CL')} OFs</span>
                  </div>
                  {aliasProforma && (
                    <p className={`text-caption ${theme.accentText} font-semibold bg-purple-100/60 dark:bg-purple-500/10 px-2.5 py-0.5 rounded-full truncate`}>
                      Alias: {aliasProforma}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-caption text-gray-600 dark:text-gray-400 italic">Se configurará al seleccionar cliente.</p>
              )}
            </div>

            {/* ESTIMATED TOTAL CARD WITH CARGA VALORADA & DISCOUNT BREAKDOWN */}
            <div className="p-3.5 bg-purple-50/60 dark:bg-purple-500/10 border border-purple-100/90 dark:border-white/10 rounded-xl space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-eyebrow font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
                  Monto final estimado
                </span>
              </div>

              {montoBase > 0 && (
                <div className="space-y-1 pt-1.5 border-t border-purple-100 dark:border-white/10 text-caption">
                  <div className="flex items-center justify-between text-gray-700 dark:text-gray-300 font-bold">
                    <span>Subtotal base:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatCurrency(montoBase)}</span>
                  </div>

                  {tieneCargaValoradaCliente && aplicaCargaValorada === 'SI' && (
                    <div className={`flex items-center justify-between ${theme.accentText} font-bold`}>
                      <span>Carga Valorada ({montoCargaValoradaUf} UF):</span>
                      <span>+{formatCurrency(montoCargaValoradaClp)}</span>
                    </div>
                  )}

                  {selectedCliente?.condicionesGenerales?.tieneDescuento && (
                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>Descuento ({pctDescuentoCliente}%):</span>
                      <span>-{formatCurrency(montoDescuentoCalculado)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className={montoBase > 0 ? "pt-1.5 border-t border-purple-100 dark:border-white/10 text-right" : "text-right"}>
                <p className="text-xl font-extrabold text-gray-900 dark:text-gray-100 font-mono leading-tight text-right">
                  {formatCurrency(montoFinalConDescuento)}
                </p>
                {selectedCliente?.condicionesGenerales?.tieneDescuento && montoBase > 0 && (
                  <p className="text-micro text-gray-500 dark:text-gray-400 pt-0.5 text-right">
                    Incluye {pctDescuentoCliente}% de descuento aplicado
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* CARD DE CONDICIONES GENERALES DEL CLIENTE */}
          {selectedCliente && (
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-purple-900/15 dark:border-white/10 rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-purple-900/10 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className={`w-4 h-4 ${theme.accentText}`} />
                  <h3 className="text-eyebrow font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                    Condiciones generales del cliente
                  </h3>
                </div>
                <span className={`text-micro font-medium px-2.5 py-0.5 rounded-full ${theme.badgeBg}`}>
                  Acuerdo comercial
                </span>
              </div>

              <div className="space-y-2.5 text-caption">
                {/* 1. CARGA VALORADA (ESTILO OPCIÓN A) */}
                <div className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${selectedCliente.condicionesGenerales.tieneCargaValorada
                  ? 'bg-purple-50/60 dark:bg-purple-500/10 border-purple-100 dark:border-white/10'
                  : 'bg-amber-50/40 dark:bg-amber-500/5 border-amber-200/60 dark:border-amber-500/20'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedCliente.condicionesGenerales.tieneCargaValorada ? theme.accentBg : 'bg-amber-500'} shrink-0`} />
                      <span>Carga Valorada</span>
                    </div>
                    {selectedCliente.condicionesGenerales.tieneCargaValorada ? (
                      <span className="text-micro font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Activa
                      </span>
                    ) : (
                      <span className="text-micro font-extrabold text-amber-900 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <X className="w-3 h-3 text-amber-700" />
                        No Aplica
                      </span>
                    )}
                  </div>
                  <p className="text-caption text-gray-600 dark:text-gray-400 pl-3 leading-relaxed">
                    {selectedCliente.condicionesGenerales.cargaValorada}
                  </p>
                </div>

                {/* 2. CONSOLIDADO (ESTILO OPCIÓN A) */}
                <div className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${selectedCliente.condicionesGenerales.tieneConsolidado
                  ? 'bg-purple-50/60 dark:bg-purple-500/10 border-purple-100 dark:border-white/10'
                  : 'bg-amber-50/40 dark:bg-amber-500/5 border-amber-200/60 dark:border-amber-500/20'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedCliente.condicionesGenerales.tieneConsolidado ? theme.accentBg : 'bg-amber-500'} shrink-0`} />
                      <span>Consolidado</span>
                    </div>
                    {selectedCliente.condicionesGenerales.tieneConsolidado ? (
                      <span className="text-micro font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Activa
                      </span>
                    ) : (
                      <span className="text-micro font-extrabold text-amber-900 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <X className="w-3 h-3 text-amber-700" />
                        No Aplica
                      </span>
                    )}
                  </div>
                  <p className="text-caption text-gray-600 dark:text-gray-400 pl-3 leading-relaxed">
                    {selectedCliente.condicionesGenerales.consolidado}
                  </p>
                </div>

                {/* 3. DESCUENTO (ESTILO OPCIÓN A) */}
                <div className={`p-3.5 rounded-xl border space-y-1.5 transition-all ${selectedCliente.condicionesGenerales.tieneDescuento
                  ? 'bg-purple-50/60 dark:bg-purple-500/10 border-purple-100 dark:border-white/10'
                  : 'bg-amber-50/40 dark:bg-amber-500/5 border-amber-200/60 dark:border-amber-500/20'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-gray-900 dark:text-gray-100">
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedCliente.condicionesGenerales.tieneDescuento ? theme.accentBg : 'bg-amber-500'} shrink-0`} />
                      <span>Descuento</span>
                    </div>
                    {selectedCliente.condicionesGenerales.tieneDescuento ? (
                      <span className="text-micro font-extrabold text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <Check className="w-3 h-3 text-emerald-600" />
                        Activa
                      </span>
                    ) : (
                      <span className="text-micro font-extrabold text-amber-900 dark:text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                        <X className="w-3 h-3 text-amber-700" />
                        No Aplica
                      </span>
                    )}
                  </div>
                  <p className="text-caption text-gray-600 dark:text-gray-400 pl-3 leading-relaxed">
                    {selectedCliente.condicionesGenerales?.tieneDescuento
                      ? (selectedCliente.condicionesGenerales.descuento || 'Con descuento.')
                      : 'Sin descuento.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE INCONSISTENCIAS VOLUMÉTRICAS CON PROPUESTA SELECCIONADA */}
      <InconsistenciasVolumetricasModal
        isOpen={showInconsistenciasModal}
        proformaId={pendingProformaId}
        clienteNombre={selectedCliente?.razonSocial || razonSocial}
        totalOfsCount={totalOfs}
        propuestaVariante={opcionModalPropuesta}
        buttonGradient={theme.buttonGradient}
        onClose={handleCloseModalToHome}
        onDownload={handleDownloadProforma}
        onEnviarProforma={handleEnviarProforma}
      />

      {/* MODAL DE ÉXITO DE PROFORMA VALIDADA Y ARREGLADA CON ACCIONES */}
      <ProformaExitoModal
        isOpen={showExitoModal}
        proformaId={pendingProformaId}
        clienteNombre={selectedCliente?.razonSocial || razonSocial}
        montoFormatted={savedProformaMontoFormatted}
        buttonGradient={theme.buttonGradient}
        onClose={handleCloseModalToHome}
        onFinish={handleFinishFlow}
      />
    </div>
  );
}
