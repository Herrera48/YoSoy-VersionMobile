// Ayudas para trabajar con fechas en el calendario de turnos.
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
