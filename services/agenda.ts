import { obtenerMisPacientes } from './pacientes';
import { apiFetch } from './api';

export type EstadoTurnoAgenda = 'Pendiente' | 'Confirmado' | 'Cancelado' | 'Realizado';

export interface TurnoAgenda {
  idTurno: number;
  idPaciente: number;
  nombrePaciente: string;
  fecha: string;
  hora: string;
  estado: EstadoTurnoAgenda;
  motivo: string | null;
  propuestoPorProfesional: boolean;
}

interface TurnoApi {
  idTurno: number;
  idPaciente: number;
  idProfesional: number;
  idEstadoTurno: number;
  fecha: string;
  hora: string;
  modalidad: string;
  motivo: string | null;
  creadoPor: string | null;
}

// Los 4 estados son ids fijos en la base (ver migrations/seed_catalogos.sql):
// 1 Pendiente, 2 Confirmado, 3 Cancelado, 4 Realizado.
const ESTADOS: Record<number, EstadoTurnoAgenda> = {
  1: 'Pendiente',
  2: 'Confirmado',
  3: 'Cancelado',
  4: 'Realizado',
};

export async function obtenerAgendaProfesional(idProfesional: number): Promise<TurnoAgenda[]> {
  const [turnos, pacientes] = await Promise.all([
    apiFetch<TurnoApi[]>(`/profesionales/${idProfesional}/turnos`),
    obtenerMisPacientes(),
  ]);
  const nombres = new Map(pacientes.map((p) => [p.idPaciente, p.nombre]));

  return turnos
    .map((t) => ({
      idTurno: t.idTurno,
      idPaciente: t.idPaciente,
      nombrePaciente: nombres.get(t.idPaciente) ?? 'Paciente',
      fecha: t.fecha.slice(0, 10),
      hora: t.hora.slice(0, 5),
      estado: ESTADOS[t.idEstadoTurno] ?? 'Pendiente',
      motivo: t.motivo,
      propuestoPorProfesional: t.idEstadoTurno === 1 && t.creadoPor === 'profesional',
    }))
    .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
}

// Sin idPaciente: toma la rama de /turnos/{id}/cancelar para el profesional
// dueño del turno (ver Program.cs), no la del paciente.
export async function cancelarTurnoProfesional(idTurno: number): Promise<void> {
  await apiFetch(`/turnos/${idTurno}/cancelar`, { method: 'PUT' });
}
