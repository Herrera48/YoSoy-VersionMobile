import { FlatList } from 'react-native';
import styled from 'styled-components/native';

import Header from '../components/Header';
import ProfesionalCard from '../components/ProfesionalCard';
import { theme } from '../constants/theme';
import { profesionales } from '../data/profesionales';
import { Profesional } from '../types';

// FlatList reemplaza al ScrollView: ya scrollea por sí misma, y anidarla dentro
// de un ScrollView anula el virtualizado (renderizaría todas las cards juntas).
// El padding va en contentContainerStyle para que acompañe al contenido al
// scrollear; con styled-components se declara vía attrs.
const Lista = styled(FlatList<Profesional>).attrs({
  contentContainerStyle: {
    paddingHorizontal: theme.espaciado.xl,
    paddingTop: theme.espaciado.superiorPantalla,
    paddingBottom: theme.espaciado.xxxl,
  },
})`
  background-color: ${theme.colores.fondo};
`;

const TituloSeccion = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.bold};
  letter-spacing: ${theme.espaciadoLetra.amplio}px;
  color: ${theme.colores.violetaOscuro};
  margin-bottom: ${theme.espaciado.lg}px;
`;

const MensajeVacio = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoSecundario};
  text-align: center;
  margin-top: ${theme.espaciado.xxxl}px;
`;

function EncabezadoLista() {
  return (
    <>
      <Header
        titulo="YoSoy"
        subtitulo="Acompañamiento en salud mental, cerca tuyo."
      />
      <TituloSeccion>PROFESIONALES DISPONIBLES</TituloSeccion>
    </>
  );
}

function ListaVacia() {
  return (
    <MensajeVacio>No hay profesionales disponibles por el momento.</MensajeVacio>
  );
}

export default function Home() {
  return (
    <Lista
      data={profesionales}
      keyExtractor={(profesional) => profesional.id}
      ListHeaderComponent={EncabezadoLista}
      ListEmptyComponent={ListaVacia}
      renderItem={({ item }) => (
        <ProfesionalCard
          nombre={item.nombre}
          apellido={item.apellido}
          matricula={item.matricula}
          especialidad={item.especialidad}
          modalidad={item.modalidad}
          avatar={item.avatar}
          descripcion={item.descripcion}
        />
      )}
    />
  );
}
