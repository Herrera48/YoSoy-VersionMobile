import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';

// Botón de acción principal de un formulario. Mientras `cargando` es true
// muestra un spinner en lugar del texto y no responde a toques, para que no
// se pueda enviar el mismo formulario dos veces.
interface BotonPrimarioProps {
  texto: string;
  onPress: () => void;
  cargando?: boolean;
}

const Boton = styled.TouchableOpacity<{ $cargando: boolean }>`
  background-color: ${theme.colores.azulPrimario};
  border-radius: ${theme.radios.md}px;
  padding-vertical: ${theme.espaciado.md}px;
  align-items: center;
  opacity: ${({ $cargando }) =>
    $cargando ? theme.opacidades.deshabilitado : 1};
`;

const Texto = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoSobrePrimario};
`;

export default function BotonPrimario({
  texto,
  onPress,
  cargando = false,
}: BotonPrimarioProps) {
  return (
    <Boton
      $cargando={cargando}
      disabled={cargando}
      activeOpacity={0.8}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={texto}
      accessibilityState={{ busy: cargando, disabled: cargando }}
    >
      {cargando ? (
        <ActivityIndicator color={theme.colores.textoSobrePrimario} />
      ) : (
        <Texto>{texto}</Texto>
      )}
    </Boton>
  );
}
