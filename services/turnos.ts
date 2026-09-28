import { agendas } from '../data/agendas';
import { profesionales } from '../data/profesionales';
import { BuscarTurnoPor, Turno } from '../types';
import { aClave, dosDigitos } from '../utils/fechas';
import { esperar } from './simulacion';

// Capa de acceso a los turnos. Igual que services/profesionales.ts, hoy
// simula la API: arma los turnos a partir de las agendas de data/ y guarda
// las reservas en memoria (se pierden al recargar la app). Cuando exista el
// backend solo cambia el cuerpo de estas funciones.

// Cuántos días hacia adelante se pueden pedir turnos.
const DIAS_DE_AGENDA = 45;

// Turnos reservados desde la app: id del turno → usuario que lo reservó.
const reservas: Record<string, string> = {};

// Simula que otros pacientes ya tomaron parte de la agenda. Es determinístico
// (depende solo del id) para que un turno no aparezca y desaparezca entre una
// consulta y otra.
function ocupadoPorOtroPaciente(id: string): boolean {
  let suma = 0;
  for (let i = 0; i < id.length; i++) {
    suma += id.charCodeAt(i) * (i + 1);
  }
  return suma % 3 === 0;
}

// Hora actual en el mismo formato que los turnos (HH:MM), para compararlas
// como texto.
function horaActual(ahora: Date): string {
  return `${dosDigitos(ahora.getHours())}:${dosDigitos(ahora.getMinutes())}`;
}

// Arma la agenda completa desde hoy hasta DIAS_DE_AGENDA, con los turnos
// libres y los ocupados, ordenada por fecha y hora.
function generarAgenda(): Turno[] {
  const ahora = new Date();
  const horaDeAhora = horaActual(ahora);
  const turnos: Turno[] = [];

  for (let d = 0; d < DIAS_DE_AGENDA; d++) {
    const dia = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + d);
    const fecha = aClave(dia);

    agendas.forEach((agenda) => {
      const profesional = profesionales.find((p) => p.id === agenda.profesionalId);
      if (!profesional || !agenda.dias.includes(dia.getDay())) {
        return;
      }

      agenda.horarios.forEach((hora) => {
        const id = `${profesional.id}-${fecha}-${hora}`;
        // De hoy solo se ofrecen los horarios que todavía no pasaron.
        const yaPaso = d === 0 && hora <= horaDeAhora;
        const disponible = !yaPaso && !reservas[id] && !ocupadoPorOtroPaciente(id);
        turnos.push({ id, fecha, hora, profesional, disponible });
      });
    });
  }

  return turnos.sort((a, b) =>
    `${a.fecha} ${a.hora}`.localeCompare(`${b.fecha} ${b.hora}`)
  );
}

// Como lo haría un endpoint del tipo
// GET /turnos?especialidad=Psiquiatría  o  GET /turnos?profesionalId=3
// Devuelve también los ocupados, para mostrar la agenda completa del día.
export async function obtenerAgendaDeTurnos(
  por: BuscarTurnoPor,
  valor: string
): Promise<Turno[]> {
  await esperar();

  return generarAgenda().filter((turno) =>
    por === 'especialidad'
      ? turno.profesional.especialidad === valor
      : turno.profesional.id === valor
  );
}

// Como lo haría un POST /turnos. Vuelve a verificar que el turno siga libre:
// entre que el paciente lo vio y lo confirmó, otro podría haberlo tomado.
export async function reservarTurno(turnoId: string, usuario: string): Promise<void> {
  await esperar();

  const sigueLibre = generarAgenda().some(
    (turno) => turno.id === turnoId && turno.disponible
  );
  if (!sigueLibre) {
    throw new Error('Ese turno ya no está disponible. Elegí otro horario.');
  }
  reservas[turnoId] = usuario;
}

// Como lo haría un GET /turnos/mios: los turnos que reservó el paciente y que
// todavía no pasaron, del más cercano al más lejano. La agenda ya viene
// ordenada, así que alcanza con filtrar.
export async function obtenerMisTurnos(usuario: string): Promise<Turno[]> {
  await esperar();

  const ahora = new Date();
  const hoy = aClave(ahora);
  const horaDeAhora = horaActual(ahora);

  return generarAgenda().filter(
    (turno) =>
      reservas[turno.id] === usuario &&
      !(turno.fecha === hoy && turno.hora <= horaDeAhora)
  );
}
