import { apiFetch } from './api';

export const DIAS_HORARIO = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
];

const ORDEN_DIAS: Record<string, number> = {
  lunes: 0,
  martes: 1,
  miercoles: 2,
  jueves: 3,
  viernes: 4,
  sabado: 5,
  domingo: 6,
};

// La base guarda el día con distintas formas ('lunes', 'Lunes', 'miercoles'):
// se ordena por el número de día, no por el texto, igual que en el dashboard web.
export function ordenDia(dia: string): number {
  const limpio = dia
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  return ORDEN_DIAS[limpio] ?? 7;
}

export interface HorarioProfesional {
  idAgenda: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  intervaloMinutos: number;
}

export interface HorarioInput {
  dia: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  intervaloMinutos: number;
}

interface AgendaApi {
  idAgenda: number;
  idProfesional: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  intervaloMinutos: number | null;
}

function aHorarioProfesional(a: AgendaApi): HorarioProfesional {
  return {
    idAgenda: a.idAgenda,
    dia: a.dia,
    horaInicio: a.horaInicio.slice(0, 5),
    horaFin: a.horaFin.slice(0, 5),
    disponible: a.disponible,
    intervaloMinutos: a.intervaloMinutos ?? 30,
  };
}

function aAgendaBody(idProfesional: number, input: HorarioInput) {
  return {
    idProfesional,
    dia: input.dia,
    horaInicio: `${input.horaInicio}:00`,
    horaFin: `${input.horaFin}:00`,
    disponible: input.disponible,
    intervaloMinutos: input.intervaloMinutos,
  };
}

export async function obtenerHorarios(idProfesional: number): Promise<HorarioProfesional[]> {
  const agenda = await apiFetch<AgendaApi[]>(`/profesionales/${idProfesional}/agenda`);
  return agenda.map(aHorarioProfesional);
}

export async function crearHorario(idProfesional: number, input: HorarioInput): Promise<void> {
  await apiFetch('/agendas', {
    method: 'POST',
    body: JSON.stringify(aAgendaBody(idProfesional, input)),
  });
}

export async function actualizarHorario(
  idAgenda: number,
  idProfesional: number,
  input: HorarioInput
): Promise<void> {
  await apiFetch(`/agendas/${idAgenda}`, {
    method: 'PUT',
    body: JSON.stringify(aAgendaBody(idProfesional, input)),
  });
}

export async function eliminarHorario(idAgenda: number): Promise<void> {
  await apiFetch(`/agendas/${idAgenda}`, { method: 'DELETE' });
}
