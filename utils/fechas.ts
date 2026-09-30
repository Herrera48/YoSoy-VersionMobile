// Ayudas para trabajar con fechas en el calendario de turnos y en el
// autorregistro.
//
// Las fechas viajan como texto AAAA-MM-DD ("clave"), igual que las mandaría
// una API: son fáciles de comparar, de ordenar y de usar como key. Los nombres
// de días y meses se escriben a mano para no depender del idioma del
// dispositivo.

export const NOMBRES_MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export const NOMBRES_DIAS = [
  'domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado',
];

// Encabezado del calendario: la semana empieza el lunes.
export const INICIALES_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export const dosDigitos = (numero: number) =>
  numero < 10 ? `0${numero}` : `${numero}`;

// Date → '2026-09-28'
export function aClave(fecha: Date): string {
  return `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
}

// '2026-09-28' → Date (a las 00:00 del horario local)
export function desdeClave(clave: string): Date {
  const [anio, mes, dia] = clave.split('-').map(Number);
  return new Date(anio, mes - 1, dia);
}

// Primer día del mes de una fecha: identifica el mes que muestra el calendario.
export function inicioDeMes(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

export function sumarMeses(fecha: Date, cantidad: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth() + cantidad, 1);
}

// '2026-09-28' → 'lunes 28 de septiembre'
export function formatearFechaLarga(clave: string): string {
  const fecha = desdeClave(clave);
  return `${NOMBRES_DIAS[fecha.getDay()]} ${fecha.getDate()} de ${NOMBRES_MESES[fecha.getMonth()]}`;
}

// Date → '28/09/2026', como la escribe el paciente en el autorregistro.
export function aFechaCorta(fecha: Date): string {
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
}

// Date → '14:05'
export function aHora(fecha: Date): string {
  return `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
}

// '28/09/2026' → '2026-09-28'. Devuelve null si el texto no tiene ese
// formato o si la fecha no existe (por ejemplo, 31/02/2026).
export function desdeFechaCorta(texto: string): string | null {
  const partes = texto.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!partes) {
    return null;
  }
  const [dia, mes, anio] = [Number(partes[1]), Number(partes[2]), Number(partes[3])];
  const fecha = new Date(anio, mes - 1, dia);
  // Date "corrige" las fechas imposibles (31/02 pasa a 03/03): si cambió
  // algún dato, la fecha no existía.
  if (fecha.getDate() !== dia || fecha.getMonth() !== mes - 1) {
    return null;
  }
  return aClave(fecha);
}

// "9:05" → "09:05". Devuelve la hora normalizada (HH:MM), o null si no es
// una hora válida.
export function validarHora(texto: string): string | null {
  const partes = texto.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!partes) {
    return null;
  }
  const horas = Number(partes[1]);
  const minutos = Number(partes[2]);
  if (horas > 23 || minutos > 59) {
    return null;
  }
  return `${dosDigitos(horas)}:${dosDigitos(minutos)}`;
}
