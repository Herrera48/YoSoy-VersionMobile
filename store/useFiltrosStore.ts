import { create } from 'zustand';

// Estado global de los filtros del listado. Lo leen tres componentes que no
// están en la misma rama del árbol: el buscador, los chips de especialidad
// (los dos dentro del encabezado de la FlatList) y la pantalla, que arma la
// consulta. Con Zustand cada uno entra directo al store, sin prop drilling.
interface FiltrosStore {
  busqueda: string;
  // null = sin filtro, se muestran todas las especialidades.
  especialidad: string | null;
  setBusqueda: (busqueda: string) => void;
  setEspecialidad: (especialidad: string | null) => void;
  limpiarFiltros: () => void;
}

export const useFiltrosStore = create<FiltrosStore>((set) => ({
  busqueda: '',
  especialidad: null,
  setBusqueda: (busqueda) => set({ busqueda }),
  setEspecialidad: (especialidad) => set({ especialidad }),
  limpiarFiltros: () => set({ busqueda: '', especialidad: null }),
}));
