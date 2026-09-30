export interface Especialidad {
  id: string;
  nombre: string;
}

export type Modalidad = 'Virtual' | 'Presencial';

export type VarianteBadge = 'especialidad' | 'modalidad';

// Lo que devuelve el inicio de sesión. Hoy solo el usuario; con la API
// sumará el token.
export interface Sesion {
  usuario: string;
}

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

// Una entrada del autorregistro del estado de ánimo (Feature 6). Sigue las
// columnas de la planilla de autorregistro: qué pasó, qué pensó el paciente,
// cómo se sintió, qué hizo y qué pasó después.
export interface RegistroAnimo {
  id: string;
  // Cuándo ocurrió el acontecimiento: AAAA-MM-DD y HH:MM.
  fecha: string;
  hora: string;
  acontecimiento: string;
  pensamientos: string;
  emociones: string;
  conducta: string;
  consecuencias: string;
}

// Lo que completa el paciente en el formulario: todo menos el id, que lo
// asigna el "servidor".
export type NuevoRegistroAnimo = Omit<RegistroAnimo, 'id'>;

// Los campos de texto libre del registro.
export type CampoRegistroAnimo =
  | 'acontecimiento'
  | 'pensamientos'
  | 'emociones'
  | 'conducta'
  | 'consecuencias';
