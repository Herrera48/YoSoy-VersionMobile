import { especialidades } from '../data/especialidades';
import { profesionales } from '../data/profesionales';
import { Especialidad, Profesional } from '../types';
import { esperar } from './simulacion';

// Capa de acceso a datos. Hoy responde con los datos locales de data/, pero
// con la misma forma que tendría un fetch a la API: funciones async que
// devuelven una promesa. Cuando exista el backend solo cambia el cuerpo de
// estas funciones; las pantallas, que las consumen con useQuery, no se tocan.

// El filtro por especialidad lo resuelve el "servidor", como lo haría un
// endpoint del tipo GET /profesionales?especialidad=Psiquiatría.
export async function obtenerProfesionales(
  especialidad: string | null
): Promise<Profesional[]> {
  await esperar();

  if (!especialidad) {
    return profesionales;
  }
  return profesionales.filter((p) => p.especialidad === especialidad);
}

// Como lo haría un GET /profesionales/:id. Devuelve null si no existe, para
// que la pantalla muestre "no encontrado" en lugar de un error.
export async function obtenerProfesional(id: string): Promise<Profesional | null> {
  await esperar();
  return profesionales.find((p) => p.id === id) ?? null;
}

export async function obtenerEspecialidades(): Promise<Especialidad[]> {
  await esperar();
  return especialidades;
}
