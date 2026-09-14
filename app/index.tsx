import styled from 'styled-components/native';

import Header from '../components/Header';
import ProfesionalCard from '../components/ProfesionalCard';
import { profesionales } from '../data/profesionales';

const Pantalla = styled.ScrollView`
  background-color: #f5f7f8;
`;

// El padding vive en un View interno y no en el ScrollView: así el fondo
// cubre toda la pantalla y el espaciado acompaña al contenido al scrollear.
const Contenido = styled.View`
  padding-horizontal: 20px;
  padding-top: 56px;
  padding-bottom: 32px;
`;

const TituloSeccion = styled.Text`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #7a8a93;
  margin-bottom: 14px;
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
