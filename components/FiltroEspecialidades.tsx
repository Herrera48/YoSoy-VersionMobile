import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { obtenerEspecialidades } from '../services/profesionales';
import Chip from './Chip';

// Fila de chips con scroll horizontal. Cada chip es una especialidad; tocarlo
// avisa a la pantalla por onCambiar, y ella decide dónde guardarla (el listado
// usa el store de filtros; solicitar turno, su propio estado). "Todas" limpia
// el filtro (especialidad = null).
interface FiltroEspecialidadesProps {
  especialidad: string | null;
  onCambiar: (especialidad: string | null) => void;
}

const Fila = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  /* md + el margen inferior de cada Chip (sm) = xl debajo de la fila. */
  margin-bottom: ${theme.espaciado.md}px;
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

export default function FiltroEspecialidades({
  especialidad,
  onCambiar,
}: FiltroEspecialidadesProps) {
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
      <Chip
        texto="Todas"
        activo={especialidad === null}
        onPress={() => onCambiar(null)}
        accessibilityLabel="Filtrar por Todas"
      />
      {data.map((item) => (
        <Chip
          key={item.id}
          texto={item.nombre}
          activo={especialidad === item.nombre}
          accessibilityLabel={`Filtrar por ${item.nombre}`}
          // Tocar el chip que ya está activo lo desactiva.
          onPress={() =>
            onCambiar(especialidad === item.nombre ? null : item.nombre)
          }
        />
      ))}
    </Fila>
  );
}
