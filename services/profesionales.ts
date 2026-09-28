import { especialidades } from '../data/especialidades';
import { profesionales } from '../data/profesionales';
import { Especialidad, Profesional } from '../types';

// Capa de acceso a datos. Hoy responde con los datos locales de data/, pero
// con la misma forma que tendría un fetch a la API: funciones async que
// devuelven una promesa. Cuando exista el backend solo cambia el cuerpo de
// estas funciones; las pantallas, que las consumen con useQuery, no se tocan.

// Demora artificial para simular la latencia de red y que el estado
// isLoading de TanStack Query se vea en pantalla.
const DEMORA_MS = 600;

const esperar = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// El filtro por especialidad lo resuelve el "servidor", como lo haría un
// endpoint del tipo GET /profesionales?especialidad=Psiquiatría.
export async function obtenerProfesionales(
  especialidad: string | null
): Promise<Profesional[]> {
  await esperar(DEMORA_MS);

  if (!especialidad) {
    return profesionales;
  }
  return profesionales.filter((p) => p.especialidad === especialidad);
}

export async function obtenerEspecialidades(): Promise<Especialidad[]> {
  await esperar(DEMORA_MS);
  return especialidades;
}
