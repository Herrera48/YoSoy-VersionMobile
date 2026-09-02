export interface Especialidad {
  id: string;
  nombre: string;
}

export interface Profesional {
  id: string;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidad: string;
  modalidad: 'Virtual' | 'Presencial';
  avatar: string;
  descripcion: string;
}
