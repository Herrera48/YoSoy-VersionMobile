import { useSesionStore } from '../store/useSesionStore';
import { ApiError, apiFetch } from './api';

// El destino lo elige el equipo de admisión al aceptar la solicitud: acá
// viaja igual al origen, como hace la web.
export async function solicitarCambioProfesional(
  idProfesionalOrigen: string,
  motivo: string | null
): Promise<void> {
  const idPaciente = useSesionStore.getState().idPaciente;
  if (idPaciente === null) {
    throw new Error('Tu sesión venció. Volvé a ingresar.');
  }

  try {
    await apiFetch('/derivaciones', {
      method: 'POST',
      body: JSON.stringify({
        idPaciente,
        idProfesionalOrigen: Number(idProfesionalOrigen),
        idProfesionalDestino: Number(idProfesionalOrigen),
        motivo,
      }),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      throw new Error(
        'No pudimos enviar tu solicitud en este momento. Escribinos por los canales habituales mientras lo solucionamos.'
      );
    }
    throw error;
  }
}
