'use client';

import { useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Save,
  Check,
  Send,
  HelpCircle,
  XCircle,
  Layers,
  ExternalLink,
  Bot,
  Database,
  Globe,
  FileImage,
  Pencil,
  Zap,
  Info,
  ShieldCheck,
  Upload,
  Trash2,
  Search,
  Filter,
  Eye,
  ChevronDown,
  UserCheck,
  Tag,
  DollarSign,
  TrendingDown,
  Building2,
  Calendar,
} from 'lucide-react';
import { useTheme } from '@/context/theme-context';
import { useToast } from '@/context/toast-context';
import { formatCurrency } from '@/lib/utils';

// DEFINICIÓN DE TIPOS DE LA CASCADA DE RESOLUCIÓN DE SKU
export type TierOrigen = 'Historico' | 'IA_Web' | 'Manual_Requerido';

export interface SkuResolutionItem {
  id: string;
  sku: string;
  descripcion: string;
  totalOfs: number;
  ofsEjemplo: string[];
  
  // Datos declarados originalmente por el cliente
  pesoDeclaradoKg: number;
  dimensionesDeclaradasCm: { largo: number; ancho: number; alto: number };

  // Nivel de la cascada
  tier: TierOrigen;

  // Tier 1: Histórico
  datosHistoricos?: {
    pesoKg: number;
    dimensionesCm: { largo: number; ancho: number; alto: number };
    origenTabla: string;
  };

  // Tier 2: Agente IA Web
  datosIa?: {
    pesoKg: number;
    dimensionesCm: { largo: number; ancho: number; alto: number };
    fuenteUrl: string;
    confianzaPorcentaje: number;
  };

  // Tier 3: Manual con Evidencia o Ajuste por Objeción
  evidenciaManual?: {
    sinEvidencia?: boolean;
    motivoSinEvidencia?: string;
    urlProveedor?: string;
    screenshotUrl?: string;
    nombreArchivo?: string;
  };

  // Datos finales verificados y estado
  pesoFinalKg: number;
  dimensionesFinalesCm: { largo: number; ancho: number; alto: number };
  estadoValidacion: 'Validado_Auto' | 'Pendiente_IA' | 'Pendiente_Manual' | 'Validado_Humano';
  modificadoPorAnalista?: boolean;
}

// MOCK DE DATOS CON 500 OFs AGRUPADAS EN 5 SKUs CLAVE
const MOCK_SKUS_INITIAL: SkuResolutionItem[] = [
  {
    id: 'sku-1',
    sku: 'SKU-TEX-001',
    descripcion: 'Caja Textil Estándar S (Prendas de vestir dobladas)',
    totalOfs: 140,
    ofsEjemplo: ['OF-9801', 'OF-9802', 'OF-9803', 'OF-9804', 'OF-9805'],
    pesoDeclaradoKg: 5.2,
    dimensionesDeclaradasCm: { largo: 40, ancho: 30, alto: 20 },
    tier: 'Historico',
    datosHistoricos: {
      pesoKg: 5.2,
      dimensionesCm: { largo: 40, ancho: 30, alto: 20 },
      origenTabla: 'Maestro de Productos Físicos Starken 2025',
    },
    pesoFinalKg: 5.2,
    dimensionesFinalesCm: { largo: 40, ancho: 30, alto: 20 },
    estadoValidacion: 'Validado_Auto',
  },
  {
    id: 'sku-2',
    sku: 'SKU-TEX-004',
    descripcion: 'Pack Polerones Deportivos M (10 unidades por bulto)',
    totalOfs: 85,
    ofsEjemplo: ['OF-9806', 'OF-9807', 'OF-9808', 'OF-9809'],
    pesoDeclaradoKg: 8.0,
    dimensionesDeclaradasCm: { largo: 60, ancho: 40, alto: 35 },
    tier: 'Historico',
    datosHistoricos: {
      pesoKg: 12.5,
      dimensionesCm: { largo: 60, ancho: 40, alto: 35 },
      origenTabla: 'Maestro de Productos Físicos Starken 2025',
    },
    pesoFinalKg: 12.5,
    dimensionesFinalesCm: { largo: 60, ancho: 40, alto: 35 },
    estadoValidacion: 'Validado_Auto',
  },
  {
    id: 'sku-3',
    sku: 'SKU-ELECTRO-55',
    descripcion: 'Smart TV 55 Pulgadas 4K Ultra HD Slim Box',
    totalOfs: 65,
    ofsEjemplo: ['OF-9810', 'OF-9811', 'OF-9812'],
    pesoDeclaradoKg: 11.0,
    dimensionesDeclaradasCm: { largo: 120, ancho: 75, alto: 12 },
    tier: 'IA_Web',
    datosIa: {
      pesoKg: 15.8,
      dimensionesCm: { largo: 123, ancho: 78, alto: 15 },
      fuenteUrl: 'https://falabella.com/ficha-tecnica/smart-tv-55-4k-uhd',
      confianzaPorcentaje: 94,
    },
    pesoFinalKg: 15.8,
    dimensionesFinalesCm: { largo: 123, ancho: 78, alto: 15 },
    estadoValidacion: 'Pendiente_IA',
  },
  {
    id: 'sku-4',
    sku: 'SKU-AUDIO-BT9',
    descripcion: 'Parlante Bluetooth Portátil Resistente al Agua IPX7',
    totalOfs: 110,
    ofsEjemplo: ['OF-9813', 'OF-9814', 'OF-9815', 'OF-9816'],
    pesoDeclaradoKg: 1.5,
    dimensionesDeclaradasCm: { largo: 20, ancho: 10, alto: 10 },
    tier: 'IA_Web',
    datosIa: {
      pesoKg: 2.3,
      dimensionesCm: { largo: 25, ancho: 12, alto: 10 },
      fuenteUrl: 'https://mercadolibre.cl/item/parlante-bt9-waterproof',
      confianzaPorcentaje: 88,
    },
    pesoFinalKg: 2.3,
    dimensionesFinalesCm: { largo: 25, ancho: 12, alto: 10 },
    estadoValidacion: 'Pendiente_IA',
  },
  {
    id: 'sku-5',
    sku: 'SKU-VAR-99',
    descripcion: 'Mueble Rack TV Industrial Madera Rústica y Fierro',
    totalOfs: 100,
    ofsEjemplo: ['OF-9817', 'OF-9818', 'OF-9819', 'OF-9820'],
    pesoDeclaradoKg: 14.2,
    dimensionesDeclaradasCm: { largo: 80, ancho: 50, alto: 40 },
    tier: 'Manual_Requerido',
    pesoFinalKg: 14.2,
    dimensionesFinalesCm: { largo: 80, ancho: 50, alto: 40 },
    estadoValidacion: 'Pendiente_Manual',
  },
];

function EditarProformaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const proformaId = searchParams.get('id') || 'PF-2026-0204';
  const { theme } = useTheme();
  const { showToast } = useToast();

  const resultadoRef = useRef<HTMLDivElement>(null);
  const [isProcessingSku, setIsProcessingSku] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // LISTADO DE SKUs CON SU ESTADO DE VALIDACIÓN
  const [skusList, setSkusList] = useState<SkuResolutionItem[]>(MOCK_SKUS_INITIAL);
  const [activeTab, setActiveTab] = useState<'todos' | 'accion' | 'ia' | 'manual' | 'historico'>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // DETECCIÓN DE MODO: MEDICIONES (SKU) VS TARIFAS (PRICING)
  const tipoParam = searchParams.get('tipo');
  const isPricingModeInitial =
    tipoParam === 'pricing' ||
    searchParams.get('motivo') === 'tarifa' ||
    proformaId === 'PF-2025-0141';

  const [activeFlowMode, setActiveFlowMode] = useState<'medidas' | 'pricing'>(
    isPricingModeInitial ? 'pricing' : 'medidas'
  );

  // DATOS DEL FLUJO DE PRICING
  const pricingMontoOriginal = 6800000;
  const pricingMontoV2 = 5900000;
  const pricingAjuste = -900000;
  const pricingPorcentaje = -13.2;

  const handleDescargarDetallePricing = () => {
    const header = 'OF,Tramo_Servicio,Total_Bultos,Tarifa_Original_V1,Tarifa_Corregida_Pricing_V2,Total_Facturable_V2,Estado_Pricing\n';
    const rows = [
      'OF-9801 a OF-10120,Distribucion Metropolitana (RM),320,13600,11800,3776000,Corregido segun Adenda 2026',
      'OF-10121 a OF-10300,Distribucion Regional (V Region),180,13600,11800,2124000,Corregido segun Adenda 2026',
    ].join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], `Detalle_Tarifario_Pricing_${proformaId}_V2.csv`, { type: 'text/csv' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `Detalle_Tarifario_Pricing_${proformaId}_V2.xlsx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast(`Detalle tarifario recalculado por Pricing para ${proformaId} descargado.`, 'success', 4000, 'Descarga completada');
  };

  const handleGenerarProformaV2Pricing = () => {
    showToast(
      `Proforma V2 generada exitosamente con las nuevas tarifas de Pricing ($5.900.000). Enviada a V°B° de Jefatura.`,
      'success',
      6000,
      'Proforma V2 Generada'
    );
    setTimeout(() => {
      router.push(`/?highlight=${proformaId}&toast=solicitada&v2=true&monto=${pricingMontoV2}`);
    }, 1000);
  };

  // MODAL PARA REVISAR / EDITAR SUGERENCIA IA
  const [editingIaItem, setEditingIaItem] = useState<SkuResolutionItem | null>(null);
  const [iaFormPeso, setIaFormPeso] = useState<number>(0);
  const [iaFormLargo, setIaFormLargo] = useState<number>(0);
  const [iaFormAncho, setIaFormAncho] = useState<number>(0);
  const [iaFormAlto, setIaFormAlto] = useState<number>(0);

  // MODAL PARA ADJUNTAR EVIDENCIA MANUAL (TIER 3)
  const [manualEvidenceItem, setManualEvidenceItem] = useState<SkuResolutionItem | null>(null);
  const [sinEvidenciaEncontrada, setSinEvidenciaEncontrada] = useState<boolean>(false);
  const [motivoSinEvidencia, setMotivoSinEvidencia] = useState<string>('');
  const [manualUrl, setManualUrl] = useState<string>('');
  const [manualFile, setManualFile] = useState<File | null>(null);
  const [manualFilePreview, setManualFilePreview] = useState<string | null>(null);
  const [manualFormPeso, setManualFormPeso] = useState<number>(0);
  const [manualFormLargo, setManualFormLargo] = useState<number>(0);
  const [manualFormAncho, setManualFormAncho] = useState<number>(0);
  const [manualFormAlto, setManualFormAlto] = useState<number>(0);

  // MONTO ORIGINAL Y RECALCULADO
  const montoOriginal = 6800000;
  const montoAjustado = 6560000;

  // CÁLCULO DE PROGRESO DE VALIDACIÓN (SKUs y OFs)
  const totalSkus = skusList.length;
  const skusValidados = skusList.filter(
    (s) => s.estadoValidacion === 'Validado_Auto' || s.estadoValidacion === 'Validado_Humano'
  ).length;
  const todoValidado = skusValidados === totalSkus;

  // TOTAL DE OFS Y OFS VALIDADAS
  const totalOfsCount = skusList.reduce((acc, s) => acc + s.totalOfs, 0);
  const ofsValidadas = skusList
    .filter((s) => s.estadoValidacion === 'Validado_Auto' || s.estadoValidacion === 'Validado_Humano')
    .reduce((acc, s) => acc + s.totalOfs, 0);
  const ofsPendientes = totalOfsCount - ofsValidadas;
  const porcentajeOfs = Math.round((ofsValidadas / totalOfsCount) * 100);

  const handleDownloadPlantilla = () => {
    const header = 'OF,SKU,Descripcion,Peso_Declarado_kg,Largo_cm,Ancho_cm,Alto_cm,Total_OFs_Lote\n';
    const rows = skusList
      .map(
        (s) =>
          `${s.ofsEjemplo[0]},${s.sku},"${s.descripcion}",${s.pesoDeclaradoKg},${s.dimensionesDeclaradasCm.largo},${s.dimensionesDeclaradasCm.ancho},${s.dimensionesDeclaradasCm.alto},${s.totalOfs}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], `Plantilla_Base_Incidencias_${proformaId}.csv`, { type: 'text/csv' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `Plantilla_Base_Incidencias_${proformaId}.xlsx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast(`Plantilla base para ${proformaId} descargada.`, 'success');
  };

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSimularProcesarSku = () => {
    if (!selectedFile) {
      showToast(
        'Debes adjuntar o seleccionar una plantilla de corrección (.xlsx o .csv) antes de procesar.',
        'warning',
        5000,
        'Plantilla requerida'
      );
      return;
    }

    setIsProcessingSku(true);
    setTimeout(() => {
      setIsProcessingSku(false);
      setHasProcessed(true);
      showToast(
        `Validación ejecutada: 500 OFs analizadas y agrupadas en ${skusList.length} SKUs únicos.`,
        'success',
        5000,
        'Cruzamiento por SKU Completado'
      );

      setTimeout(() => {
        if (resultadoRef.current) {
          resultadoRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }, 1200);
  };

  // ACCIÓN 1: APROBAR SUGERENCIA DE IA DIRECTA
  const handleAprobarSugerenciaIa = (item: SkuResolutionItem) => {
    setSkusList((prev) =>
      prev.map((s) =>
        s.id === item.id
          ? {
              ...s,
              estadoValidacion: 'Validado_Humano',
              modificadoPorAnalista: false,
              pesoFinalKg: s.datosIa?.pesoKg || s.pesoFinalKg,
              dimensionesFinalesCm: s.datosIa?.dimensionesCm || s.dimensionesFinalesCm,
            }
          : s
      )
    );
    showToast(
      `Sugerencia de IA aceptada directamente para ${item.sku}. Se aplicó a las ${item.totalOfs} OFs del lote.`,
      'success',
      4500,
      'Validado por IA (Sin Modificación)'
    );
  };

  // ACCIÓN 2: ABRIR MODAL PARA MODIFICAR DATOS DE IA
  const handleOpenEditIaModal = (item: SkuResolutionItem) => {
    setEditingIaItem(item);
    setIaFormPeso(item.pesoFinalKg || item.datosIa?.pesoKg || item.pesoDeclaradoKg);
    setIaFormLargo(item.dimensionesFinalesCm?.largo || item.datosIa?.dimensionesCm.largo || item.dimensionesDeclaradasCm.largo);
    setIaFormAncho(item.dimensionesFinalesCm?.ancho || item.datosIa?.dimensionesCm.ancho || item.dimensionesDeclaradasCm.ancho);
    setIaFormAlto(item.dimensionesFinalesCm?.alto || item.datosIa?.dimensionesCm.alto || item.dimensionesDeclaradasCm.alto);
  };

  const handleSaveEditedIa = () => {
    if (!editingIaItem) return;
    setSkusList((prev) =>
      prev.map((s) =>
        s.id === editingIaItem.id
          ? {
              ...s,
              estadoValidacion: 'Validado_Humano',
              modificadoPorAnalista: true,
              pesoFinalKg: Number(iaFormPeso),
              dimensionesFinalesCm: {
                largo: Number(iaFormLargo),
                ancho: Number(iaFormAncho),
                alto: Number(iaFormAlto),
              },
            }
          : s
      )
    );
    setEditingIaItem(null);
    showToast(
      `Medidas modificadas manualmente por analista para ${editingIaItem.sku}. Registrado en auditoría como cambio manual sobre IA (${editingIaItem.totalOfs} OFs).`,
      'success',
      5000,
      'Modificación Manual Registrada'
    );
  };

  // ACCIÓN 3: ABRIR MODAL DE EVIDENCIA MANUAL (TIER 3)
  const handleOpenManualEvidenceModal = (item: SkuResolutionItem) => {
    setManualEvidenceItem(item);
    const isSinEv = item.evidenciaManual?.sinEvidencia || false;
    setSinEvidenciaEncontrada(isSinEv);
    setMotivoSinEvidencia(
      item.evidenciaManual?.motivoSinEvidencia ||
        'No se encontró ficha técnica web pública. Se aceptan medidas según objeción del cliente.'
    );
    setManualUrl(item.evidenciaManual?.urlProveedor || 'https://tienda-oficial.cl/producto/' + item.sku.toLowerCase());
    setManualFilePreview(item.evidenciaManual?.screenshotUrl || null);
    setManualFormPeso(item.pesoFinalKg || item.pesoDeclaradoKg);
    setManualFormLargo(item.dimensionesFinalesCm.largo || item.dimensionesDeclaradasCm.largo);
    setManualFormAncho(item.dimensionesFinalesCm.ancho || item.dimensionesDeclaradasCm.ancho);
    setManualFormAlto(item.dimensionesFinalesCm.alto || item.dimensionesDeclaradasCm.alto);
  };

  const handleApplyDeclaradasCliente = () => {
    if (!manualEvidenceItem) return;
    setManualFormPeso(manualEvidenceItem.pesoDeclaradoKg);
    setManualFormLargo(manualEvidenceItem.dimensionesDeclaradasCm.largo);
    setManualFormAncho(manualEvidenceItem.dimensionesDeclaradasCm.ancho);
    setManualFormAlto(manualEvidenceItem.dimensionesDeclaradasCm.alto);
    showToast('Medidas declaradas por el cliente cargadas.', 'info', 2500);
  };

  const handleSaveManualEvidence = () => {
    if (!manualEvidenceItem) return;

    if (!sinEvidenciaEncontrada) {
      if (!manualUrl.trim()) {
        showToast('Por favor ingresa la URL de la página o ficha técnica del proveedor.', 'warning');
        return;
      }
      if (!manualFilePreview && !manualFile) {
        showToast('Debes adjuntar o usar una captura de respaldo de la ficha técnica.', 'warning');
        return;
      }
    }

    setSkusList((prev) =>
      prev.map((s) =>
        s.id === manualEvidenceItem.id
          ? {
              ...s,
              estadoValidacion: 'Validado_Humano',
              modificadoPorAnalista: true,
              evidenciaManual: sinEvidenciaEncontrada
                ? {
                    sinEvidencia: true,
                    motivoSinEvidencia: motivoSinEvidencia.trim() || 'Aceptado según objeción de cliente',
                    urlProveedor: '',
                    screenshotUrl: '',
                    nombreArchivo: '',
                  }
                : {
                    sinEvidencia: false,
                    urlProveedor: manualUrl,
                    screenshotUrl: manualFilePreview || '/demo_email_aprobado.png',
                    nombreArchivo: manualFile ? manualFile.name : 'ficha_tecnica_respaldo.png',
                  },
              pesoFinalKg: Number(manualFormPeso),
              dimensionesFinalesCm: {
                largo: Number(manualFormLargo),
                ancho: Number(manualFormAncho),
                alto: Number(manualFormAlto),
              },
            }
          : s
      )
    );
    setManualEvidenceItem(null);
    showToast(
      sinEvidenciaEncontrada
        ? `SKU ${manualEvidenceItem.sku} regularizado según objeción de cliente (${manualEvidenceItem.totalOfs} OFs actualizadas).`
        : `Evidencia web registrada para ${manualEvidenceItem.sku}. Se aplicaron las medidas a las ${manualEvidenceItem.totalOfs} OFs.`,
      'success',
      5000,
      sinEvidenciaEncontrada ? 'Ajuste s/Cliente Aplicado' : 'Evidencia Registrada'
    );
  };

  // ACCIÓN 4: APROBAR MASIVAMENTE TODAS LAS SUGERENCIAS DE IA CON ALTA CONFIANZA
  const handleAprobarTodasIa = () => {
    const totalIas = skusList.filter((s) => s.tier === 'IA_Web' && s.estadoValidacion === 'Pendiente_IA').length;
    if (totalIas === 0) {
      showToast('No hay sugerencias de IA pendientes de aprobación.', 'info');
      return;
    }

    setSkusList((prev) =>
      prev.map((s) => {
        if (s.tier === 'IA_Web' && s.estadoValidacion === 'Pendiente_IA') {
          return {
            ...s,
            estadoValidacion: 'Validado_Humano',
            pesoFinalKg: s.datosIa?.pesoKg || s.pesoFinalKg,
            dimensionesFinalesCm: s.datosIa?.dimensionesCm || s.dimensionesFinalesCm,
          };
        }
        return s;
      })
    );
    showToast(
      `Se aprobaron todas las sugerencias de IA con alta confianza (${totalIas} SKUs resueltos).`,
      'success',
      5500,
      'Validación Masiva de IA'
    );
  };

  const handleDescargarNuevaProforma = () => {
    const header = 'SKU,Descripcion,Peso_Declarado_kg,Peso_Final_kg,Largo_cm,Ancho_cm,Alto_cm,Total_OFs,Origen_Dato,Estado_Validacion\n';
    const rows = skusList
      .map(
        (s) =>
          `${s.sku},"${s.descripcion}",${s.pesoDeclaradoKg},${s.pesoFinalKg},${s.dimensionesFinalesCm.largo},${s.dimensionesFinalesCm.ancho},${s.dimensionesFinalesCm.alto},${s.totalOfs},${s.tier},${s.estadoValidacion}`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const file = new File([blob], `Proforma_Regularizada_${proformaId}.csv`, { type: 'text/csv' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `Proforma_Regularizada_${proformaId}.xlsx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast(`Nueva proforma regularizada ${proformaId} descargada exitosamente.`, 'success', 4000, 'Descarga completada');
  };

  const handleSolicitarAutorizacionEnvio = () => {
    if (!todoValidado) {
      showToast(
        `Aún tienes ${totalSkus - skusValidados} SKUs pendientes de validación o evidencia. Debes completar el 100%.`,
        'warning',
        6000,
        'Validación Incompleta'
      );
      return;
    }

    showToast(
      `Solicitud de autorización enviada con éxito a la Jefatura para la proforma ${proformaId}.`,
      'success',
      6000,
      'Solicitud enviada'
    );
    setTimeout(() => {
      router.push(`/?highlight=${proformaId}&toast=solicitada&v2=true&monto=${montoAjustado}`);
    }, 1200);
  };

  // FILTRADO DE SKUS SEGÚN PESTAÑA Y TÉRMINO DE BÚSQUEDA
  const filteredSkus = skusList.filter((s) => {
    const matchesSearch =
      s.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'accion') {
      return s.estadoValidacion === 'Pendiente_IA' || s.estadoValidacion === 'Pendiente_Manual';
    }
    if (activeTab === 'ia') {
      return s.tier === 'IA_Web';
    }
    if (activeTab === 'manual') {
      return s.tier === 'Manual_Requerido';
    }
    if (activeTab === 'historico') {
      return s.tier === 'Historico';
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Botón Volver y Selector de Modo */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-body text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al panel principal
        </Link>

        {/* Selector de Modo de Regularización */}
        <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-white/10 text-xs shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveFlowMode('pricing')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFlowMode === 'pricing'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Resolución Tarifas (Pricing)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFlowMode('medidas')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFlowMode === 'medidas'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Regularización por Medidas (SKU)</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          VISTA 1: FLUJO DE TARIFAS CORREGIDAS POR PRICING (RECOMENDADA)
         ══════════════════════════════════════════════════════════════════════ */}
      {activeFlowMode === 'pricing' ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Encabezado Principal Pricing */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-sky-300 dark:border-sky-500/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-extrabold text-micro bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 px-2.5 py-0.5 rounded-md">
                  {proformaId}
                </span>
                <span className="text-micro font-bold text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/15 border border-sky-300 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                  <Tag className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                  Rechazada por Tarifa/Precio · Resuelta por Pricing
                </span>
              </div>
              <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100">
                Actualizar Proforma con Nuevas Tarifas de Pricing
              </h1>
              <p className="text-caption text-gray-600 dark:text-gray-400 mt-1">
                El equipo de Pricing corrigió los tramos tarifarios en el maestro. Revisa el impacto económico del nuevo valor y genera la versión V2 para enviarla a visto bueno de Jefatura.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDescargarDetallePricing}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-sky-300 dark:border-sky-500/30 hover:bg-sky-50 dark:hover:bg-sky-500/10 text-sky-800 dark:text-sky-300 rounded-xl text-caption font-bold transition-all inline-flex items-center gap-2 shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Detalle Tarifario</span>
              </button>
            </div>
          </div>

          {/* Grid en 2 Columnas: Detalle Original V1 (Izquierda) + Resolución de Pricing (Derecha) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Columna Izquierda: Detalle de la Proforma Original V1 */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-900/10 dark:border-white/10 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <h3 className="text-h2 font-bold text-gray-900 dark:text-gray-100">
                      Detalle de la Proforma Original
                    </h3>
                  </div>
                  <span className="text-micro font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                    Versión 1
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-caption">
                  <div>
                    <span className="text-micro text-gray-500 dark:text-gray-400 block font-medium">Cliente</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-body">
                      Retail Logistics Chile S.A.
                    </span>
                    <span className="text-micro font-mono text-gray-400 block">RUT: 76.452.120-K</span>
                  </div>

                  <div>
                    <span className="text-micro text-gray-500 dark:text-gray-400 block font-medium">Cuenta Corriente</span>
                    <span className="font-mono font-bold text-purple-700 dark:text-purple-400 text-body block">
                      CTA-001
                    </span>
                    <span className="text-micro text-gray-400">Santiago Centro Distribución</span>
                  </div>

                  <div>
                    <span className="text-micro text-gray-500 dark:text-gray-400 block font-medium">Total OFs Involucradas</span>
                    <span className="font-mono font-extrabold text-gray-900 dark:text-gray-100 text-body">
                      500 Órdenes de Flete
                    </span>
                  </div>

                  <div>
                    <span className="text-micro text-gray-500 dark:text-gray-400 block font-medium">Monto Original Facturado</span>
                    <span className="font-mono font-extrabold text-gray-900 dark:text-gray-100 text-body">
                      {formatCurrency(pricingMontoOriginal)}
                    </span>
                  </div>
                </div>

                {/* Motivo de Rechazo por Precio */}
                <div className="p-3.5 bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-caption text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Objeción de Tarifa / Precio del Cliente:</strong>
                    <p className="text-micro text-rose-800 dark:text-rose-300 mt-0.5">
                      "La tarifa unitaria aplicada por bulto no coincide con la adenda de contrato 2026 negociada para distribución central."
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-micro text-gray-400 font-medium">
                💡 Esta proforma fue derivada y resuelta directamente por el equipo de Pricing.
              </div>
            </div>

            {/* Columna Derecha: Resolución de Pricing */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-sky-300 dark:border-sky-500/30 p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center font-bold">
                      <Tag className="w-4 h-4" />
                    </div>
                    <h3 className="text-h2 font-bold text-gray-900 dark:text-gray-100">
                      Resolución y Dictamen de Pricing
                    </h3>
                  </div>
                  <span className="text-micro font-extrabold text-sky-900 dark:text-sky-200 bg-sky-100 dark:bg-sky-500/20 border border-sky-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                    Tarifa Corregida en Maestro
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-caption">
                  <div className="bg-sky-50/50 dark:bg-sky-950/20 p-2.5 rounded-xl border border-sky-100 dark:border-sky-900/30">
                    <span className="text-micro font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                      Analista Pricing
                    </span>
                    <strong className="text-gray-900 dark:text-gray-100 font-bold block">
                      Carlos Mendoza
                    </strong>
                    <span className="text-[10px] text-sky-700 dark:text-sky-400">Jefe de Pricing Starken</span>
                  </div>

                  <div className="bg-sky-50/50 dark:bg-sky-950/20 p-2.5 rounded-xl border border-sky-100 dark:border-sky-900/30">
                    <span className="text-micro font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                      Fecha / Ticket
                    </span>
                    <strong className="text-gray-900 dark:text-gray-100 font-mono block">
                      Hoy 11:45 hrs
                    </strong>
                    <span className="text-[10px] text-gray-400 font-mono">Ticket #PRC-2026-0941</span>
                  </div>
                </div>

                {/* Dictamen Técnico de Pricing */}
                <div className="p-3.5 bg-sky-50/80 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 rounded-xl text-caption text-sky-950 dark:text-sky-200 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Dictamen Técnico y Corrección Aplicada:</strong>
                    <p className="text-micro text-sky-900 dark:text-sky-300 mt-0.5 leading-relaxed">
                      "Se verificó la cláusula 4.2 del anexo 2026. Se redujo la tarifa base unitaria de <strong>$13.600</strong> a <strong>$11.800</strong> para el tramo metropolitano y regional. El recálculo automático aplica a las 500 órdenes de flete."
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-micro text-sky-800 dark:text-sky-300 font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-sky-600" />
                <span>Las nuevas tarifas ya están sincronizadas en el motor de tarificación.</span>
              </div>
            </div>
          </div>

          {/* Bloque Comparativo de Impacto Económico y Emisión V2 */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-900/10 dark:border-white/10 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-h2 font-bold text-gray-900 dark:text-gray-100">
                    Comparativo de Impacto Económico y Emisión V2
                  </h3>
                  <p className="text-caption text-gray-500 dark:text-gray-400">
                    Resumen del ajuste tarifario calculado para las 500 órdenes de flete
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 text-emerald-800 dark:text-emerald-300 rounded-full text-micro font-extrabold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Recálculo 100% Validado
              </span>
            </div>

            {/* 3 Métricas Destacadas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-white/10 space-y-1">
                <span className="text-micro font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                  Monto Original (V1)
                </span>
                <span className="text-2xl font-mono font-extrabold text-gray-900 dark:text-gray-100 block">
                  {formatCurrency(pricingMontoOriginal)}
                </span>
                <span className="text-micro text-gray-400">Tarifa previa objetada</span>
              </div>

              <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 space-y-1">
                <span className="text-micro font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider block flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5 text-sky-600" /> Ajuste Tarifario Pricing
                </span>
                <span className="text-2xl font-mono font-extrabold text-sky-700 dark:text-sky-300 block">
                  {formatCurrency(pricingAjuste)} ({pricingPorcentaje}%)
                </span>
                <span className="text-micro text-sky-700 dark:text-sky-400">Diferencia a favor del cliente</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-400 dark:border-emerald-600/50 space-y-1 shadow-2xs">
                <span className="text-micro font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Nuevo Monto Facturable (V2)
                </span>
                <span className="text-2xl font-mono font-extrabold text-emerald-700 dark:text-emerald-300 block">
                  {formatCurrency(pricingMontoV2)}
                </span>
                <span className="text-micro text-emerald-700 dark:text-emerald-400 font-bold">Monto final de la nueva proforma</span>
              </div>
            </div>

            {/* Tabla Detalle por Tramo */}
            <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden text-caption">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-slate-900/80 text-micro text-gray-600 dark:text-gray-400 uppercase font-bold border-b border-gray-200 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-4">Tramo / Servicio</th>
                    <th className="py-3 px-4 text-center">OFs Involucradas</th>
                    <th className="py-3 px-4 text-right">Tarifa Original V1</th>
                    <th className="py-3 px-4 text-right">Tarifa Corregida Pricing (V2)</th>
                    <th className="py-3 px-4 text-right">Subtotal Facturable V2</th>
                    <th className="py-3 px-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 font-mono">
                  <tr className="hover:bg-purple-50/30 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-sans font-bold text-gray-900 dark:text-gray-100">
                      Distribución Metropolitana (RM)
                    </td>
                    <td className="py-3 px-4 text-center font-bold">320 OFs</td>
                    <td className="py-3 px-4 text-right text-gray-400 line-through">$13.600</td>
                    <td className="py-3 px-4 text-right font-bold text-sky-700 dark:text-sky-400">$11.800</td>
                    <td className="py-3 px-4 text-right font-extrabold text-gray-900 dark:text-gray-100">
                      $3.776.000
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 rounded text-micro font-sans font-bold">
                        ✓ Corregido
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-purple-50/30 dark:hover:bg-white/5">
                    <td className="py-3 px-4 font-sans font-bold text-gray-900 dark:text-gray-100">
                      Distribución Regional (V Región)
                    </td>
                    <td className="py-3 px-4 text-center font-bold">180 OFs</td>
                    <td className="py-3 px-4 text-right text-gray-400 line-through">$13.600</td>
                    <td className="py-3 px-4 text-right font-bold text-sky-700 dark:text-sky-400">$11.800</td>
                    <td className="py-3 px-4 text-right font-extrabold text-gray-900 dark:text-gray-100">
                      $2.124.000
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300 rounded text-micro font-sans font-bold">
                        ✓ Corregido
                      </span>
                    </td>
                  </tr>

                  <tr className="bg-purple-50/40 dark:bg-slate-900 font-bold border-t-2 border-purple-200 dark:border-purple-800/40">
                    <td className="py-3 px-4 font-sans font-extrabold text-purple-950 dark:text-purple-200">
                      Total Consolidado Proforma V2
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-purple-900 dark:text-purple-300">
                      500 OFs
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">-</td>
                    <td className="py-3 px-4 text-right text-gray-400">-</td>
                    <td className="py-3 px-4 text-right font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                      {formatCurrency(pricingMontoV2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 rounded text-micro font-sans font-extrabold">
                        Listo para Emisión
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Botones de Acción de Pricing */}
            <div className="flex items-center justify-between pt-2 flex-wrap gap-4 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={handleDescargarDetallePricing}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-xl text-caption font-bold transition-all inline-flex items-center gap-2 shadow-2xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Detalle Tarifario (Excel)</span>
              </button>

              <button
                type="button"
                onClick={handleGenerarProformaV2Pricing}
                className="px-6 py-3 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-caption font-extrabold shadow-md shadow-purple-700/25 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Generar y Solicitar Autorización Jefatura (V2) ➔</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════
            VISTA 2: FLUJO DE REGULARIZACIÓN POR MEDICIONES / CUBITAJE (SKU)
           ══════════════════════════════════════════════════════════════════════ */
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Encabezado Principal con Botón de Descarga */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-purple-900/10 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono font-extrabold text-micro bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 px-2.5 py-0.5 rounded-md">
                  {proformaId}
                </span>
                <span className="text-micro font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/15 px-2 py-0.5 rounded-md">
                  Rechazada por Medidas/Cubitaje (v1)
                </span>
              </div>
              <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-100">
                Actualizar y Regularizar Proforma por SKU
              </h1>
              <p className="text-caption text-gray-600 dark:text-gray-400 mt-1">
                Descarga la planilla base, ajusta las mediciones y procesa el cruce automatizado contra el maestro y agente IA.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadPlantilla}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-purple-200 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-xl text-caption font-bold transition-all inline-flex items-center gap-2 shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Planilla Base</span>
              </button>
            </div>
          </div>

      {/* Grid en 2 Columnas: Detalle de Proforma Actual (Izquierda) + Carga de Planilla (Derecha) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Columna Izquierda: Detalle de la Proforma Actual */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-900/10 dark:border-white/10 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="text-h2 font-bold text-gray-900 dark:text-gray-100">
                  Detalle de la Proforma Actual
                </h3>
              </div>
              <span className="text-micro font-extrabold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                Versión 1
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-caption">
              <div>
                <span className="text-micro text-gray-500 dark:text-gray-400 block font-medium">Cliente</span>
                <span className="font-bold text-gray-900 dark:text-gray-100 text-body">
                  Retail Logistics Chile S.A.
                </span>
                <span className="text-micro font-mono text-gray-400 block">RUT: 76.452.120-K</span>
              </div>

              <div>
                <span className="text-micro text-gray-500 dark:text-gray-400 block font-medium">Cuenta Corriente</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-400 text-body block">
                  CTA-001
                </span>
                <span className="text-micro text-gray-400">Santiago Centro Distribución</span>
              </div>

              <div>
                <span className="text-micro text-gray-500 dark:text-gray-400 block font-medium">Total OFs Involucradas</span>
                <span className="font-mono font-extrabold text-gray-900 dark:text-gray-100 text-body">
                  {totalOfsCount} Órdenes de Flete
                </span>
              </div>

              <div>
                <span className="text-micro text-gray-500 dark:text-gray-400 block font-medium">Monto Original Facturado</span>
                <span className="font-mono font-extrabold text-gray-900 dark:text-gray-100 text-body">
                  {formatCurrency(montoOriginal)}
                </span>
              </div>
            </div>

            {/* Motivo de Rechazo */}
            <div className="p-3.5 bg-rose-50/80 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-caption text-rose-900 dark:text-rose-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Motivo del rechazo del cliente:</strong>
                <p className="text-micro text-rose-800 dark:text-rose-300 mt-0.5">
                  Diferencia en recubitaje / medidas de SKUs. Requiere recalcular con medidas verificadas.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 text-micro text-gray-400 font-medium">
            💡 Al regularizar las medidas se generará la <strong>Versión V2</strong> de la proforma.
          </div>
        </div>

        {/* Columna Derecha: Carga de Planilla con Mediciones */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-900/10 dark:border-white/10 p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <h3 className="text-h2 font-bold text-gray-900 dark:text-gray-100">
                  Carga de Planilla con Mediciones
                </h3>
              </div>

              {hasProcessed && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 rounded-full text-micro font-bold">
                  <CheckCircle2 className="w-3 h-3" /> Procesada
                </span>
              )}
            </div>

            <p className="text-caption text-gray-600 dark:text-gray-300">
              Sube la planilla con las medidas revisadas para cruzar automáticamente contra el histórico, agente IA y validar discrepancias.
            </p>

            {/* Dropzone */}
            <div className="border-2 border-dashed border-gray-300 dark:border-white/15 hover:border-purple-500 rounded-2xl p-5 bg-gray-50/50 dark:bg-white/5 transition-all text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileDrop}
                className="hidden"
                id="planilla-sku-input"
              />
              <label
                htmlFor="planilla-sku-input"
                className="cursor-pointer flex flex-col items-center justify-center gap-2"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-caption font-bold text-gray-800 dark:text-gray-200">
                    {selectedFile ? selectedFile.name : 'Haz clic para seleccionar o arrastra la planilla'}
                  </p>
                  <p className="text-micro text-gray-400 mt-0.5">Formatos soportados: Excel (.xlsx) o CSV</p>
                </div>
                <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-micro font-bold mt-1 border border-purple-200 dark:border-purple-800/40">
                  {selectedFile ? 'Cambiar archivo' : 'Examinar archivo'}
                </span>
              </label>
            </div>
          </div>

          {/* Botón Procesar */}
          <div>
            <button
              type="button"
              onClick={handleSimularProcesarSku}
              disabled={isProcessingSku}
              className={`w-full py-3.5 px-4 rounded-xl text-body font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isProcessingSku
                  ? 'bg-purple-400 cursor-wait'
                  : `bg-gradient-to-r ${theme.buttonGradient} hover:shadow-md active:scale-98`
              }`}
            >
              {isProcessingSku ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Cruzando SKUs con IA y Maestro...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Procesar y Cruzar SKUs</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* PASO 2: Panel de Resolución de SKUs en 3 Tiers (SOLO VISIBLE TRAS PROCESAR) */}
      {hasProcessed && (
        <div ref={resultadoRef} className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Barra Superior de Métricas y Progreso (Opción 2: Foco en OFs resueltas vs pendientes) */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-900/10 dark:border-white/10 p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-body text-gray-900 dark:text-gray-100">
                    Avance de Regularización de OFs
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-micro font-extrabold ${
                      todoValidado
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                        : 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300'
                    }`}
                  >
                    {todoValidado ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                    {skusValidados} de {totalSkus} SKUs listos
                  </span>
                </div>

                <p className="text-caption text-gray-600 dark:text-gray-400 font-medium">
                  {todoValidado ? (
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                      ¡Las {totalOfsCount} OFs están regularizadas y listas para enviar!
                    </span>
                  ) : (
                    <span>
                      <strong className="text-purple-700 dark:text-purple-300 font-bold">{ofsValidadas} OFs</strong> regularizadas ·{' '}
                      <strong className="text-amber-700 dark:text-amber-400 font-bold">{ofsPendientes} OFs</strong> pendientes de acción
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                <span className={`text-body font-extrabold ${todoValidado ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-700 dark:text-purple-300'}`}>
                  {porcentajeOfs}%
                </span>
                <span className="text-caption font-medium text-gray-500 dark:text-gray-400">
                  completado
                </span>
              </div>
            </div>

            {/* Barra de Progreso Visual */}
            <div className="w-full h-3 bg-gray-100 dark:bg-slate-900/80 rounded-full overflow-hidden p-0.5 border border-gray-200/60 dark:border-white/10">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  todoValidado ? 'bg-emerald-500 shadow-xs' : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                }`}
                style={{ width: `${porcentajeOfs}%` }}
              />
            </div>
          </div>

        {/* Pestañas de Filtrado (Inbox de Tareas) */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-900/10 dark:border-white/10 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-purple-900/10 dark:border-white/10 bg-purple-50/20 dark:bg-white/5 flex items-center justify-between gap-4 flex-wrap">
            {/* Pestañas */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setActiveTab('todos')}
                className={`px-3.5 py-1.5 rounded-xl text-caption font-bold transition-all cursor-pointer ${
                  activeTab === 'todos'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-purple-100 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-white/5'
                }`}
              >
                Todos ({skusList.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('accion')}
                className={`px-3.5 py-1.5 rounded-xl text-caption font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'accion'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                }`}
              >
                <span>🚨 Requieren Acción</span>
                <span className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-500/30 text-rose-800 dark:text-rose-200 text-[10px] flex items-center justify-center">
                  {skusList.filter((s) => s.estadoValidacion === 'Pendiente_IA' || s.estadoValidacion === 'Pendiente_Manual').length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ia')}
                className={`px-3.5 py-1.5 rounded-xl text-caption font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'ia'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-purple-200 dark:border-purple-500/20 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Sugerencias IA ({skusList.filter((s) => s.tier === 'IA_Web').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`px-3.5 py-1.5 rounded-xl text-caption font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'manual'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Búsqueda Manual ({skusList.filter((s) => s.tier === 'Manual_Requerido').length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('historico')}
                className={`px-3.5 py-1.5 rounded-xl text-caption font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'historico'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Histórico Starken ({skusList.filter((s) => s.tier === 'Historico').length})</span>
              </button>
            </div>

            {/* Búsqueda rápida */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filtrar por SKU o descripción..."
                className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900/50 border border-purple-900/15 dark:border-white/10 rounded-lg text-caption outline-none focus:border-purple-600"
              />
            </div>
          </div>

          {/* TABLA DE SKUs */}
          <div className="overflow-x-auto">
              <table className="w-full text-left text-body">
                <thead className="bg-purple-50/40 dark:bg-white/5 border-b border-purple-900/10 dark:border-white/10 text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider text-micro">
                  <tr>
                    <th className="py-3.5 px-5">SKU & Descripción</th>
                    <th className="py-3.5 px-5">OFs Afectadas</th>
                    <th className="py-3.5 px-5">Declarado por Cliente</th>
                    <th className="py-3.5 px-5">Sugerencia Medidas</th>
                    <th className="py-3.5 px-5">Estado</th>
                    <th className="py-3.5 px-5 text-right">Acción Requerida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filteredSkus.map((item) => {
                    const isVal = item.estadoValidacion === 'Validado_Auto' || item.estadoValidacion === 'Validado_Humano';
                    const isIa = item.tier === 'IA_Web';
                    const isManual = item.tier === 'Manual_Requerido';
                    const isHist = item.tier === 'Historico';

                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          !isVal
                            ? 'bg-rose-50/30 dark:bg-rose-950/10 hover:bg-rose-50/50'
                            : 'hover:bg-purple-50/30 dark:hover:bg-white/5'
                        }`}
                      >
                        {/* SKU y Descripción */}
                        <td className="py-4 px-5">
                          <div>
                            <span className="font-mono font-extrabold text-body text-purple-900 dark:text-purple-300">
                              {item.sku}
                            </span>
                            <p className="text-micro text-gray-500 dark:text-gray-400 line-clamp-1 max-w-xs">
                              {item.descripcion}
                            </p>
                          </div>
                        </td>

                        {/* Total OFs asociadas */}
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-100/70 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 font-mono font-extrabold text-micro">
                            <Layers className="w-3 h-3" />
                            {item.totalOfs} OFs
                          </span>
                        </td>

                        {/* Declarado por cliente */}
                        <td className="py-4 px-5 font-mono text-caption text-gray-700 dark:text-gray-300">
                          <div>
                            <span className="font-bold">{item.pesoDeclaradoKg} kg</span>
                            <span className="text-micro text-gray-400 block">
                              {item.dimensionesDeclaradasCm.largo}x{item.dimensionesDeclaradasCm.ancho}x{item.dimensionesDeclaradasCm.alto} cm
                            </span>
                          </div>
                        </td>

                        {/* COLUMNA UNIFICADA: Sugerencia Medidas */}
                        <td className="py-4 px-5">
                          <div className="space-y-1.5">
                            {/* Origen del dato */}
                            {isHist && (
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 text-micro font-bold text-emerald-700 dark:text-emerald-400">
                                  <Database className="w-3.5 h-3.5" /> Maestro Starken
                                </span>
                              </div>
                            )}

                            {isIa && (
                              <div>
                                {item.modificadoPorAnalista ? (
                                  <div className="space-y-1">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/30">
                                      <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Modificado por Analista
                                    </span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 block font-mono">
                                      Sugerencia IA original: {item.datosIa?.pesoKg}kg ({item.datosIa?.dimensionesCm.largo}x{item.datosIa?.dimensionesCm.ancho}x{item.datosIa?.dimensionesCm.alto} cm)
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    <span className="inline-flex items-center gap-1 text-micro font-bold text-purple-700 dark:text-purple-300">
                                      <Bot className="w-3.5 h-3.5" /> Agente IA Web
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {isManual && (
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                {item.evidenciaManual?.sinEvidencia ? (
                                  <span
                                    className="inline-flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 rounded border border-amber-300 dark:border-amber-500/30"
                                    title={item.evidenciaManual.motivoSinEvidencia}
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Sin evidencia web · Objeción cliente
                                  </span>
                                ) : item.evidenciaManual ? (
                                  <span className="inline-flex items-center gap-1 text-micro font-bold text-emerald-700 dark:text-emerald-400">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Evidencia Adjunta
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-micro font-bold text-amber-700 dark:text-amber-400">
                                    <AlertTriangle className="w-3.5 h-3.5" /> Sin Match en Web
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Medidas en líneas separadas */}
                            <div className="font-mono text-caption">
                              <span className="font-extrabold text-gray-900 dark:text-gray-100 block">
                                {item.pesoFinalKg} kg
                              </span>
                              <span className="text-micro text-gray-500 dark:text-gray-400 block">
                                {item.dimensionesFinalesCm.largo}x{item.dimensionesFinalesCm.ancho}x{item.dimensionesFinalesCm.alto} cm
                              </span>
                              {item.modificadoPorAnalista && (
                                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block">
                                  ✏️ Ajuste manual aplicado
                                </span>
                              )}
                            </div>

                            {/* Enlace ver fuente web si existe */}
                            {item.datosIa?.fuenteUrl && (
                              <a
                                href={item.datosIa.fuenteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                              >
                                <span>Ver fuente web IA</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}

                            {!item.evidenciaManual?.sinEvidencia && item.evidenciaManual?.urlProveedor && (
                              <a
                                href={item.evidenciaManual.urlProveedor}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                              >
                                <span>Ver fuente web</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Estado */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          {isVal ? (
                            item.tier === 'IA_Web' && item.modificadoPorAnalista ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-micro font-extrabold bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 whitespace-nowrap">
                                <UserCheck className="w-3.5 h-3.5" /> Ajuste Manual
                              </span>
                            ) : item.tier === 'IA_Web' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-micro font-extrabold bg-purple-50 dark:bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-300 whitespace-nowrap">
                                <Bot className="w-3.5 h-3.5" /> Validado IA
                              </span>
                            ) : item.tier === 'Historico' ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-micro font-extrabold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 whitespace-nowrap">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Maestro Starken
                              </span>
                            ) : item.evidenciaManual?.sinEvidencia ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-micro font-extrabold bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 whitespace-nowrap">
                                <UserCheck className="w-3.5 h-3.5" /> Ajuste Manual
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-micro font-extrabold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300 whitespace-nowrap">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Evidencia Validada
                              </span>
                            )
                          ) : item.estadoValidacion === 'Pendiente_IA' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-micro font-extrabold bg-purple-50 dark:bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-300 animate-pulse whitespace-nowrap">
                              <Bot className="w-3.5 h-3.5" /> Requiere V°B° IA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-micro font-extrabold bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-300 animate-pulse whitespace-nowrap">
                              <AlertTriangle className="w-3.5 h-3.5" /> Búsqueda Manual
                            </span>
                          )}
                        </td>

                        {/* Acciones Requeridas */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Caso IA: Aceptar o Modificar */}
                            {item.tier === 'IA_Web' && (
                              isVal ? (
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span className="text-micro text-gray-400 font-medium italic">
                                    {item.modificadoPorAnalista ? 'Ajuste manual' : 'Validado IA'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditIaModal(item)}
                                    title="Modificar / Re-editar medidas manualmente"
                                    className="p-1.5 bg-white dark:bg-slate-700 border border-amber-200 dark:border-white/10 hover:bg-amber-50 text-amber-700 dark:text-amber-300 rounded-lg text-micro font-bold transition-all cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleAprobarSugerenciaIa(item)}
                                    title="Aceptar sugerencia de IA para este SKU"
                                    className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-micro font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Aceptar IA</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditIaModal(item)}
                                    title="Modificar manualmente las medidas de la IA"
                                    className="p-1.5 bg-white dark:bg-slate-700 border border-purple-200 dark:border-white/10 hover:bg-purple-50 text-purple-700 dark:text-purple-300 rounded-lg text-micro font-bold transition-all cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )
                            )}

                            {/* Caso Manual: Adjuntar Evidencia */}
                            {item.tier === 'Manual_Requerido' && (
                              <button
                                type="button"
                                onClick={() => handleOpenManualEvidenceModal(item)}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-micro font-bold transition-all shadow-2xs whitespace-nowrap cursor-pointer"
                              >
                                {item.evidenciaManual ? 'Editar Evidencia' : '+ Adjuntar Evidencia'}
                              </button>
                            )}

                            {/* Caso Histórico: Ya está resuelto */}
                            {item.tier === 'Historico' && (
                              <span className="text-micro text-gray-400 font-medium italic pr-2">
                                Auto-resuelto
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
        </div>

        {/* Resumen Financiero y Botones Finales */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-900/10 dark:border-white/10 p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-white/10">
            <div>
              <span className="text-caption text-gray-500 font-medium">Monto Original Facturado:</span>
              <p className="text-xl font-bold text-gray-400 line-through">
                {formatCurrency(montoOriginal)}
              </p>
            </div>

            <div className="text-right">
              <span className="text-caption text-purple-700 dark:text-purple-400 font-bold block">
                NUEVO MONTO REGULARIZADO STARKEN:
              </span>
              <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                {formatCurrency(montoAjustado)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleDescargarNuevaProforma}
              className="w-full sm:w-auto px-5 py-3 bg-white dark:bg-slate-700 border border-purple-200 dark:border-white/10 hover:bg-purple-50 text-purple-700 dark:text-purple-300 rounded-xl text-body font-bold transition-all shadow-2xs inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Nueva Proforma (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handleSolicitarAutorizacionEnvio}
              disabled={!todoValidado}
              title={
                !todoValidado
                  ? 'Debes validar el 100% de los SKUs (IA y Manual) antes de enviar'
                  : 'Enviar solicitud de autorización a Jefatura'
              }
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-body font-extrabold text-white shadow-sm transition-all inline-flex items-center justify-center gap-2 ${
                !todoValidado
                  ? 'bg-gray-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
                  : `bg-gradient-to-r ${theme.buttonGradient} hover:shadow-md active:scale-98 cursor-pointer`
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Solicitar autorización de envío de proforma</span>
            </button>
          </div>
        </div>
      </div>
      )}
    </div>
  )}

      {/* ─── MODAL 1: REVISAR / MODIFICAR SUGERENCIA IA (TIER 2) ─── */}
      {editingIaItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-purple-900/10 dark:border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-mono text-micro font-bold text-purple-700 dark:text-purple-400">
                    {editingIaItem.sku}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    Ajustar Medidas del SKU (Sobrescribir IA)
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingIaItem(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Aviso de Auditoría y Trazabilidad */}
            <div className="p-3 bg-amber-50/80 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800/40 text-caption flex items-start gap-2.5 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-micro leading-relaxed">
                <span className="font-bold block text-amber-950 dark:text-amber-100">Registro de Cambio Manual:</span>
                Al guardar modificaciones aquí, este SKU quedará registrado con trazabilidad como <strong>Modificado manualmente por Analista</strong> y no como validado por IA.
              </div>
            </div>

            {/* Ficha técnica web encontrada por IA */}
            <div className="p-3 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800/30 text-caption space-y-1">
              <span className="font-bold text-purple-950 dark:text-purple-200 block text-micro">
                Fuente Web Encontrada por IA:
              </span>
              <a
                href={editingIaItem.datosIa?.fuenteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-purple-700 dark:text-purple-400 hover:underline break-all block font-mono text-micro"
              >
                {editingIaItem.datosIa?.fuenteUrl} ↗
              </a>
              <div className="flex items-center justify-between text-micro text-gray-500 dark:text-gray-400 pt-1 border-t border-purple-100 dark:border-purple-900/40 mt-1">
                <span>Sugerencia IA original:</span>
                <span className="font-mono font-bold text-gray-700 dark:text-gray-300">
                  {editingIaItem.datosIa?.pesoKg} kg · {editingIaItem.datosIa?.dimensionesCm.largo}x{editingIaItem.datosIa?.dimensionesCm.ancho}x{editingIaItem.datosIa?.dimensionesCm.alto} cm
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-caption font-bold text-gray-700 dark:text-gray-300 block">
                Nuevas Medidas Definitivas (Ajuste Manual)
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-micro font-medium text-gray-500 block mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={iaFormPeso}
                    onChange={(e) => setIaFormPeso(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg font-mono font-bold text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-micro font-medium text-gray-500 block mb-1">Largo (cm)</label>
                  <input
                    type="number"
                    value={iaFormLargo}
                    onChange={(e) => setIaFormLargo(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg font-mono font-bold text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-micro font-medium text-gray-500 block mb-1">Ancho (cm)</label>
                  <input
                    type="number"
                    value={iaFormAncho}
                    onChange={(e) => setIaFormAncho(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg font-mono font-bold text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                <div>
                  <label className="text-micro font-medium text-gray-500 block mb-1">Alto (cm)</label>
                  <input
                    type="number"
                    value={iaFormAlto}
                    onChange={(e) => setIaFormAlto(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg font-mono font-bold text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setEditingIaItem(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 font-bold text-caption rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEditedIa}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-caption rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: ADJUNTAR EVIDENCIA MANUAL O ACEPTAR OBJECIÓN (TIER 3) ─── */}
      {manualEvidenceItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-purple-900/10 dark:border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4 text-left max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-mono text-micro font-bold text-amber-700 dark:text-amber-400">
                    {manualEvidenceItem.sku}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight">
                    Gestión de SKU Manual ({manualEvidenceItem.totalOfs} OFs)
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setManualEvidenceItem(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Subtítulo dinámico */}
            <p className="text-caption text-gray-600 dark:text-gray-300">
              {sinEvidenciaEncontrada
                ? 'No se encontró ficha técnica pública. Se aplicarán las medidas según la objeción/declaración del cliente.'
                : 'Ingresa el link y pantallazo de la ficha técnica oficial encontrada para este producto.'}
            </p>

            {/* Campos de Evidencia Web (URL y Captura) - Ocultos si no se encontró evidencia */}
            {!sinEvidenciaEncontrada && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* Campo 1: URL de la página del proveedor */}
                <div className="space-y-1">
                  <label className="text-caption font-bold text-gray-700 dark:text-gray-300 block">
                    Link / URL de la ficha técnica del proveedor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://tienda.cl/producto/sku-ejemplo"
                    className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-xl font-mono text-caption text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>

                {/* Campo 2: Screenshot / Captura de Pantalla */}
                <div className="space-y-1.5">
                  <label className="text-caption font-bold text-gray-700 dark:text-gray-300 block">
                    Captura / Pantallazo de Respaldo <span className="text-rose-500">*</span>
                  </label>

                  {manualFilePreview || manualFile ? (
                    <div className="p-2.5 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200 dark:border-white/10 rounded-xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileImage className="w-4 h-4 text-purple-600 shrink-0" />
                        <span className="text-caption font-bold text-gray-800 dark:text-gray-200 truncate">
                          {manualFile ? manualFile.name : 'ficha_tecnica_producto.png'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setManualFile(null);
                          setManualFilePreview(null);
                        }}
                        className="p-1 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-300 dark:border-white/15 rounded-xl p-3 bg-gray-50/50 dark:bg-white/5 text-center">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setManualFile(e.target.files[0]);
                            setManualFilePreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                        className="hidden"
                        id="manual-evidence-file"
                      />
                      <div className="flex flex-col items-center gap-1.5">
                        <Upload className="w-4 h-4 text-purple-600" />
                        <p className="text-caption font-bold text-gray-800 dark:text-gray-200">
                          Arrastra tu pantallazo de la ficha web
                        </p>
                        <div className="flex items-center gap-2 pt-0.5">
                          <label
                            htmlFor="manual-evidence-file"
                            className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-micro font-bold cursor-pointer"
                          >
                            Examinar
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setManualFilePreview('/demo_email_aprobado.png');
                              setManualFile(new File(['demo'], 'captura_ficha_tecnica.png', { type: 'image/png' }));
                            }}
                            className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 rounded-lg text-micro font-bold cursor-pointer"
                          >
                            Usar Demo
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SECCIÓN / CHECKBOX: SIN EVIDENCIA ENCONTRADA */}
            <div
              className={`p-3 rounded-xl border transition-all ${
                sinEvidenciaEncontrada
                  ? 'bg-amber-50/80 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30'
                  : 'bg-gray-50/60 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-gray-300'
              }`}
            >
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sinEvidenciaEncontrada}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSinEvidenciaEncontrada(checked);
                    if (checked) {
                      handleApplyDeclaradasCliente();
                    }
                  }}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                />
                <span className="text-caption font-bold text-gray-900 dark:text-gray-100">
                  No se encontró evidencia web
                </span>
              </label>

              {/* Campo de justificación al marcar el checkbox */}
              {sinEvidenciaEncontrada && (
                <div className="mt-2.5 pt-2.5 border-t border-amber-200/70 dark:border-white/10 space-y-1 animate-in fade-in duration-150">
                  <label className="text-micro font-bold text-amber-950 dark:text-amber-200 block">
                    Observación / Justificación del Analista:
                  </label>
                  <input
                    type="text"
                    value={motivoSinEvidencia}
                    onChange={(e) => setMotivoSinEvidencia(e.target.value)}
                    placeholder="Ej. No se encontró ficha técnica pública, se acepta declaración cliente"
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-amber-300 dark:border-white/10 rounded-lg text-caption text-gray-900 dark:text-gray-100 outline-none focus:border-amber-600"
                  />
                </div>
              )}
            </div>

            {/* Campo 3: Medidas a Aplicar */}
            <div className="space-y-2 pt-1 border-t border-gray-100 dark:border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-caption font-bold text-gray-700 dark:text-gray-300 block">
                  {sinEvidenciaEncontrada ? 'Medidas a Aplicar (Objeción del Cliente):' : 'Medidas Confirmadas de la Ficha Técnica:'}
                </label>
                <button
                  type="button"
                  onClick={handleApplyDeclaradasCliente}
                  className="text-micro text-purple-700 dark:text-purple-300 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  title="Cargar las medidas declaradas/objetadas originalmente por el cliente"
                >
                  <RefreshCw className="w-3 h-3" />
                  Cargar datos declarados por cliente
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-micro font-medium text-gray-500 block mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualFormPeso}
                    onChange={(e) => setManualFormPeso(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg font-mono font-bold text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-micro font-medium text-gray-500 block mb-1">Largo (cm)</label>
                  <input
                    type="number"
                    value={manualFormLargo}
                    onChange={(e) => setManualFormLargo(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg font-mono font-bold text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-micro font-medium text-gray-500 block mb-1">Ancho (cm)</label>
                  <input
                    type="number"
                    value={manualFormAncho}
                    onChange={(e) => setManualFormAncho(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg font-mono font-bold text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-micro font-medium text-gray-500 block mb-1">Alto (cm)</label>
                  <input
                    type="number"
                    value={manualFormAlto}
                    onChange={(e) => setManualFormAlto(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg font-mono font-bold text-body text-gray-900 dark:text-gray-100 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer con Botones */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                type="button"
                onClick={() => setManualEvidenceItem(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 font-bold text-caption rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveManualEvidence}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-caption font-extrabold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditarProformaPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Cargando editor de proforma...</div>}>
      <EditarProformaContent />
    </Suspense>
  );
}
