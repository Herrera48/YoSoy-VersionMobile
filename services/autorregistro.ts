import { NuevoRegistroAnimo, RegistroAnimo } from '../types';
import { esperar } from './simulacion';

// Capa de acceso al autorregistro del estado de ánimo. Igual que
// services/turnos.ts, hoy simula la API y guarda los registros en memoria (se
// pierden al recargar la app). Cuando exista el backend solo cambia el cuerpo
// de estas funciones.

// Registros de cada paciente: usuario → sus registros.
const registros: Record<string, RegistroAnimo[]> = {};

let ultimoId = 0;

// Como lo haría un GET /autorregistros: los registros del paciente, del más
// reciente al más antiguo.
export async function obtenerMisRegistros(usuario: string): Promise<RegistroAnimo[]> {
  await esperar();

  return [...(registros[usuario] ?? [])].sort((a, b) =>
    `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`)
  );
}

// Como lo haría un POST /autorregistros. Devuelve el registro guardado, con
// el id que le asignó el "servidor".
export async function guardarRegistro(
  usuario: string,
  datos: NuevoRegistroAnimo
): Promise<RegistroAnimo> {
  await esperar();

  ultimoId++;
  const registro: RegistroAnimo = { id: String(ultimoId), ...datos };
  registros[usuario] = [...(registros[usuario] ?? []), registro];
  return registro;
}
