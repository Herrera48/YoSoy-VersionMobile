// Demora artificial para simular la latencia de red mientras no hay backend.
// Así los estados de carga (spinners, botones deshabilitados) se ven en
// pantalla igual que se verán con la API real.
export const DEMORA_MS = 600;

export const esperar = (ms: number = DEMORA_MS) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
