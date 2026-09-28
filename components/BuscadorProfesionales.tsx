import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { useFiltrosStore } from '../store/useFiltrosStore';

// A diferencia de ProfesionalCard, este componente no es presentacional: lee
// y escribe el texto de búsqueda en el store de Zustand. Por eso no recibe
// props y la pantalla puede usarlo como encabezado de la FlatList sin tener
// que pasarle nada.

const Contenedor = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.md}px;
  border-width: 1px;
  border-color: ${theme.colores.borde};
  padding-horizontal: ${theme.espaciado.md}px;
  margin-bottom: ${theme.espaciado.md}px;
`;

const Campo = styled.TextInput`
  flex: 1;
  font-size: ${theme.fuentes.md}px;
  color: ${theme.colores.textoPrincipal};
  padding-vertical: ${theme.espaciado.md}px;
  margin-left: ${theme.espaciado.sm}px;
`;

const BotonBorrar = styled.TouchableOpacity`
  padding: ${theme.espaciado.xs}px;
`;

export default function BuscadorProfesionales() {
  // Suscripción selectiva: solo re-renderiza cuando cambia la búsqueda, no
  // cuando se elige otra especialidad.
  const busqueda = useFiltrosStore((state) => state.busqueda);
  const setBusqueda = useFiltrosStore((state) => state.setBusqueda);

  return (
    <Contenedor>
      <Ionicons
        name="search"
        size={theme.iconos.md}
        color={theme.colores.textoSecundario}
      />
      <Campo
        value={busqueda}
        onChangeText={setBusqueda}
        placeholder="Buscar por nombre o especialidad"
        placeholderTextColor={theme.colores.textoSecundario}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Buscar profesionales"
      />
      {busqueda !== '' && (
        <BotonBorrar
          onPress={() => setBusqueda('')}
          accessibilityRole="button"
          accessibilityLabel="Borrar búsqueda"
        >
          <Ionicons
            name="close-circle"
            size={theme.iconos.md}
            color={theme.colores.textoSecundario}
          />
        </BotonBorrar>
      )}
    </Contenedor>
  );
}
