import { useSesionStore } from '../store/useSesionStore';
import { Notificacion } from '../types';
import { apiFetch } from './api';

interface NotificacionApi {
  idNotificacion: number;
  titulo: string;
  mensaje: string;
  link: string | null;
  leida: boolean;
  fecha: string;
}

export async function obtenerNotificaciones(): Promise<Notificacion[]> {
  const idPaciente = useSesionStore.getState().idPaciente;
  if (idPaciente === null) {
    return [];
  }
  const notificaciones = await apiFetch<NotificacionApi[]>(
    `/pacientes/${idPaciente}/notificaciones`
  );
  return notificaciones
    .map(
      (n): Notificacion => ({
        id: String(n.idNotificacion),
        titulo: n.titulo,
        mensaje: n.mensaje,
        leida: n.leida,
        fecha: n.fecha,
      })
    )
    .sort((a, b) => Number(b.id) - Number(a.id));
}

export async function marcarNotificacionLeida(id: string): Promise<void> {
  await apiFetch(`/notificaciones/${id}/leida`, { method: 'PUT' });
}
