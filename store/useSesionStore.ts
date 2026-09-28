import { create } from 'zustand';

import { useFiltrosStore } from './useFiltrosStore';

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
  // Los filtros del listado son de la sesión: si no se limpian, el próximo
  // usuario que entre ve la búsqueda del anterior. Se hace acá y no en el
  // botón del menú para que cualquier cierre de sesión los limpie.
  cerrarSesion: () => {
    useFiltrosStore.getState().limpiarFiltros();
    set({ usuario: null });
  },
}));
