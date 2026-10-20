import { useSesionStore } from '../store/useSesionStore';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiFetch<T = unknown>(
  ruta: string,
  opciones: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...(opciones.headers as Record<string, string> | undefined),
  };

  if (opciones.body) {
    headers['Content-Type'] = 'application/json';
  }

  const token = useSesionStore.getState().token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error('Falta configurar EXPO_PUBLIC_API_URL en el archivo .env.');
  }

  let respuesta: Response;
  try {
    respuesta = await fetch(`${baseUrl}${ruta}`, {
      ...opciones,
      headers,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisá tu conexión.');
  }

  if (respuesta.status === 401 && ruta !== '/login') {
    useSesionStore.getState().cerrarSesion();
    throw new Error('Tu sesión venció. Volvé a ingresar.');
  }

  if (respuesta.status === 429) {
    throw new ApiError(429, 'Hiciste muchos pedidos seguidos. Esperá unos minutos y volvé a intentar.');
  }

  if (!respuesta.ok) {
    let mensaje = 'No se pudo conectar con el servidor.';
    try {
      const cuerpo = await respuesta.json();
      if (cuerpo && typeof cuerpo.mensaje === 'string') {
        mensaje = cuerpo.mensaje;
      }
    } catch {}
    throw new ApiError(respuesta.status, mensaje);
  }

  const texto = await respuesta.text();
  return (texto ? JSON.parse(texto) : undefined) as T;
}
