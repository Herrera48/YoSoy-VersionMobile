import styled from 'styled-components/native';

import { VarianteBadge } from '../types';

interface BadgeProps {
  texto: string;
  variante: VarianteBadge;
}

// La especialidad se destaca en verde azulado (dato principal del profesional)
// y la modalidad queda en gris neutro para no competir visualmente con ella.
const COLORES: Record<VarianteBadge, { fondo: string; texto: string }> = {
  especialidad: { fondo: '#E3F1F0', texto: '#1F5E5C' },
  modalidad: { fondo: '#ECEFF1', texto: '#4A5A63' },
};

const Contenedor = styled.View<{ $variante: VarianteBadge }>`
  background-color: ${({ $variante }) => COLORES[$variante].fondo};
  border-radius: 12px;
  padding-vertical: 4px;
  padding-horizontal: 10px;
`;

const Etiqueta = styled.Text<{ $variante: VarianteBadge }>`
  color: ${({ $variante }) => COLORES[$variante].texto};
  font-size: 12px;
  font-weight: 600;
`;

export default function Badge({ texto, variante }: BadgeProps) {
  return (
    <Contenedor $variante={variante}>
      <Etiqueta $variante={variante}>{texto}</Etiqueta>
    </Contenedor>
  );
}
