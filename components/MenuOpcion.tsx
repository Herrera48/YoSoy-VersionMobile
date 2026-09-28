import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import Badge from './Badge';

// Opción del menú principal. Presentacional, igual que ProfesionalCard: no
// sabe a dónde navega, la acción llega por onPress. Si `disponible` es false
// la opción se ve atenuada, no responde a toques y muestra "Próximamente".
export type NombreIcono = ComponentProps<typeof Ionicons>['name'];

interface MenuOpcionProps {
  titulo: string;
  descripcion: string;
  icono: NombreIcono;
  disponible: boolean;
  onPress: () => void;
}

const Tarjeta = styled.TouchableOpacity<{ $disponible: boolean }>`
  flex-direction: row;
  align-items: center;
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.lg}px;
  border-width: 1px;
  border-color: ${theme.colores.borde};
  padding: ${theme.espaciado.lg}px;
  margin-bottom: ${theme.espaciado.md}px;
  opacity: ${({ $disponible }) =>
    $disponible ? 1 : theme.opacidades.deshabilitado};
  shadow-color: ${theme.colores.sombra};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 2;
`;

const CirculoIcono = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${theme.colores.fondoBadgeEspecialidad};
  align-items: center;
  justify-content: center;
`;

const Textos = styled.View`
  flex: 1;
  margin-horizontal: ${theme.espaciado.md}px;
`;

const Titulo = styled.Text`
  font-size: ${theme.fuentes.lg}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoPrincipal};
`;

const Descripcion = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: 2px;
`;

const Proximamente = styled.View`
  margin-top: ${theme.espaciado.sm}px;
  align-self: flex-start;
`;

export default function MenuOpcion({
  titulo,
  descripcion,
  icono,
  disponible,
  onPress,
}: MenuOpcionProps) {
  return (
    <Tarjeta
      $disponible={disponible}
      disabled={!disponible}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={disponible ? titulo : `${titulo}, próximamente`}
      accessibilityState={{ disabled: !disponible }}
    >
      <CirculoIcono>
        <Ionicons
          name={icono}
          size={theme.iconos.lg}
          color={theme.colores.azulPrimario}
        />
      </CirculoIcono>

      <Textos>
        <Titulo>{titulo}</Titulo>
        <Descripcion>{descripcion}</Descripcion>
        {!disponible && (
          <Proximamente>
            <Badge texto="Próximamente" variante="modalidad" />
          </Proximamente>
        )}
      </Textos>

      {disponible && (
        <Ionicons
          name="chevron-forward"
          size={theme.iconos.md}
          color={theme.colores.textoSecundario}
        />
      )}
    </Tarjeta>
  );
}
