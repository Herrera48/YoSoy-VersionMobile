import { PerfilPaciente } from '../types';
import { apiFetch } from './api';

interface PacienteApi {
  idPaciente: number;
  nombre: string;
  dni: string;
  fechaNacimiento: string | null;
  domicilio: string | null;
  telefono: string | null;
  mail: string;
  estado: string;
}

export async function obtenerPerfil(idPaciente: number): Promise<PerfilPaciente> {
  const p = await apiFetch<PacienteApi>(`/pacientes/${idPaciente}`);
  return {
    nombre: p.nombre,
    dni: p.dni,
    fechaNacimiento: p.fechaNacimiento ? p.fechaNacimiento.slice(0, 10) : '',
    domicilio: p.domicilio ?? '',
    telefono: p.telefono ?? '',
    mail: p.mail,
    // No se edita desde la app: se reenvía tal cual llegó para no pisarlo.
    estado: p.estado,
  };
}

export async function actualizarPerfil(
  idPaciente: number,
  perfil: PerfilPaciente
): Promise<void> {
  await apiFetch(`/pacientes/${idPaciente}`, {
    method: 'PUT',
    body: JSON.stringify(perfil),
  });
}
