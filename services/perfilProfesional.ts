import { PerfilProfesional } from '../types';
import { apiFetch } from './api';

interface ProfesionalApiCompleto {
  idProfesional: number;
  nombre: string;
  apellido: string | null;
  segundoNombre: string | null;
  segundoApellido: string | null;
  dni: string | null;
  sexo: string | null;
  fechaNacimiento: string | null;
  matricula: string;
  idEspecialidad: number;
  provincia: string | null;
  origenContacto: string | null;
  estado: string;
  mail: string;
  telefono: string;
  fechaSolicitud: string | null;
  slug: string | null;
  linkPublicoActivo: boolean;
}

export async function obtenerPerfilProfesional(idProfesional: number): Promise<PerfilProfesional> {
  const p = await apiFetch<ProfesionalApiCompleto>(`/profesionales/${idProfesional}`);
  return {
    nombre: p.nombre,
    apellido: p.apellido ?? '',
    dni: p.dni ?? '',
    fechaNacimiento: p.fechaNacimiento ? p.fechaNacimiento.slice(0, 10) : '',
    telefono: p.telefono ?? '',
    mail: p.mail,
    provincia: p.provincia ?? '',
    matricula: p.matricula,
    idEspecialidad: String(p.idEspecialidad),
    segundoNombre: p.segundoNombre,
    segundoApellido: p.segundoApellido,
    sexo: p.sexo,
    origenContacto: p.origenContacto,
    fechaSolicitud: p.fechaSolicitud,
    estado: p.estado,
    slug: p.slug,
    linkPublicoActivo: p.linkPublicoActivo,
  };
}

export async function actualizarPerfilProfesional(
  idProfesional: number,
  perfil: PerfilProfesional
): Promise<void> {
  await apiFetch(`/profesionales/${idProfesional}`, {
    method: 'PUT',
    body: JSON.stringify({
      idProfesional,
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      segundoNombre: perfil.segundoNombre,
      segundoApellido: perfil.segundoApellido,
      dni: perfil.dni,
      sexo: perfil.sexo,
      fechaNacimiento: perfil.fechaNacimiento,
      matricula: perfil.matricula,
      idEspecialidad: Number(perfil.idEspecialidad),
      provincia: perfil.provincia,
      origenContacto: perfil.origenContacto,
      estado: perfil.estado,
      mail: perfil.mail,
      telefono: perfil.telefono,
      fechaSolicitud: perfil.fechaSolicitud,
    }),
  });
}

export async function activarLinkPublico(
  idProfesional: number,
  activo: boolean
): Promise<{ slug: string | null; linkPublicoActivo: boolean }> {
  return apiFetch(`/profesionales/${idProfesional}/link-publico`, {
    method: 'PUT',
    body: JSON.stringify({ activo }),
  });
}
