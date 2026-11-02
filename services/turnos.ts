import { obtenerProfesional, obtenerMisProfesionales, avatarDeNombre } from './profesionales';
import { useSesionStore } from '../store/useSesionStore';
import { BuscarTurnoPor, Profesional, Turno } from '../types';
import { aClave, dosDigitos } from '../utils/fechas';
import { apiFetch } from './api';

const DIAS_DE_AGENDA = 14;
const LIMITE_SIMULTANEO = 6;

interface AgendaApi {
  idAgenda: number;
  idProfesional: number;
  dia: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
  intervaloMinutos: number | null;
}

interface OcupadoApi {
  hora: string;
}

interface TurnoDetalleApi {
  idTurno: number;
  idProfesional: number;
  nombreProfesional: string;
  especialidad: string;
  estadoDescripcion: string;
  confirmadoPaciente: boolean;
  creadoPor: string | null;
  fecha: string;
  hora: string;
}

const DIAS_SEMANA: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
};

function normalizarDia(dia: string): number | undefined {
  const limpio = dia
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
  return DIAS_SEMANA[limpio];
}

function sumarMinutos(hora: string, minutos: number): string {
  const [h, m] = hora.split(':').map(Number);
  const total = h * 60 + m + minutos;
  const horas = Math.floor(total / 60);
  const mins = total % 60;
  return `${dosDigitos(horas)}:${dosDigitos(mins)}`;
}

function horariosDe(agenda: AgendaApi): string[] {
  const intervalo = agenda.intervaloMinutos ?? 30;
  const fin = agenda.horaFin.slice(0, 5);
  const horarios: string[] = [];
  let actual = agenda.horaInicio.slice(0, 5);
  let siguiente = sumarMinutos(actual, intervalo);
  while (siguiente <= fin) {
    horarios.push(actual);
    actual = siguiente;
    siguiente = sumarMinutos(actual, intervalo);
  }
  return horarios;
}

async function ejecutarLimitado<T>(tareas: (() => Promise<T>)[], limite: number): Promise<T[]> {
  const resultados: T[] = new Array(tareas.length);
  let siguiente = 0;

  async function trabajador() {
    while (siguiente < tareas.length) {
      const indice = siguiente++;
      resultados[indice] = await tareas[indice]();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limite, tareas.length) }, trabajador)
  );
  return resultados;
}

function partesDeId(turnoId: string): { idProfesional: string; fecha: string; hora: string } {
  const primerGuion = turnoId.indexOf('-');
  return {
    idProfesional: turnoId.slice(0, primerGuion),
    fecha: turnoId.slice(primerGuion + 1, primerGuion + 11),
    hora: turnoId.slice(primerGuion + 12),
  };
}

interface DiaProfesional {
  profesional: Profesional;
  fecha: string;
  horarios: string[];
}

async function diasDeProfesional(profesional: Profesional): Promise<DiaProfesional[]> {
  const agendas = await apiFetch<AgendaApi[]>(`/profesionales/${profesional.id}/agenda`);
  const disponibles = agendas.filter((a) => a.disponible);

  const ahora = new Date();
  const dias: DiaProfesional[] = [];
  for (let d = 0; d < DIAS_DE_AGENDA; d++) {
    const fechaDia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + d);
    const fecha = aClave(fechaDia);
    const agendasDelDia = disponibles.filter(
      (a) => normalizarDia(a.dia) === fechaDia.getDay()
    );
    if (agendasDelDia.length === 0) {
      continue;
    }
    dias.push({ profesional, fecha, horarios: agendasDelDia.flatMap(horariosDe) });
  }
  return dias;
}

async function profesionalesPara(por: BuscarTurnoPor, valor: string): Promise<Profesional[]> {
  if (por === 'profesional') {
    const profesional = await obtenerProfesional(valor);
    return profesional ? [profesional] : [];
  }
  const idPaciente = useSesionStore.getState().idPaciente;
  if (idPaciente === null) {
    return [];
  }
  return obtenerMisProfesionales(idPaciente, valor);
}

