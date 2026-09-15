import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { Modalidad } from '../types';
import Badge from './Badge';

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

// Card blanca sobre el lavanda del fondo. El contraste lo dan tres cosas
// juntas: el blanco puro, el borde sutil y una sombra suave.
// La sombra se declara para iOS (shadow-*) y para Android (elevation).
const Tarjeta = styled.View`
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.lg}px;
  border-width: 1px;
  border-color: ${theme.colores.borde};
  padding: ${theme.espaciado.lg}px;
  margin-bottom: ${theme.espaciado.md}px;
  shadow-color: ${theme.colores.sombra};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 2;
`;

const Encabezado = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Avatar = styled.Image`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background-color: ${theme.colores.fondoBadgeModalidad};
`;

const Identidad = styled.View`
  flex: 1;
  margin-left: ${theme.espaciado.md}px;
`;

const Nombre = styled.Text`
  font-size: ${theme.fuentes.lg}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoPrincipal};
`;

const Matricula = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: 2px;
`;

const Descripcion = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.md}px;
`;

const Etiquetas = styled.View`
  flex-direction: row;
  margin-top: ${theme.espaciado.md}px;
`;

// Separador entre los dos badges: el Badge no define márgenes propios para
// que el contenedor decida cómo espaciarlos.
const Separador = styled.View`
  width: ${theme.espaciado.sm}px;
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
