import { create } from 'zustand';

import { useFiltrosStore } from './useFiltrosStore';

interface SesionStore {
  usuario: string | null;
  token: string | null;
  idPaciente: number | null;
  guardarSesion: (usuario: string, token: string, idPaciente: number | null) => void;
  cerrarSesion: () => void;
}

export const useSesionStore = create<SesionStore>((set) => ({
  usuario: null,
  token: null,
  idPaciente: null,
  guardarSesion: (usuario, token, idPaciente) => set({ usuario, token, idPaciente }),
  cerrarSesion: () => {
    useFiltrosStore.getState().limpiarFiltros();
    set({ usuario: null, token: null, idPaciente: null });
  },
}));
