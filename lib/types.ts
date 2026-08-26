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
  | 'Enviado a Pricing';

export interface VersionHistoryItem {
  version: 'v1' | 'v2' | 'v3';
  fechaCreacion: string;
  fechaRechazo?: string;
  fechaAprobacion?: string;
  motivo?: string;
  respaldoCorreoUrl?: string;
  monto: number;
  estado?: string;
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
