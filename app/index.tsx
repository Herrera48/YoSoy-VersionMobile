import styled from 'styled-components/native';

import Header from '../components/Header';
import ProfesionalCard from '../components/ProfesionalCard';
import { theme } from '../constants/theme';
import { profesionales } from '../data/profesionales';

const Pantalla = styled.ScrollView`
  background-color: ${theme.colores.fondo};
`;

// El padding vive en un View interno y no en el ScrollView: así el fondo
// cubre toda la pantalla y el espaciado acompaña al contenido al scrollear.
const Contenido = styled.View`
  padding-horizontal: ${theme.espaciado.xl}px;
  padding-top: 56px;
  padding-bottom: ${theme.espaciado.xxxl}px;
`;

const TituloSeccion = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.bold};
  letter-spacing: ${theme.espaciadoLetra.amplio}px;
  color: ${theme.colores.violetaOscuro};
  margin-bottom: ${theme.espaciado.lg}px;
`;

export default function Home() {
  return (
    <Pantalla>
      <Contenido>
        <Header
          titulo="YoSoy"
          subtitulo="Acompañamiento en salud mental, cerca tuyo."
        />

        <TituloSeccion>PROFESIONALES DISPONIBLES</TituloSeccion>

        {profesionales.map((profesional) => (
          <ProfesionalCard
            key={profesional.id}
            nombre={profesional.nombre}
            apellido={profesional.apellido}
            matricula={profesional.matricula}
            especialidad={profesional.especialidad}
            modalidad={profesional.modalidad}
            avatar={profesional.avatar}
            descripcion={profesional.descripcion}
          />
        ))}
      </Contenido>
    </Pantalla>
  );
}
