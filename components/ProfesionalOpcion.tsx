import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { Profesional } from '../types';

// Fila compacta para elegir un profesional al pedir turno. Presentacional:
// recibe el profesional y si está elegido, y avisa el toque por onPress.
interface ProfesionalOpcionProps {
  profesional: Profesional;
  activo: boolean;
  onPress: () => void;
}

const Fila = styled.TouchableOpacity<{ $activo: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.md}px;
  border-width: ${({ $activo }) => ($activo ? '2px' : '1px')};
  border-color: ${({ $activo }) =>
    $activo ? theme.colores.azulPrimario : theme.colores.borde};
  padding: ${theme.espaciado.md}px;
  margin-bottom: ${theme.espaciado.sm}px;
`;

const Avatar = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${theme.colores.fondoBadgeModalidad};
`;

const Textos = styled.View`
  flex: 1;
  margin-left: ${theme.espaciado.md}px;
`;

const Nombre = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoPrincipal};
`;

const Detalle = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: 2px;
`;

export default function ProfesionalOpcion({
  profesional,
  activo,
  onPress,
}: ProfesionalOpcionProps) {
  return (
    <Fila
      $activo={activo}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      accessibilityLabel={`${profesional.nombre} ${profesional.apellido}, ${profesional.especialidad}`}
    >
      <Avatar source={{ uri: profesional.avatar }} />
      <Textos>
        <Nombre>
          {profesional.nombre} {profesional.apellido}
        </Nombre>
        <Detalle>
          {profesional.especialidad} · {profesional.modalidad}
        </Detalle>
      </Textos>
      {activo && (
        <Ionicons
          name="checkmark-circle"
          size={theme.iconos.lg}
          color={theme.colores.azulPrimario}
        />
      )}
    </Fila>
  );
}
