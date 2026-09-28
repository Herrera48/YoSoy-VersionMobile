import { Profesional } from '../types';

// Búsqueda por texto de profesionales. La comparten el listado de
// profesionales y la pantalla de solicitar turno.

// Compara sin distinguir mayúsculas ni tildes: "martin" encuentra a "Martín".
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export function coincideConBusqueda(profesional: Profesional, busqueda: string) {
  const termino = normalizar(busqueda);
  if (termino === '') {
    return true;
  }
  const texto = normalizar(
    `${profesional.nombre} ${profesional.apellido} ${profesional.especialidad}`
  );
  return texto.includes(termino);
}