export async function obtenerAgendaDeTurnos(
  por: BuscarTurnoPor,
  valor: string
): Promise<Turno[]> {
  const profesionales = await profesionalesPara(por, valor);

  const diasPorProfesional = await ejecutarLimitado(
    profesionales.map((profesional) => () => diasDeProfesional(profesional)),
    LIMITE_SIMULTANEO
  );
  const dias = diasPorProfesional.flat();

  const ocupadosPorDia = await ejecutarLimitado(
    dias.map(({ profesional, fecha }) => () =>
      apiFetch<OcupadoApi[]>(`/turnos/ocupados?idProfesional=${profesional.id}&fecha=${fecha}`)
    ),
    LIMITE_SIMULTANEO
  );

  const ahora = new Date();
  const hoy = aClave(ahora);
  const horaDeAhora = `${dosDigitos(ahora.getHours())}:${dosDigitos(ahora.getMinutes())}`;

  const turnos: Turno[] = [];
  dias.forEach(({ profesional, fecha, horarios }, i) => {
    const ocupados = new Set(ocupadosPorDia[i].map((o) => o.hora.slice(0, 5)));
    horarios.forEach((hora) => {
      const yaPaso = fecha === hoy && hora <= horaDeAhora;
      turnos.push({
        id: `${profesional.id}-${fecha}-${hora}`,
        fecha,
        hora,
        profesional,
        disponible: !ocupados.has(hora) && !yaPaso,
      });
    });
  });

  return turnos.sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
}

export async function reservarTurno(turnoId: string, usuario: string): Promise<void> {
  void usuario;
  const { idProfesional, fecha, hora } = partesDeId(turnoId);

  try {
    await apiFetch('/turnos/solicitar', {
      method: 'POST',
      body: JSON.stringify({
        idProfesional: Number(idProfesional),
        fecha: new Date(`${fecha}T12:00:00`).toISOString(),
        hora: `${hora}:00`,
        modalidad: 'Virtual',
        motivo: null,
      }),
    });
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Ese turno ya no está disponible. Elegí otro horario.'
    );
  }
}

export async function cancelarTurno(turnoId: string, usuario: string): Promise<void> {
  void usuario;
  const idPaciente = useSesionStore.getState().idPaciente;
  await apiFetch(`/turnos/${turnoId}/cancelar?idPaciente=${idPaciente}`, { method: 'PUT' });
}

export async function confirmarTurno(turnoId: string): Promise<void> {
  await apiFetch(`/turnos/${turnoId}/confirmar-paciente`, { method: 'PUT' });
}

export async function modificarTurno(
  turnoActualId: string,
  turnoNuevoId: string,
  usuario: string
): Promise<void> {
  const misTurnos = await obtenerMisTurnos(usuario);
  const turnoActual = misTurnos.find((t) => t.id === turnoActualId);
  if (!turnoActual) {
    throw new Error('Ese turno ya no figura entre tus turnos.');
  }

  const fechaHoraTurno = new Date(`${turnoActual.fecha}T${turnoActual.hora}:00`);
  const horasRestantes = (fechaHoraTurno.getTime() - Date.now()) / (1000 * 60 * 60);
  if (horasRestantes < 24) {
    throw new Error('No se puede reprogramar un turno con menos de 24 horas de anticipación.');
  }

  await reservarTurno(turnoNuevoId, usuario);
  try {
    await cancelarTurno(turnoActualId, usuario);
  } catch (error) {
    throw new Error(
      `Se reservó el turno nuevo, pero no se pudo cancelar el anterior: ${
        error instanceof Error ? error.message : 'intentá cancelarlo desde Mis turnos.'
      }`
    );
  }
}

export async function obtenerMisTurnos(usuario: string): Promise<Turno[]> {
  void usuario;
  const idPaciente = useSesionStore.getState().idPaciente;
  if (idPaciente === null) {
    useSesionStore.getState().cerrarSesion();
    throw new Error('Tu sesión venció. Volvé a ingresar.');
  }
  const detalle = await apiFetch<TurnoDetalleApi[]>(`/pacientes/${idPaciente}/turnos-detalle`);

  const ahora = new Date();
  const hoy = aClave(ahora);
  const horaDeAhora = `${dosDigitos(ahora.getHours())}:${dosDigitos(ahora.getMinutes())}`;

  return detalle
    .filter((t) => t.estadoDescripcion !== 'Cancelado' && t.estadoDescripcion !== 'Rechazado')
    .filter((t) => {
      const fecha = t.fecha.slice(0, 10);
      const hora = t.hora.slice(0, 5);
      return fecha > hoy || (fecha === hoy && hora > horaDeAhora);
    })
    .map(
      (t): Turno => ({
        id: String(t.idTurno),
        fecha: t.fecha.slice(0, 10),
        hora: t.hora.slice(0, 5),
        profesional: {
          id: String(t.idProfesional),
          nombre: t.nombreProfesional,
          apellido: '',
          matricula: '',
          especialidad: t.especialidad,
          modalidad: 'Virtual',
          avatar: avatarDeNombre(t.nombreProfesional),
          descripcion: '',
        },
        disponible: false,
        estado: t.estadoDescripcion,
        propuestoPorProfesional:
          t.estadoDescripcion === 'Pendiente' &&
          t.creadoPor === 'profesional' &&
          !t.confirmadoPaciente,
      })
    )
    .sort((a, b) => `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`));
}
