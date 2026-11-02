import { apiFetch, ApiError } from './api';

export interface EvolucionClinica {
  fecha: string;
  diagnostico: string | null;
  observaciones: string | null;
  planTratamiento: string | null;
}

export interface SesionClinica {
  idSesion: number;
  fechaHora: string;
  tipoCierre: string | null;
  transcripcion: string | null;
  notasEvolucion: string | null;
  emociones: Record<string, number> | null;
}

interface HistoriaClinicaApi {
  idHistoria: number;
}

interface EvolucionApi {
  fecha: string;
  diagnostico: string | null;
  observaciones: string | null;
  planTratamiento: string | null;
}

interface SesionClinicaApi {
  idSesion: number;
  fechaHora: string;
  tipoCierre: string | null;
  transcripcion: string | null;
  notasEvolucion: string | null;
  historialEmociones: string | null;
}

function parsearEmociones(json: string | null): Record<string, number> | null {
  if (!json) {
    return null;
  }
  try {
    const datos = JSON.parse(json);
    return datos && typeof datos === 'object' ? datos : null;
  } catch {
    return null;
  }
}

// Todas las evoluciones de la historia clínica, no solo la de admisión (a
// diferencia de obtenerMotivoAsignacion en services/pacientes.ts, que sí
// filtra). Sin historia clínica abierta todavía, no hay evoluciones.
export async function obtenerEvolucionesClinicas(idPaciente: number): Promise<EvolucionClinica[]> {
  let historia: HistoriaClinicaApi | undefined;
  try {
    historia = await apiFetch<HistoriaClinicaApi>(`/pacientes/${idPaciente}/historiaclinica`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) {
      return [];
    }
    throw e;
  }
  if (!historia) {
    return [];
  }
  return apiFetch<EvolucionApi[]>(`/historiasclinicas/${historia.idHistoria}/evoluciones`);
}

export async function obtenerSesionesClinicas(idPaciente: number): Promise<SesionClinica[]> {
  const sesiones = await apiFetch<SesionClinicaApi[]>(`/pacientes/${idPaciente}/sesiones-clinicas`);
  return sesiones.map((s) => ({
    idSesion: s.idSesion,
    fechaHora: s.fechaHora,
    tipoCierre: s.tipoCierre,
    transcripcion: s.transcripcion,
    notasEvolucion: s.notasEvolucion,
    emociones: parsearEmociones(s.historialEmociones),
  }));
}
