import { Sesion } from '../types';
import { esperar } from './simulacion';

// Autenticación SIMULADA: por ahora cualquier usuario y contraseña son
// válidos. Cuando exista la API, estas funciones pasan a hacer el fetch real
// (y a lanzar un error si las credenciales son incorrectas); las pantallas ya
// manejan ese caso con try/catch, así que no hay que tocarlas.

export async function iniciarSesion(
  usuario: string,
  clave: string
): Promise<Sesion> {
  await esperar();
  // La clave no se valida todavía; se recibe para que la firma sea la misma
  // que tendrá con la API.
  void clave;
  return { usuario: usuario.trim() };
}

// Por seguridad, la API real responde igual exista o no una cuenta con ese
// correo: así no se puede averiguar qué correos están registrados.
export async function solicitarRecuperoClave(correo: string): Promise<void> {
  await esperar();
  void correo;
}
