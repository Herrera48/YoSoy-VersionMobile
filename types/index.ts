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
