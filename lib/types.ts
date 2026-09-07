export type Role = 'Analista' | 'Jefatura' | 'Administrador' | 'Gerencia';

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
  | 'Rechazada v1'
  | 'Rechazada v2'
  | 'Derivada a CAM'
  | 'Enviado a Pricing'
  | 'Tarifas Corregidas por Pricing';

export type VersionProforma = 'v1' | 'v2' | 'v3';

export type EstadoSupervision =
  | 'Pendiente_Autorizacion' // Analista solicitó V°B° para esta versión
  | 'Autorizada'             // Supervisor/Jefatura autorizó el envío
  | 'Devuelta_Analista'      // Supervisor devolvió con observaciones
  | 'Pricing_Resuelto'       // Pricing corrigió tarifas; analista debe recalcular
  | 'No_Requiere';           // V1 inicial o aprobada

export type EstadoComercial =
  | 'Borrador'
  | 'Enviada_Cliente'
  | 'Aprobada_Cliente'
  | 'Rechazada_Cliente'
  | 'Derivada_CAM';

export interface VersionHistoryItem {
  version: 'v1' | 'v2' | 'v3';
  fechaCreacion: string;
  fechaRechazo?: string;
  fechaAprobacion?: string;
  motivo?: string;
  respaldoCorreoUrl?: string;
  monto: number;
  estado?: string;
  estadoSupervision?: EstadoSupervision;
  aprobadoPorSupervisor?: string;
  fechaSupervision?: string;
}

export interface Proforma {
  id: string;
  cliente: string;
  rut: string;
  cuentaCorrienteId?: string;
  cuentaCorrienteNombre?: string;
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
}

export interface AuditLog {
  id: string;
  ts: string;
  usuario: string;
  rol: Role;
  accion: 'Creación' | 'Aprobación' | 'Rechazo' | 'Login';
  recurso: string;
  ip: string;
}
