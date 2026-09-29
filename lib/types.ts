export type Role = 'Ejecutivo' | 'Analista' | 'Jefatura' | 'Administrador' | 'Gerencia' | 'Pricing';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  requires2FA: boolean;
}

export type ProformaEstado =
  | 'Aprobada'
  | 'Pendiente'
  | 'Pendiente de validación'
  | 'Rechazada'
  | 'En revisión'
  | 'Aprobada por Cliente'
  | 'Facturado'
  | 'Rechazada v1'
  | 'Rechazada v2'
  | 'Derivada a KAM'
  | 'Derivada a CAM'
  | 'Enviado a Pricing'
  | 'Tarifas Corregidas por Pricing';

export type VersionProforma = 'v1' | 'v2' | 'v3';

export type EstadoSupervision =
  | 'Pendiente_Autorizacion' // Ejecutivo solicitó V°B° para esta versión
  | 'Autorizada'             // Supervisor/Jefatura autorizó el envío
  | 'Devuelta_Analista'      // Supervisor devolvió con observaciones al ejecutivo
  | 'Pricing_Resuelto'       // Pricing corrigió tarifas; ejecutivo debe recalcular
  | 'No_Requiere';           // V1 inicial o aprobada

export type EstadoComercial =
  | 'Borrador'
  | 'Enviada_Cliente'
  | 'Aprobada_Cliente'
  | 'Rechazada_Cliente'
  | 'Derivada_KAM'
  | 'Derivada_CAM'
  | 'Facturado';

export interface ProformaItem {
  id: string;
  codigo: string;
  descripcion: string;
  cantidad: number;
  tarifaBase: number;
  tarifaEsperada?: number;
  descuentoPct: number;
  descuentoEsperadoPct?: number;
  total: number;
  ajustadoEnV2?: boolean;
  servicio?: string;
  tramo?: string;
}

export interface VersionHistoryItem {
  version: 'v1' | 'v2' | 'v3';
  numeroVersion?: number;
  fechaCreacion: string;
  fechaRechazo?: string;
  fechaAprobacion?: string;
  usuarioResponsable?: string;
  motivo?: string;
  observaciones?: string;
  observacionesPricing?: string;
  cambiosRealizados?: string[];
  respaldoCorreoUrl?: string;
  monto: number;
  estado?: string;
  estadoSupervision?: EstadoSupervision;
  aprobadoPorSupervisor?: string;
  fechaSupervision?: string;
  items?: ProformaItem[];
}

export interface Proforma {
  id: string;
  cliente: string;
  rut: string;
  cuentaCorrienteId?: string;
  cuentaCorrienteNombre?: string;
  ejecutivoId?: string;
  ejecutivoNombre?: string;
  kamId?: string;
  kamNombre?: string;
  monto: number;
  montoFormatted: string;
  estado: ProformaEstado;
  versionActual?: VersionProforma;
  estadoSupervision?: EstadoSupervision;
  estadoComercial?: EstadoComercial;
  fecha: string;
  tipoAcuerdo: string;
  conteoRechazos?: number;
  historialVersiones?: VersionHistoryItem[];
  respaldoCorreo?: string;
  numeroFactura?: string;
  archivoFacturaNombre?: string;
  fechaFacturacion?: string;
  motivoRechazoPrincipal?: string;
  alertasElaboracion?: string[];
  tiempoGeneracionDias?: number;
  tiempoAprobacionDias?: number;

  // Campos Pricing & Tarifas
  servicio?: string;
  tipoCliente?: string;
  origen?: string;
  destino?: string;
  tipoEntrega?: 'Domicilio' | 'Sucursal' | 'Express' | 'Dedicado';
  tarifaEsperada?: number;
  tarifaAplicada?: number;
  descuentoEsperadoPct?: number;
  descuentoAplicadoPct?: number;
  variacionTarifaPct?: number;
  esExcepcionTarifaria?: boolean;
  tipoExcepcion?: string;
  motivoRechazoPricing?: string;
  observacionesPricing?: string;
  resolucionPricing?: 'Validada' | 'Corregida' | 'Rechazada_Definitiva' | 'Pendiente_KAM' | 'Pendiente_Revision';
  fechaResolucionPricing?: string;
  usuarioPricingResolucion?: string;
  salesforceOpportunityId?: string;
  salesforceSynced?: boolean;
  requiereRevisionKAM?: boolean;
}

