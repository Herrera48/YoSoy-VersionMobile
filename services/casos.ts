import { apiFetch } from './api';

export type EstadoCaso = 'Nuevo' | 'Derivado' | 'Asignado' | 'En atención';

export interface CasoProfesional {
  idCaso: number;
  idPaciente: number;
  nombrePaciente: string;
  estado: EstadoCaso;
  nombreGrupo: string | null;
  origen: string;
  fechaCreacion: string;
}

interface CasoDetalleApi {
  idCaso: number;
  idPaciente: number;
  nombrePaciente: string;
  estado: string;
  idGrupoActual: number | null;
  nombreGrupo: string | null;
  idProfesionalAsignado: number | null;
  nombreProfesionalAsignado: string | null;
  origen: string;
  fechaCreacion: string;
  idInforme: number | null;
}

// El endpoint ya excluye 'Cerrado' (ver CasoDAO.ObtenerPorProfesional), así
// que lo que llega es siempre uno de estos cuatro estados.
function aEstadoCaso(estado: string): EstadoCaso {
  return estado === 'Derivado' || estado === 'Asignado' || estado === 'En atención'
    ? estado
    : 'Nuevo';
}

export async function obtenerMisCasos(idProfesional: number): Promise<CasoProfesional[]> {
  const casos = await apiFetch<CasoDetalleApi[]>(`/profesionales/${idProfesional}/casos`);
  return casos.map((c) => ({
    idCaso: c.idCaso,
    idPaciente: c.idPaciente,
    nombrePaciente: c.nombrePaciente,
    estado: aEstadoCaso(c.estado),
    nombreGrupo: c.nombreGrupo,
    origen: c.origen,
    fechaCreacion: c.fechaCreacion.slice(0, 10),
  }));
}
