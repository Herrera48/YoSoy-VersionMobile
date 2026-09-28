export interface Especialidad {
  id: string;
  nombre: string;
}

export type Modalidad = 'Virtual' | 'Presencial';

export type VarianteBadge = 'especialidad' | 'modalidad';

export interface Profesional {
  id: string;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidad: string;
  modalidad: Modalidad;
  avatar: string;
  descripcion: string;
}

// Días y horarios en los que atiende cada profesional. Los días siguen la
// numeración de Date.getDay(): 0 = domingo, 1 = lunes ... 6 = sábado.
export interface Agenda {
  profesionalId: string;
  dias: number[];
  horarios: string[];
}

export interface Turno {
  // profesionalId-fecha-hora: identifica el turno sin ambigüedad.
  id: string;
  // Fecha en formato AAAA-MM-DD (ver utils/fechas.ts).
  fecha: string;
  // Hora de inicio (HH:00). Cada turno dura una hora.
  hora: string;
  profesional: Profesional;
  // false = ya lo tomó otro paciente o el horario ya pasó.
  disponible: boolean;
}

// Cómo busca turno el paciente: por especialidad (se ven todos los
// profesionales de esa especialidad) o por un profesional puntual.
export type BuscarTurnoPor = 'especialidad' | 'profesional';
