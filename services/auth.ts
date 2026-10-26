import { Sesion } from '../types';
import { ApiError, apiFetch } from './api';

interface RespuestaLogin {
  rol?: string;
  idUsuario?: number;
  token?: string;
  idPaciente?: number | null;
  idProfesional?: number | null;
  // Cuenta del equipo con más de un módulo asignado: el login no elige solo
  // y pide pasar por la pantalla de selección, que la app todavía no tiene.
  requiereModulo?: boolean;
}

interface RespuestaRecuperoClave {
  mensaje?: string;
}

export interface DatosRegistroPaciente {
  nombre: string;
  dni: string;
  fechaNacimiento: string;
  domicilio: string;
  telefono: string | null;
  mail: string;
  usuario: string;
  contrasena: string;
}

export async function iniciarSesion(usuario: string, clave: string): Promise<Sesion> {
  let respuesta: RespuestaLogin;
  try {
    respuesta = await apiFetch<RespuestaLogin>('/login', {
      method: 'POST',
      body: JSON.stringify({ username: usuario, password: clave }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      throw new Error('Usuario o contraseña incorrectos.');
    }
    throw error;
  }

  if (respuesta.requiereModulo) {
    throw new Error(
      'Tu cuenta tiene más de un rol asignado: todavía no se puede elegir desde la app. Ingresá desde la web.'
    );
  }
  if (respuesta.rol !== 'paciente' && respuesta.rol !== 'profesional') {
    throw new Error('Esta app es solo para pacientes y profesionales.');
  }

  return {
    usuario: usuario.trim(),
    token: respuesta.token as string,
    rol: respuesta.rol,
    idPaciente: respuesta.idPaciente ?? null,
    idProfesional: respuesta.idProfesional ?? null,
  };
}

export async function registrarPaciente(datos: DatosRegistroPaciente): Promise<void> {
  await apiFetch('/pacientes', {
    method: 'POST',
    body: JSON.stringify(datos),
  });
}

export async function solicitarRecuperoClave(usuario: string): Promise<string> {
  const respuesta = await apiFetch<RespuestaRecuperoClave>('/recuperacion-password', {
    method: 'POST',
    body: JSON.stringify({ username: usuario }),
  });
  return respuesta?.mensaje ?? '';
}
