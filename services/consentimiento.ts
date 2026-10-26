import { apiFetch } from './api';

export interface EstadoConsentimiento {
  firmado: boolean;
  fechaFirma: string | null;
  versionFirmada: string | null;
  tipo: string;
  versionTexto: string;
}

export async function obtenerConsentimiento(idPaciente: number): Promise<EstadoConsentimiento> {
  return apiFetch<EstadoConsentimiento>(`/pacientes/${idPaciente}/consentimiento-telemedicina`);
}

export async function firmarConsentimiento(idPaciente: number, version: string): Promise<void> {
  await apiFetch(`/pacientes/${idPaciente}/consentimiento-telemedicina`, {
    method: 'POST',
    body: JSON.stringify({ acepto: true, version }),
  });
}
