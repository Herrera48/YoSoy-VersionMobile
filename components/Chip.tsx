import styled from 'styled-components/native';

import { theme } from '../constants/theme';

// Opción seleccionable en forma de píldora. La usan los filtros de
// especialidad: cuando está activa se pinta con el azul de la marca.
interface ChipProps {
  texto: string;
  activo: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

const Contenedor = styled.TouchableOpacity<{ $activo: boolean }>`
  background-color: ${({ $activo }) =>
    $activo ? theme.colores.azulPrimario : theme.colores.card};
  border-width: 1px;
  border-color: ${({ $activo }) =>
    $activo ? theme.colores.azulPrimario : theme.colores.borde};
  border-radius: ${theme.radios.circulo}px;
  padding-vertical: ${theme.espaciado.sm}px;
  padding-horizontal: ${theme.espaciado.lg}px;
  margin-right: ${theme.espaciado.sm}px;
  margin-bottom: ${theme.espaciado.sm}px;
`;

const Texto = styled.Text<{ $activo: boolean }>`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.semi};
  color: ${({ $activo }) =>
    $activo ? theme.colores.textoSobrePrimario : theme.colores.textoPrincipal};
`;

export default function Chip({
  texto,
  activo,
  onPress,
  accessibilityLabel = texto,
}: ChipProps) {
  return (
    <Contenedor
      $activo={activo}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      accessibilityLabel={accessibilityLabel}
    >
      <Texto $activo={activo}>{texto}</Texto>
    </Contenedor>
  );
}
