import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { Modalidad } from '../types';
import Chip from './Chip';

// Fila de chips para filtrar por modalidad de atención. Igual que
// FiltroEspecialidades, solo avisa por onCambiar y la pantalla decide dónde
// guardarla (el listado usa el store de filtros; solicitar turno, su propio
// estado). null = sin filtro, virtual y presencial.
// Son solo dos opciones fijas, así que no hace falta pedirlas a la API.
interface FiltroModalidadProps {
  modalidad: Modalidad | null;
  onCambiar: (modalidad: Modalidad | null) => void;
}

const MODALIDADES: Modalidad[] = ['Virtual', 'Presencial'];

const Fila = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  /* md + el margen inferior de cada Chip (sm) = xl debajo de la fila. */
  margin-bottom: ${theme.espaciado.md}px;
`;

export default function FiltroModalidad({
  modalidad,
  onCambiar,
}: FiltroModalidadProps) {
  return (
    <Fila>
      <Chip
        texto="Virtual y presencial"
        activo={modalidad === null}
        onPress={() => onCambiar(null)}
        accessibilityLabel="Mostrar atención virtual y presencial"
      />
      {MODALIDADES.map((item) => (
        <Chip
          key={item}
          texto={item}
          activo={modalidad === item}
          accessibilityLabel={`Filtrar por atención ${item.toLowerCase()}`}
          // Tocar el chip que ya está activo lo desactiva.
          onPress={() => onCambiar(modalidad === item ? null : item)}
        />
      ))}
    </Fila>
  );
}
