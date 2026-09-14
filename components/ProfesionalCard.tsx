import styled from 'styled-components/native';

import Badge from './Badge';
import { Modalidad } from '../types';

// Componente presentacional puro: todos los datos llegan por props, no lee
// nada de data/. Así se puede reutilizar con cualquier origen de datos.
interface ProfesionalCardProps {
  nombre: string;
  apellido: string;
  matricula: string;
  especialidad: string;
  modalidad: Modalidad;
  avatar: string;
  descripcion: string;
}

const Tarjeta = styled.View`
  background-color: #ffffff;
  border-radius: 16px;
  border-width: 1px;
  border-color: #e4e9ec;
  padding: 16px;
  margin-bottom: 14px;
`;

const Encabezado = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Avatar = styled.Image`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: #eceff1;
`;

const Identidad = styled.View`
  flex: 1;
  margin-left: 12px;
`;

const Nombre = styled.Text`
  font-size: 17px;
  font-weight: 600;
  color: #1f2a30;
`;

const Matricula = styled.Text`
  font-size: 13px;
  color: #7a8a93;
  margin-top: 2px;
`;

const Descripcion = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: #5e6e77;
  margin-top: 12px;
`;

const Etiquetas = styled.View`
  flex-direction: row;
  margin-top: 12px;
`;

// Separador entre los dos badges: el Badge no define márgenes propios para
// que el contenedor decida cómo espaciarlos.
const Separador = styled.View`
  width: 8px;
`;

export default function ProfesionalCard({
  nombre,
  apellido,
  matricula,
  especialidad,
  modalidad,
  avatar,
  descripcion,
}: ProfesionalCardProps) {
  return (
    <Tarjeta>
      <Encabezado>
        <Avatar source={{ uri: avatar }} />
        <Identidad>
          <Nombre>
            {nombre} {apellido}
          </Nombre>
          <Matricula>{matricula}</Matricula>
        </Identidad>
      </Encabezado>

      <Descripcion>{descripcion}</Descripcion>

      <Etiquetas>
        <Badge texto={especialidad} variante="especialidad" />
        <Separador />
        <Badge texto={modalidad} variante="modalidad" />
      </Etiquetas>
    </Tarjeta>
  );
}
