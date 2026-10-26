import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';

import CasoCard from '../../components/CasoCard';
import Header from '../../components/Header';
import { theme } from '../../constants/theme';
import { CasoProfesional, obtenerMisCasos } from '../../services/casos';
import { useSesionStore } from '../../store/useSesionStore';

// Mis casos (lado profesional): seguimiento de los casos abiertos del
// profesional (Nuevo/Derivado/Asignado/En atención), distinto de Mis
// pacientes (que es la asignación paciente-profesional en sí). Solo lectura.
const Lista = styled(FlatList<CasoProfesional>).attrs({
  contentContainerStyle: {
    paddingHorizontal: theme.espaciado.xl,
    paddingTop: theme.espaciado.superiorPantalla,
    paddingBottom: theme.espaciado.xxxl,
  },
})`
  background-color: ${theme.colores.fondo};
`;

const BotonVolver = styled.TouchableOpacity`
  align-self: flex-start;
  padding-vertical: ${theme.espaciado.sm}px;
  margin-bottom: ${theme.espaciado.lg}px;
`;

const TextoVolver = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.azulPrimario};
`;

const TituloSeccion = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.bold};
  letter-spacing: ${theme.espaciadoLetra.amplio}px;
  color: ${theme.colores.violetaOscuro};
  margin-bottom: ${theme.espaciado.lg}px;
`;

const EstadoLista = styled.View`
  align-items: center;
  margin-top: ${theme.espaciado.xxxl}px;
`;

const Mensaje = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoSecundario};
  text-align: center;
`;

const BotonAccion = styled.TouchableOpacity`
  padding-vertical: ${theme.espaciado.sm}px;
  margin-top: ${theme.espaciado.md}px;
`;

const TextoAccion = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.azulPrimario};
`;

export default function MisCasos() {
  const router = useRouter();
  const idProfesional = useSesionStore((state) => state.idProfesional);

  const { data, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: ['mis-casos', idProfesional],
    queryFn: () => obtenerMisCasos(idProfesional!),
    enabled: idProfesional !== null,
  });

  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  };

  const renderEstadoLista = () => {
    if (isLoading) {
      return (
        <EstadoLista>
          <ActivityIndicator size="large" color={theme.colores.azulPrimario} />
        </EstadoLista>
      );
    }

    if (error) {
      return (
        <EstadoLista>
          <Mensaje>No pudimos cargar tus casos.</Mensaje>
          <BotonAccion onPress={() => refetch()} accessibilityRole="button">
            <TextoAccion>Reintentar</TextoAccion>
          </BotonAccion>
        </EstadoLista>
      );
    }

    return (
      <EstadoLista>
        <Mensaje>No tenés casos abiertos por el momento.</Mensaje>
      </EstadoLista>
    );
  };

  return (
    <Lista
      data={data ?? []}
      keyExtractor={(caso) => String(caso.idCaso)}
      ListHeaderComponent={
        <>
          <BotonVolver onPress={volver} accessibilityRole="button" accessibilityLabel="Volver al menú">
            <TextoVolver>← Menú</TextoVolver>
          </BotonVolver>
          <Header titulo="YoSoy" subtitulo="Seguimiento de tus casos abiertos." />
          <TituloSeccion>CASOS</TituloSeccion>
        </>
      }
      ListEmptyComponent={renderEstadoLista()}
      renderItem={({ item }) => <CasoCard caso={item} />}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          colors={[theme.colores.azulPrimario]}
          tintColor={theme.colores.azulPrimario}
        />
      }
    />
  );
}
