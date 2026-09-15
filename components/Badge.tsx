import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { VarianteBadge } from '../types';

// Las dos variantes se leen como una familia: especialidad en la rama azul de
// la marca, modalidad en la violeta. Antes eran un verde y un gris que no
// pertenecían a la identidad y parecían de dos sistemas distintos.
const COLORES: Record<VarianteBadge, { fondo: string; texto: string }> = {
  especialidad: {
    fondo: theme.colores.fondoBadgeEspecialidad,
    texto: theme.colores.azulPrimario,
  },
  modalidad: {
    fondo: theme.colores.fondoBadgeModalidad,
    texto: theme.colores.violetaPrimario,
  },
};

interface BadgeProps {
  texto: string;
  variante: VarianteBadge;
}

const Contenedor = styled.View<{ $variante: VarianteBadge }>`
  background-color: ${({ $variante }) => COLORES[$variante].fondo};
  border-radius: ${theme.radios.md}px;
  padding-vertical: ${theme.espaciado.xs}px;
  padding-horizontal: ${theme.espaciado.md}px;
`;

const Etiqueta = styled.Text<{ $variante: VarianteBadge }>`
  color: ${({ $variante }) => COLORES[$variante].texto};
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.semi};
  letter-spacing: ${theme.espaciadoLetra.normal}px;
`;

export default function Badge({ texto, variante }: BadgeProps) {
  return (
    <Contenedor $variante={variante}>
      <Etiqueta $variante={variante}>{texto}</Etiqueta>
    </Contenedor>
  );
}
