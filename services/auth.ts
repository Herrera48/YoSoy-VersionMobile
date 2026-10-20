import { Sesion } from '../types';
import { ApiError, apiFetch } from './api';

interface RespuestaLogin {
  rol: string;
  idUsuario: number;
  token: string;
  idPaciente?: number | null;
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

  if (respuesta.rol !== 'paciente') {
    throw new Error('Esta app es solo para pacientes.');
  }

  return {
    usuario: usuario.trim(),
    token: respuesta.token,
    idPaciente: respuesta.idPaciente ?? null,
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
