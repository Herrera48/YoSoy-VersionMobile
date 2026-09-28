import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { obtenerEspecialidades } from '../services/profesionales';
import { useFiltrosStore } from '../store/useFiltrosStore';

// Fila de chips con scroll horizontal. Cada chip es una especialidad; tocarlo
// la guarda en el store y la pantalla vuelve a consultar con ese filtro.
// "Todas" limpia el filtro (especialidad = null).

const Fila = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  margin-bottom: ${theme.espaciado.xl}px;
`;

const Chip = styled.TouchableOpacity<{ $activo: boolean }>`
  background-color: ${({ $activo }) =>
    $activo ? theme.colores.azulPrimario : theme.colores.card};
  border-width: 1px;
  border-color: ${({ $activo }) =>
    $activo ? theme.colores.azulPrimario : theme.colores.borde};
  border-radius: ${theme.radios.circulo}px;
  padding-vertical: ${theme.espaciado.sm}px;
  padding-horizontal: ${theme.espaciado.lg}px;
  margin-right: ${theme.espaciado.sm}px;
`;

const TextoChip = styled.Text<{ $activo: boolean }>`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.semi};
  color: ${({ $activo }) =>
    $activo ? theme.colores.textoSobrePrimario : theme.colores.textoPrincipal};
`;

const Cargando = styled.View`
  align-items: flex-start;
  margin-bottom: ${theme.espaciado.xl}px;
`;

const MensajeError = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-bottom: ${theme.espaciado.xl}px;
`;

interface OpcionChipProps {
  texto: string;
  activo: boolean;
  onPress: () => void;
}

function OpcionChip({ texto, activo, onPress }: OpcionChipProps) {
  return (
    <Chip
      $activo={activo}
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      accessibilityLabel={`Filtrar por ${texto}`}
    >
      <TextoChip $activo={activo}>{texto}</TextoChip>
    </Chip>
  );
}

export default function FiltroEspecialidades() {
  const especialidad = useFiltrosStore((state) => state.especialidad);
  const setEspecialidad = useFiltrosStore((state) => state.setEspecialidad);

  const { data, isLoading, error } = useQuery({
    queryKey: ['especialidades'],
    queryFn: obtenerEspecialidades,
  });

  if (isLoading) {
    return (
      <Cargando>
        <ActivityIndicator size="small" color={theme.colores.azulPrimario} />
      </Cargando>
    );
  }

  if (error || !data) {
    return <MensajeError>No pudimos cargar las especialidades.</MensajeError>;
  }

  return (
    <Fila>
      <OpcionChip
        texto="Todas"
        activo={especialidad === null}
        onPress={() => setEspecialidad(null)}
      />
      {data.map((item) => (
        <OpcionChip
          key={item.id}
          texto={item.nombre}
          activo={especialidad === item.nombre}
          // Tocar el chip que ya está activo lo desactiva.
          onPress={() =>
            setEspecialidad(especialidad === item.nombre ? null : item.nombre)
          }
        />
      ))}
    </Fila>
  );
}
