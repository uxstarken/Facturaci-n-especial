'use client';

import { useState, useRef } from 'react';
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

  // Tier 3: Manual con Evidencia
  evidenciaManual?: {
    urlProveedor: string;
    screenshotUrl: string;
    nombreArchivo: string;
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

export default function EditarProformaPage() {
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
  const [viewMode, setViewMode] = useState<'skus' | 'ofs'>('skus');
  const [searchTerm, setSearchTerm] = useState('');

  // MODAL PARA REVISAR / EDITAR SUGERENCIA IA
  const [editingIaItem, setEditingIaItem] = useState<SkuResolutionItem | null>(null);
  const [iaFormPeso, setIaFormPeso] = useState<number>(0);
  const [iaFormLargo, setIaFormLargo] = useState<number>(0);
  const [iaFormAncho, setIaFormAncho] = useState<number>(0);
  const [iaFormAlto, setIaFormAlto] = useState<number>(0);

  // MODAL PARA ADJUNTAR EVIDENCIA MANUAL (TIER 3)
  const [manualEvidenceItem, setManualEvidenceItem] = useState<SkuResolutionItem | null>(null);
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

  // CÁLCULO DE PROGRESO DE VALIDACIÓN
  const totalSkus = skusList.length;
  const skusValidados = skusList.filter(
    (s) => s.estadoValidacion === 'Validado_Auto' || s.estadoValidacion === 'Validado_Humano'
  ).length;
  const porcentajeProgreso = Math.round((skusValidados / totalSkus) * 100);
  const todoValidado = skusValidados === totalSkus;

  // TOTAL DE OFS INVOLUCRADAS
  const totalOfsCount = skusList.reduce((acc, s) => acc + s.totalOfs, 0);

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
              pesoFinalKg: s.datosIa?.pesoKg || s.pesoFinalKg,
              dimensionesFinalesCm: s.datosIa?.dimensionesCm || s.dimensionesFinalesCm,
            }
          : s
      )
    );
    showToast(
      `Sugerencia de IA aprobada para ${item.sku}. Se aplicó a las ${item.totalOfs} OFs del lote.`,
      'success',
      4500,
      'SKU Validado con Éxito'
    );
  };

  // ACCIÓN 2: ABRIR MODAL PARA MODIFICAR DATOS DE IA
  const handleOpenEditIaModal = (item: SkuResolutionItem) => {
    setEditingIaItem(item);
    setIaFormPeso(item.datosIa?.pesoKg || item.pesoDeclaradoKg);
    setIaFormLargo(item.datosIa?.dimensionesCm.largo || item.dimensionesDeclaradasCm.largo);
    setIaFormAncho(item.datosIa?.dimensionesCm.ancho || item.dimensionesDeclaradasCm.ancho);
    setIaFormAlto(item.datosIa?.dimensionesCm.alto || item.dimensionesDeclaradasCm.alto);
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
      `Medidas ajustadas manualmente para ${editingIaItem.sku}. Actualizadas ${editingIaItem.totalOfs} OFs.`,
      'success',
      4500,
      'Ajuste Manual Guardado'
    );
  };

  // ACCIÓN 3: ABRIR MODAL DE EVIDENCIA MANUAL (TIER 3)
  const handleOpenManualEvidenceModal = (item: SkuResolutionItem) => {
    setManualEvidenceItem(item);
    setManualUrl(item.evidenciaManual?.urlProveedor || 'https://tienda-oficial.cl/producto/' + item.sku.toLowerCase());
    setManualFilePreview(item.evidenciaManual?.screenshotUrl || null);
    setManualFormPeso(item.pesoFinalKg || item.pesoDeclaradoKg);
    setManualFormLargo(item.dimensionesFinalesCm.largo || item.dimensionesDeclaradasCm.largo);
    setManualFormAncho(item.dimensionesFinalesCm.ancho || item.dimensionesDeclaradasCm.ancho);
    setManualFormAlto(item.dimensionesFinalesCm.alto || item.dimensionesDeclaradasCm.alto);
  };

  const handleSaveManualEvidence = () => {
    if (!manualEvidenceItem) return;
    if (!manualUrl.trim()) {
      showToast('Por favor ingresa la URL de la página o ficha técnica del proveedor.', 'warning');
      return;
    }
    if (!manualFilePreview && !manualFile) {
      showToast('Debes adjuntar o usar una captura de respaldo de la ficha técnica.', 'warning');
      return;
    }

    setSkusList((prev) =>
      prev.map((s) =>
        s.id === manualEvidenceItem.id
          ? {
              ...s,
              estadoValidacion: 'Validado_Humano',
              evidenciaManual: {
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
      `Evidencia web registrada para ${manualEvidenceItem.sku}. Se aplicaron las medidas a las ${manualEvidenceItem.totalOfs} OFs.`,
      'success',
      5000,
      'Evidencia Registrada'
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
      {/* Botón Volver */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-body text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al panel principal
        </Link>
      </div>

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
          {/* Barra Superior de Métricas y Progreso */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-purple-900/10 dark:border-white/10 p-6 shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-body text-gray-900 dark:text-gray-100">
                    Resultado del Análisis y Cruzamiento por SKU
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-micro font-extrabold ${
                      todoValidado
                        ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-100 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300'
                    }`}
                  >
                    {skusValidados} de {totalSkus} SKUs Validados ({porcentajeProgreso}%)
                  </span>
                </div>
                <p className="text-caption text-gray-500 dark:text-gray-400">
                  {totalOfsCount} Órdenes de Flete (OFs) representadas en {totalSkus} SKUs únicos agrupados
                </p>
              </div>

              {/* Selector de Modo de Vista */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="bg-gray-100 dark:bg-slate-900/60 p-1 rounded-xl flex items-center gap-1 border border-gray-200 dark:border-white/10 text-micro font-bold">
                  <button
                    type="button"
                    onClick={() => setViewMode('skus')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'skus'
                        ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    🗂️ Por SKUs Agrupados ({totalSkus})
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('ofs')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === 'ofs'
                        ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 shadow-xs'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                  >
                    📄 Por OFs Individuales ({totalOfsCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Barra de Progreso Visual */}
            <div className="w-full h-2.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  todoValidado ? 'bg-emerald-500' : 'bg-gradient-to-r from-purple-600 to-indigo-600'
                }`}
                style={{ width: `${porcentajeProgreso}%` }}
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

          {/* TABLA DE SKUs (VISTA PREDETERMINADA AGRUPADA) */}
          {viewMode === 'skus' ? (
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
                          <div className="space-y-1">
                            {/* Origen del dato en una sola línea */}
                            {isHist && (
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 text-micro font-bold text-emerald-700 dark:text-emerald-400">
                                  <Database className="w-3.5 h-3.5" /> Maestro Starken
                                </span>
                              </div>
                            )}

                            {isIa && (
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 text-micro font-bold text-purple-700 dark:text-purple-300">
                                  <Bot className="w-3.5 h-3.5" /> Agente IA Web
                                </span>
                              </div>
                            )}

                            {isManual && (
                              <div className="flex items-center gap-1.5 whitespace-nowrap">
                                {item.evidenciaManual ? (
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
                                <span className="text-[10px] font-bold text-purple-600 block">
                                  ✏️ Editado manual
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
                                <span>Ver fuente web</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}

                            {item.evidenciaManual?.urlProveedor && (
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
                        <td className="py-4 px-5">
                          {isVal ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-micro font-extrabold bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                              <CheckCircle2 className="w-3 h-3" /> Validado
                            </span>
                          ) : item.estadoValidacion === 'Pendiente_IA' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-micro font-extrabold bg-purple-50 dark:bg-purple-500/15 text-purple-800 dark:text-purple-300 border border-purple-300 animate-pulse">
                              <Bot className="w-3 h-3" /> Requiere V°B° IA
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-micro font-extrabold bg-rose-50 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-300 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Búsqueda Manual
                            </span>
                          )}
                        </td>

                        {/* Acciones Requeridas */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Caso IA: Aceptar o Modificar */}
                            {item.tier === 'IA_Web' && (
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
                            )}

                            {/* Caso Manual: Adjuntar Evidencia */}
                            {item.tier === 'Manual_Requerido' && (
                              <button
                                type="button"
                                onClick={() => handleOpenManualEvidenceModal(item)}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-micro font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                <span>{item.evidenciaManual ? 'Editar Evidencia' : '+ Adjuntar Evidencia'}</span>
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
          ) : (
            /* VISTA DETALLADA POR OF (Para auditar las 500 órdenes) */
            <div className="p-4 space-y-3">
              <div className="p-3 bg-purple-50/50 dark:bg-white/5 rounded-xl border border-purple-100 dark:border-white/5 flex items-center justify-between text-caption">
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  Mostrando desglose individual de las <strong>{totalOfsCount} Órdenes de Flete</strong> asociadas:
                </span>
                <span className="text-micro text-purple-700 dark:text-purple-300 font-mono font-bold">
                  Lote consolidado
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 max-h-96 overflow-y-auto p-1">
                {skusList.flatMap((skuItem) =>
                  Array.from({ length: Math.min(skuItem.totalOfs, 10) }).map((_, idx) => (
                    <div
                      key={`${skuItem.id}-${idx}`}
                      className="p-2.5 bg-white dark:bg-slate-900/60 rounded-lg border border-gray-200 dark:border-white/10 text-caption space-y-1 shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-gray-900 dark:text-gray-100 text-micro">
                          OF-{9800 + idx * 7 + Number(skuItem.id.split('-')[1]) * 13}
                        </span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            skuItem.estadoValidacion === 'Validado_Auto' || skuItem.estadoValidacion === 'Validado_Humano'
                              ? 'bg-emerald-500'
                              : 'bg-rose-500 animate-pulse'
                          }`}
                        />
                      </div>
                      <p className="font-mono text-micro text-purple-700 dark:text-purple-400 font-bold truncate">
                        {skuItem.sku}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {skuItem.pesoFinalKg} kg · {skuItem.dimensionesFinalesCm.largo}x{skuItem.dimensionesFinalesCm.ancho}x{skuItem.dimensionesFinalesCm.alto} cm
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
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

      {/* ─── MODAL 1: REVISAR / MODIFICAR SUGERENCIA IA (TIER 2) ─── */}
      {editingIaItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-purple-900/10 dark:border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-5 text-left">
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
                    Revisión de Sugerencia del Agente IA
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

            <div className="p-3.5 bg-purple-50/60 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800/30 text-caption space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-purple-950 dark:text-purple-200">
                  Fuente Web Encontrada por IA:
                </span>
              </div>
              <a
                href={editingIaItem.datosIa?.fuenteUrl}
                target="_blank"
                rel="noreferrer"
                className="text-purple-700 dark:text-purple-400 hover:underline break-all block font-mono text-micro"
              >
                {editingIaItem.datosIa?.fuenteUrl} ↗
              </a>
              <p className="text-micro text-gray-500 dark:text-gray-400 pt-1">
                Afecta a <strong>{editingIaItem.totalOfs} OFs</strong> vinculadas a este SKU.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-caption font-bold text-gray-700 dark:text-gray-300 block">
                Verificar o Ajustar Medidas Definitivas
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
                <span>Guardar y Aplicar a {editingIaItem.totalOfs} OFs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: ADJUNTAR EVIDENCIA MANUAL WEB (TIER 3) ─── */}
      {manualEvidenceItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-purple-900/10 dark:border-white/10 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-5 text-left max-h-[90vh] overflow-y-auto">
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
                    Carga de Evidencia Web del Proveedor
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

            <p className="text-caption text-gray-600 dark:text-gray-300">
              La IA no encontró coincidencia automática. Debes validar manualmente el producto en la web del proveedor e ingresar los respaldos requeridos para <strong>{manualEvidenceItem.totalOfs} OFs</strong>.
            </p>

            {/* Campo 1: URL de la página del proveedor */}
            <div className="space-y-1.5">
              <label className="text-caption font-bold text-gray-700 dark:text-gray-300 block">
                Link / URL de la ficha técnica del proveedor <span className="text-rose-500">*</span>
              </label>
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://tienda.cl/producto/sku-ejemplo"
                className="w-full p-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-xl font-mono text-caption text-gray-900 dark:text-gray-100 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
            </div>

            {/* Campo 2: Screenshot / Captura de Pantalla */}
            <div className="space-y-2">
              <label className="text-caption font-bold text-gray-700 dark:text-gray-300 block">
                Captura / Pantallazo de Respaldo <span className="text-rose-500">*</span>
              </label>

              {manualFilePreview || manualFile ? (
                <div className="p-3 bg-purple-50/50 dark:bg-purple-900/10 border border-purple-200 dark:border-white/10 rounded-xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileImage className="w-5 h-5 text-purple-600 shrink-0" />
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
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-gray-300 dark:border-white/15 rounded-xl p-4 bg-gray-50/50 dark:bg-white/5 text-center">
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
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-5 h-5 text-purple-600" />
                    <p className="text-caption font-bold text-gray-800 dark:text-gray-200">
                      Arrastra tu pantallazo de la ficha web
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <label
                        htmlFor="manual-evidence-file"
                        className="px-3 py-1 bg-purple-600 text-white rounded-lg text-micro font-bold cursor-pointer"
                      >
                        Examinar
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setManualFilePreview('/demo_email_aprobado.png');
                          setManualFile(new File(['demo'], 'captura_ficha_tecnica.png', { type: 'image/png' }));
                        }}
                        className="px-3 py-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 rounded-lg text-micro font-bold cursor-pointer"
                      >
                        Usar Imagen Demo
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Campo 3: Medidas Confirmadas */}
            <div className="space-y-2">
              <label className="text-caption font-bold text-gray-700 dark:text-gray-300 block">
                Medidas Confirmadas de la Ficha Técnica
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-micro font-medium text-gray-500 block mb-1">Peso (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={manualFormPeso}
                    onChange={(e) => setManualFormPeso(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg font-mono font-bold text-body text-gray-900 dark:text-gray-100 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-micro font-medium text-gray-500 block mb-1">Largo (cm)</label>
                  <input
                    type="number"
                    value={manualFormLargo}
                    onChange={(e) => setManualFormLargo(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg font-mono font-bold text-body text-gray-900 dark:text-gray-100 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-micro font-medium text-gray-500 block mb-1">Ancho (cm)</label>
                  <input
                    type="number"
                    value={manualFormAncho}
                    onChange={(e) => setManualFormAncho(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg font-mono font-bold text-body text-gray-900 dark:text-gray-100 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="text-micro font-medium text-gray-500 block mb-1">Alto (cm)</label>
                  <input
                    type="number"
                    value={manualFormAlto}
                    onChange={(e) => setManualFormAlto(Number(e.target.value))}
                    className="w-full p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg font-mono font-bold text-body text-gray-900 dark:text-gray-100 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

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
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-caption rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Evidencia ({manualEvidenceItem.totalOfs} OFs)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
