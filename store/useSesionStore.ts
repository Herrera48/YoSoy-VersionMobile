import { create } from 'zustand';

// Sesión del paciente. La lee el layout del grupo (app) para decidir si deja
// entrar a las pantallas privadas, y el menú para saludar y cerrar sesión.
// Vive en memoria: al recargar la app hay que volver a iniciar sesión. Cuando
// haya API se persistirá el token.
interface SesionStore {
  // null = no hay sesión iniciada.
  usuario: string | null;
  guardarSesion: (usuario: string) => void;
  cerrarSesion: () => void;
}

export const useSesionStore = create<SesionStore>((set) => ({
  usuario: null,
  guardarSesion: (usuario) => set({ usuario }),
  cerrarSesion: () => set({ usuario: null }),
}));
