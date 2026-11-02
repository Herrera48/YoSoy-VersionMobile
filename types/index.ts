export interface Especialidad {
  id: string;
  nombre: string;
}

export type Modalidad = 'Virtual' | 'Presencial';

export type VarianteBadge = 'especialidad' | 'modalidad';

export type Rol = 'paciente' | 'profesional';

export interface Sesion {
  usuario: string;
  token: string;
  rol: Rol;
  idPaciente: number | null;
  idProfesional: number | null;
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
  estado?: string;
  propuestoPorProfesional?: boolean;
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

export interface Notificacion {
  id: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  // Como la devuelve el servidor: 'DD/MM/AAAA HH:MM'.
  fecha: string;
}

// Los datos propios del paciente (pantalla "Mi perfil"). `estado` no se
// muestra ni se edita, pero hay que reenviarlo tal cual llegó al guardar: el
// backend no tiene un valor por defecto para esa columna.
export interface PerfilPaciente {
  nombre: string;
  dni: string;
  // 'AAAA-MM-DD'
  fechaNacimiento: string;
  domicilio: string;
  telefono: string;
  mail: string;
  estado: string;
}

// Los datos propios del profesional (pantalla "Mi perfil" de profesional).
// `matricula` se muestra pero no se edita desde la app. `segundoNombre`,
// `segundoApellido`, `sexo`, `origenContacto`, `fechaSolicitud` y `estado` no
// se muestran ni se editan, pero hay que reenviarlos tal cual llegaron al
// guardar: el PUT del backend pisa todas las columnas. `slug` y
// `linkPublicoActivo` son del link público de reserva, que se activa o
// apaga por separado (PUT /profesionales/{id}/link-publico).
export interface PerfilProfesional {
  nombre: string;
  apellido: string;
  dni: string;
  // 'AAAA-MM-DD'
  fechaNacimiento: string;
  telefono: string;
  mail: string;
  provincia: string;
  matricula: string;
  idEspecialidad: string;
  segundoNombre: string | null;
  segundoApellido: string | null;
  sexo: string | null;
  origenContacto: string | null;
  fechaSolicitud: string | null;
  estado: string;
  slug: string | null;
  linkPublicoActivo: boolean;
}