export interface GlobalPricingFiltersState {
  periodo: 'hoy' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'todos';
  cliente: string;
  rut: string;
  cuentaCorriente: string;
  kam: string;
  ejecutivo: string;
  servicio: string;
  tipoCliente: string;
  origen: string;
  destino: string;
  tipoEntrega: string;
  motivoRechazo: string;
  tipoExcepcion: string;
  estadoProforma: string;
}

// -------------------------------------------------------------
// MODELOS PARA JEFE DE FACTURACIÓN
// -------------------------------------------------------------

export interface Executive {
  id: string;
  nombre: string;
  email: string;
  rut: string;
  telefono: string;
  avatar: string;
  clientesAsignadosCount: number;
  proformasTotales: number;
  proformasAprobadas: number;
  proformasRechazadas: number;
  proformasPendientes: number;
  proformasExpiradas: number;
  proformasConvertidas: number;
  tasaAprobacion: number;
  tasaRechazo: number;
  tiempoPromedioGeneracionDias: number;
  tiempoPromedioAprobacionDias: number;
  promedioVersiones: number;
  cantidadReprocesos: number;
}

export interface CondicionComercial {
  id: string;
  tipo: string;
  descuentoAcordado: string;
  plazoPagoDias: number;
  validezHasta: string;
  observaciones: string;
}

export interface CondicionTarifariaVigente {
  id: string;
  codigoServicio: string;
  nombreServicio: string;
  tarifaBaseContrato: number;
  descuentoAutorizadoPct: number;
  tarifaFinalCalculada: number;
  vigenciaDesde: string;
  vigenciaHasta: string;
  aprobadoPorPricing: string;
  tramo: string;
  esExcepcion: boolean;
}

export interface HistorialModificacionCliente {
  id: string;
  fecha: string;
  usuario: string;
  tipoModificacion: 'Asignación Ejecutivo' | 'Condición Comercial' | 'Datos Empresa' | 'Estado' | 'Ajuste Pricing';
  detalle: string;
  valorAnterior?: string;
  valorNuevo?: string;
}

export interface CuentaCorriente {
  id: string;
  numero: string;
  banco: string;
  lineaCredito: number;
  saldoDisponible: number;
  alias?: string;
}

export interface Client {
  id: string;
  rut: string;
  razonSocial: string;
  nombreFantasia: string;
  giro: string;
  contactoPrincipal: {
    nombre: string;
    email: string;
    telefono: string;
    cargo: string;
  };
  cuentaCorriente: CuentaCorriente;
  cuentasCorrientes?: CuentaCorriente[]; // Cuentas disponibles (entre 1 y 9)
  ejecutivoId?: string; // Si es undefined -> Cliente sin ejecutivo asignado
  ejecutivoNombre?: string;
  kamId?: string;
  kamNombre?: string;
  tipoCliente?: string;
  estado: 'Activo' | 'Inactivo';
  condicionesComerciales: CondicionComercial;
  condicionesTarifarias?: CondicionTarifariaVigente[];
  proformasIds: string[];
  historialModificaciones: HistorialModificacionCliente[];
  excepcionesActivasCount?: number;
  
  // KPIs específicos por cliente
  kpis: {
    proformasTotales: number;
    proformasAprobadas: number;
    proformasRechazadas: number;
    tasaAprobacion: number;
    promedioVersiones: number;
    cantidadReprocesos: number;
    tiempoPromedioAprobacionDias: number;
    tasaRechazoTarifa?: number;
    cantidadExcepciones?: number;
    tarifaPromedioAplicada?: number;
    descuentoPromedioPct?: number;
    variacionTarifaPct?: number;
    solicitudesPricingCount?: number;
  };
}

