import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';

// Campo de búsqueda de profesionales. Recibe el texto y avisa cada cambio por
// onCambiar: lo usan el listado (con el store de filtros) y solicitar turno
// (con su propio estado).
interface BuscadorProfesionalesProps {
  valor: string;
  onCambiar: (texto: string) => void;
}

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

export default function BuscadorProfesionales({
  valor,
  onCambiar,
}: BuscadorProfesionalesProps) {
  return (
    <Contenedor>
      <Ionicons
        name="search"
        size={theme.iconos.md}
        color={theme.colores.textoSecundario}
      />
      <Campo
        value={valor}
        onChangeText={onCambiar}
        placeholder="Buscar por nombre o especialidad"
        placeholderTextColor={theme.colores.textoSecundario}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel="Buscar profesionales"
      />
      {valor !== '' && (
        <BotonBorrar
          onPress={() => onCambiar('')}
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
