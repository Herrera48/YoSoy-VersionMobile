import { create } from 'zustand';

import { Rol } from '../types';
import { useFiltrosStore } from './useFiltrosStore';

interface SesionStore {
  usuario: string | null;
  token: string | null;
  rol: Rol | null;
  idPaciente: number | null;
  idProfesional: number | null;
  guardarSesion: (
    usuario: string,
    token: string,
    rol: Rol,
    idPaciente: number | null,
    idProfesional: number | null
  ) => void;
  cerrarSesion: () => void;
}

export const useSesionStore = create<SesionStore>((set) => ({
  usuario: null,
  token: null,
  rol: null,
  idPaciente: null,
  idProfesional: null,
  guardarSesion: (usuario, token, rol, idPaciente, idProfesional) =>
    set({ usuario, token, rol, idPaciente, idProfesional }),
  cerrarSesion: () => {
    useFiltrosStore.getState().limpiarFiltros();
    set({ usuario: null, token: null, rol: null, idPaciente: null, idProfesional: null });
  },
}));