export interface AuditLog {
  id: string;
  ts: string;
  fechaHora: string;
  usuario: string;
  rol: Role;
  accion:
    | 'Creación'
    | 'Aprobación'
    | 'Rechazo'
    | 'Login'
    | 'Facturación'
    | 'Reasignación de Ejecutivo'
    | 'Modificación Cliente'
    | 'Cambio Condiciones Comerciales'
    | 'Envío Proforma'
    | 'Creación Nueva Versión'
    | 'Cambio de Estado'
    | 'Resolución Pricing'
    | 'Validación Tarifa'
    | 'Excepción Aprobada'
    | 'Excepción Rechazada'
    | 'Solicitud a KAM'
    | 'Sincronización Salesforce'
    | string;
  recurso: string;
  objetoAfectado: string;
  cliente?: string;
  kam?: string;
  estadoAnterior?: string;
  estadoNuevo?: string;
  version?: string;
  motivoObservaciones?: string;
  ip: string;
}

export interface DashboardFiltersState {
  periodo: 'hoy' | 'semana' | 'mes' | 'trimestre' | 'ano' | 'todos';
  ejecutivoId: string;
  clienteId: string;
  rut: string;
  cuentaCorriente: string;
  estadoProforma: string;
  version: string;
  resultadoAprobacion: string;
  motivoRechazo: string;
}

// -------------------------------------------------------------
// MODELOS PARA ENCARGADO DE PRICING
// -------------------------------------------------------------

export interface KAM {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  avatar: string;
  carteraClientesCount: number;
  proformasTotales: number;
  proformasRechazadasTarifa: number;
  tasaRechazoTarifario: number;
  excepcionesSolicitadas: number;
  excepcionesAprobadas: number;
  excepcionesRechazadas: number;
  cantidadReprocesos: number;
  tiempoPromedioResolucionDias: number;
  descuentoPromedioCarteraPct: number;
  variacionPromedioTarifaPct: number;
  clientesMayorIncidencia: string[];
}

export interface ExcepcionTarifaria {
  id: string;
  proformaId: string;
  proformaCodigo: string;
  clienteId: string;
  clienteNombre: string;
  rut: string;
  cuentaCorrienteNumero: string;
  kamId: string;
  kamNombre: string;
  ejecutivoNombre: string;
  versionProforma: VersionProforma;
  servicio: string;
  tramo: string;
  tarifaEstandar: number;
  tarifaSolicitada: number;
  descuentoEstandarPct: number;
  descuentoSolicitadoPct: number;
  impactoFinancieroEstimado: number;
  justificacionKAM: string;
  analisisPricing?: string;
  observacionesPricing?: string;
  estado: 'Pendiente_Revision' | 'Aprobada' | 'Rechazada' | 'Solicitud_KAM' | 'Corregida' | 'Pendiente_Pricing' | 'Solicitar_Modificacion';
  fechaSolicitud: string;
  fechaResolucion?: string;
  usuarioResolucion?: string;
  salesforceOpportunityId?: string;
}

export interface ComunicacionKAM {
  id: string;
  proformaId: string;
  clienteNombre: string;
  kamNombre: string;
  usuarioPricing: string;
  fechaEnvio: string;
  asunto: string;
  mensajePricing: string;
  respuestaKAM?: string;
  fechaRespuesta?: string;
  estado: 'Esperando_Respuesta_KAM' | 'Respondida' | 'Resuelta';
  prioridad: 'Alta' | 'Media' | 'Baja';
  salesforceOpportunityId?: string;
}

export interface SalesforceOpportunity {
  opportunityId: string;
  opportunityName: string;
  accountName: string;
  rut: string;
  kamName: string;
  amount: number;
  stage: 'Propuesta' | 'Negociación Tarifaria' | 'Cerrada Ganada' | 'Revisión Pricing';
  contractType: string;
  tarifarioAcordado: string;
  descuentoMaximoAutorizado: number;
  lastSyncDate: string;
  syncStatus: 'Sincronizado' | 'Pendiente' | 'Discrepancia';
}
