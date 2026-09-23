export type Role = 'Ejecutivo' | 'Analista' | 'Jefatura' | 'Administrador' | 'Gerencia';

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
  descuentoPct: number;
  total: number;
  ajustadoEnV2?: boolean;
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

export interface HistorialModificacionCliente {
  id: string;
  fecha: string;
  usuario: string;
  tipoModificacion: 'Asignación Ejecutivo' | 'Condición Comercial' | 'Datos Empresa' | 'Estado';
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
  estado: 'Activo' | 'Inactivo';
  condicionesComerciales: CondicionComercial;
  proformasIds: string[];
  historialModificaciones: HistorialModificacionCliente[];
  
  // KPIs específicos por cliente
  kpis: {
    proformasTotales: number;
    proformasAprobadas: number;
    proformasRechazadas: number;
    tasaAprobacion: number;
    promedioVersiones: number;
    cantidadReprocesos: number;
    tiempoPromedioAprobacionDias: number;
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
    | 'Cambio de Estado';
  recurso: string;
  objetoAfectado: string;
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
