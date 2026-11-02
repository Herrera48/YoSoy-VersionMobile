import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { Rol } from '../types';
import { useFiltrosStore } from './useFiltrosStore';

interface SesionStore {
  usuario: string | null;
  token: string | null;
  rol: Rol | null;
  idPaciente: number | null;
  idProfesional: number | null;
  hidratado: boolean;
  guardarSesion: (
    usuario: string,
    token: string,
    rol: Rol,
    idPaciente: number | null,
    idProfesional: number | null
  ) => void;
  cerrarSesion: () => void;
}

export const useSesionStore = create<SesionStore>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      rol: null,
      idPaciente: null,
      idProfesional: null,
      hidratado: false,
      guardarSesion: (usuario, token, rol, idPaciente, idProfesional) =>
        set({ usuario, token, rol, idPaciente, idProfesional }),
      cerrarSesion: () => {
        useFiltrosStore.getState().limpiarFiltros();
        set({ usuario: null, token: null, rol: null, idPaciente: null, idProfesional: null });
      },
    }),
    {
      name: 'yosoy-sesion',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useSesionStore.setState({ hidratado: true });
      },
    }
  )
);
