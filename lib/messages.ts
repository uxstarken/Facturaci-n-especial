// Banco de mensajes con tono cercano para notificaciones al trabajador.
// Se elige uno al azar por evento para que no se sienta repetitivo/robótico.

type Vars = Record<string, string | number>;

function fill(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''));
}

export function pickMessage(bank: string[], vars?: Vars): string {
  const template = bank[Math.floor(Math.random() * bank.length)];
  return fill(template, vars);
}

export const MENSAJES_PROFORMA_CREADA: string[] = [
  '¡Listo! Proforma {id} creada con éxito 🎉',
  'Una proforma menos en la lista — {id} generada.',
  '{id} generada. Tu cliente lo va a agradecer.',
  'Bien ahí, {id} quedó lista y en camino.',
  '¡Se hizo! {id} generada correctamente.',
];

export const MENSAJES_HITO_DIARIO: string[] = [
  '¡Vas con todo hoy! {count} proformas creadas 💪',
  '{count} proformas hoy. Buen ritmo.',
  'Racha del día: {count} proformas. Sigue así.',
];

export const MENSAJES_BIENESTAR: string[] = [
  'Llevas un buen rato en esto — ¿un respiro de 5 minutos?',
  'Buen ritmo hoy. Aprovecha de pararte y estirar un poco.',
  'Vas muy concentrada/o. Una pausa corta te va a rendir después.',
];

export function saludoPorHora(): string {
  const hora = new Date().getHours();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
