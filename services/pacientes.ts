import { useSesionStore } from '../store/useSesionStore';
import { apiFetch, ApiError } from './api';

export interface PacienteAsignado {
  idPaciente: number;
  nombre: string;
  dni: string;
  mail: string;
  telefono: string;
  estadoAsignacion: string;
}

export interface MotivoAsignacion {
  fecha: string;
  observaciones: string | null;
  planTratamiento: string | null;
}

interface PacienteDetalleApi {
  idPaciente: number;
  nombre: string;
  dni: string;
  mail: string;
  telefono: string;
  estadoAsignacion: string;
  fechaAsignacion: string | null;
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

function idProfesionalActual(): number {
  const idProfesional = useSesionStore.getState().idProfesional;
  if (idProfesional === null) {
    throw new Error('Tu sesión venció. Volvé a ingresar.');
  }
  return idProfesional;
}

export async function obtenerMisPacientes(): Promise<PacienteAsignado[]> {
  const idProfesional = idProfesionalActual();
  const lista = await apiFetch<PacienteDetalleApi[]>(
    `/profesionales/${idProfesional}/pacientes-detalle`
  );
  return lista.map(({ idPaciente, nombre, dni, mail, telefono, estadoAsignacion }) => ({
    idPaciente,
    nombre,
    dni,
    mail,
    telefono,
    estadoAsignacion,
  }));
}

// El motivo de la asignación es la evolución que dejó el equipo de admisión
// antes de derivar al paciente (Evolucion.diagnostico contiene "admis"), como
// arma el panel la web en verEvolucionAdmision. Sin historia clínica todavía
// abierta, el paciente no tiene motivo que mostrar.
export async function obtenerMotivoAsignacion(idPaciente: number): Promise<MotivoAsignacion[]> {
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
  const evoluciones = await apiFetch<EvolucionApi[]>(
    `/historiasclinicas/${historia.idHistoria}/evoluciones`
  );
  return evoluciones
    .filter((e) => (e.diagnostico ?? '').toLowerCase().includes('admis'))
    .map((e) => ({ fecha: e.fecha, observaciones: e.observaciones, planTratamiento: e.planTratamiento }));
}

export async function proponerPrimerTurno(
  idPaciente: number,
  fecha: string,
  hora: string
): Promise<void> {
  const idProfesional = idProfesionalActual();
  await apiFetch('/turnos/profesional-solicitar', {
    method: 'POST',
    body: JSON.stringify({
      idPaciente,
      idProfesional,
      fecha: new Date(`${fecha}T12:00:00`).toISOString(),
      hora: `${hora}:00`,
      motivo: 'Primer turno - derivacion de admision',
    }),
  });
  await apiFetch('/asignaciones/estado', {
    method: 'PUT',
    body: JSON.stringify({ idPaciente, idProfesional, estado: 'Confirmada' }),
  });
}

export async function devolverPacienteAAdmision(
  idPaciente: number,
  motivo: string
): Promise<void> {
  const idProfesional = idProfesionalActual();
  await apiFetch('/informes-admision/rechazar', {
    method: 'PUT',
    body: JSON.stringify({ idPaciente, idProfesional, motivo }),
  });
}
