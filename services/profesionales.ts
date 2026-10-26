import { Especialidad, Profesional } from '../types';
import { ApiError, apiFetch } from './api';

interface EspecialidadApi {
  idEspecialidad: number;
  nombre: string;
  estado: string;
}

interface ProfesionalApi {
  idProfesional: number;
  nombre: string;
  apellido: string | null;
  matricula: string;
  idEspecialidad: number;
  estado: string;
}

let especialidadesCache: EspecialidadApi[] | null = null;

async function obtenerEspecialidadesApi(): Promise<EspecialidadApi[]> {
  if (!especialidadesCache) {
    especialidadesCache = await apiFetch<EspecialidadApi[]>('/especialidades');
  }
  return especialidadesCache;
}

export function avatarDeNombre(nombreCompleto: string): string {
  const seed = encodeURIComponent(nombreCompleto);
  return `https://api.dicebear.com/7.x/initials/png?seed=${seed}&backgroundColor=2563EB,6366F1,6D28D9&textColor=ffffff`;
}

function nombreEspecialidad(idEspecialidad: number, especialidades: EspecialidadApi[]): string {
  return especialidades.find((e) => e.idEspecialidad === idEspecialidad)?.nombre ?? '';
}

async function aProfesional(p: ProfesionalApi): Promise<Profesional> {
  const especialidades = await obtenerEspecialidadesApi();
  const apellido = p.apellido ?? '';
  return {
    id: String(p.idProfesional),
    nombre: p.nombre,
    apellido,
    matricula: p.matricula,
    especialidad: nombreEspecialidad(p.idEspecialidad, especialidades),
    modalidad: 'Virtual',
    avatar: avatarDeNombre(`${p.nombre} ${apellido}`.trim()),
    descripcion: '',
  };
}

export async function obtenerEspecialidades(): Promise<Especialidad[]> {
  const especialidades = await obtenerEspecialidadesApi();
  return especialidades
    .filter((e) => e.estado === 'Activo')
    .map((e) => ({ id: String(e.idEspecialidad), nombre: e.nombre }));
}

export async function obtenerProfesionales(especialidad: string | null): Promise<Profesional[]> {
  const especialidades = (await obtenerEspecialidadesApi()).filter((e) => e.estado === 'Activo');

  if (especialidad) {
    const idEspecialidad = especialidades.find((e) => e.nombre === especialidad)?.idEspecialidad;
    if (idEspecialidad === undefined) {
      return [];
    }
    const lista = await apiFetch<ProfesionalApi[]>(
      `/profesionales/activos/especialidad/${idEspecialidad}`
    );
    return Promise.all(lista.map(aProfesional));
  }

  const listas = await Promise.all(
    especialidades.map((e) =>
      apiFetch<ProfesionalApi[]>(`/profesionales/activos/especialidad/${e.idEspecialidad}`)
    )
  );

  const vistos = new Set<number>();
  const unidos: ProfesionalApi[] = [];
  listas.flat().forEach((p) => {
    if (!vistos.has(p.idProfesional)) {
      vistos.add(p.idProfesional);
      unidos.push(p);
    }
  });

  return Promise.all(unidos.map(aProfesional));
}

export async function obtenerMisProfesionales(
  idPaciente: number,
  especialidad: string | null
): Promise<Profesional[]> {
  const [todos, asignados] = await Promise.all([
    obtenerProfesionales(especialidad),
    apiFetch<{ idProfesional: number }[]>(`/pacientes/${idPaciente}/mis-profesionales`),
  ]);
  const idsAsignados = new Set(asignados.map((p) => p.idProfesional));
  return todos.filter((p) => idsAsignados.has(Number(p.id)));
}

export async function obtenerProfesional(id: string): Promise<Profesional | null> {
  try {
    const p = await apiFetch<ProfesionalApi>(`/profesionales/${id}`);
    return await aProfesional(p);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
