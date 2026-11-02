import { useEffect } from 'react';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { useEscalaPresion } from '../hooks/useEscalaPresion';

// Opción seleccionable en forma de píldora. La usan los filtros de
// especialidad: cuando está activa se pinta con el azul de la marca.
interface ChipProps {
  texto: string;
  activo: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

const Contenedor = styled.TouchableOpacity`
  margin-right: ${theme.espaciado.sm}px;
  margin-bottom: ${theme.espaciado.sm}px;
`;

const Pildora = styled(Animated.View)`
  border-width: 1px;
  border-radius: ${theme.radios.circulo}px;
  padding-vertical: ${theme.espaciado.sm}px;
  padding-horizontal: ${theme.espaciado.lg}px;
`;

const Texto = styled(Animated.Text)`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.semi};
`;

export default function Chip({
  texto,
  activo,
  onPress,
  accessibilityLabel = texto,
}: ChipProps) {
  const progreso = useSharedValue(activo ? 1 : 0);
  const { estiloEscala, alPresionar, alSoltar } = useEscalaPresion(0.94);

  useEffect(() => {
    progreso.value = withTiming(activo ? 1 : 0, { duration: 200 });
  }, [activo, progreso]);

  const estiloPildora = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progreso.value,
      [0, 1],
      [theme.colores.card, theme.colores.azulPrimario]
    ),
    borderColor: interpolateColor(
      progreso.value,
      [0, 1],
      [theme.colores.borde, theme.colores.azulPrimario]
    ),
  }));

  const estiloTexto = useAnimatedStyle(() => ({
    color: interpolateColor(
      progreso.value,
      [0, 1],
      [theme.colores.textoPrincipal, theme.colores.textoSobrePrimario]
    ),
  }));

  return (
    <Contenedor
      activeOpacity={1}
      onPress={onPress}
      onPressIn={alPresionar}
      onPressOut={alSoltar}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      accessibilityLabel={accessibilityLabel}
    >
      <Pildora style={[estiloPildora, estiloEscala]}>
        <Texto style={estiloTexto}>{texto}</Texto>
      </Pildora>
    </Contenedor>
  );
}
