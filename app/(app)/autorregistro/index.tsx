import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';

import BotonPrimario from '../../../components/BotonPrimario';
import Header from '../../../components/Header';
import RegistroCard from '../../../components/RegistroCard';
import { theme } from '../../../constants/theme';
import { obtenerMisRegistros } from '../../../services/autorregistro';
import { useSesionStore } from '../../../store/useSesionStore';
import { RegistroAnimo } from '../../../types';

// Autorregistro del estado de ánimo (Feature 6): los registros del paciente,
// del más reciente al más antiguo, y el botón para cargar uno nuevo
// (autorregistro/nuevo.tsx). Sigue la planilla de autorregistro: qué pasó,
// qué pensó, cómo se sintió, qué hizo y qué pasó después.
//
// Misma estructura que "Mis turnos": FlatList con el encabezado en
// ListHeaderComponent y la carga, el error y el estado vacío en
// ListEmptyComponent.
//
// Los registros se guardan en memoria (services/autorregistro.ts): al recargar
// la app la lista vuelve a quedar vacía.

const Lista = styled(FlatList<RegistroAnimo>).attrs({
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

const ContenedorBoton = styled.View`
  align-self: stretch;
  margin-bottom: ${theme.espaciado.xxl}px;
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
  margin-top: ${theme.espaciado.xxl}px;
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

// Definido fuera de la pantalla, como en "Mis turnos": así la FlatList
// recibe siempre el mismo componente y no lo recrea en cada render.
function EncabezadoLista() {
  const router = useRouter();

  // Sin historial (recarga en web o deep link) no hay a dónde volver con
  // back(): se va directo al menú.
  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  };

  return (
    <>
      <BotonVolver
        onPress={volver}
        accessibilityRole="button"
        accessibilityLabel="Volver al menú"
      >
        <TextoVolver>← Menú</TextoVolver>
      </BotonVolver>
      <Header
        titulo="YoSoy"
        subtitulo="Registrá las situaciones que te afectan: qué pasó, qué pensaste, cómo te sentiste y qué hiciste."
      />
      <ContenedorBoton>
        <BotonPrimario
          texto="Nuevo registro"
          onPress={() => router.push('/autorregistro/nuevo')}
        />
      </ContenedorBoton>
      <TituloSeccion>MIS REGISTROS</TituloSeccion>
    </>
  );
}

export default function Autorregistro() {
  const usuario = useSesionStore((state) => state.usuario);

  // El usuario va en la queryKey, como en "Mis turnos". Al guardar un
  // registro, nuevo.tsx invalida ['autorregistros'] y al volver la lista ya
  // lo incluye.
  const { data, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: ['autorregistros', usuario],
    queryFn: () => obtenerMisRegistros(usuario ?? ''),
    enabled: usuario !== null,
  });

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
          <Mensaje>No pudimos cargar tus registros.</Mensaje>
          <BotonAccion onPress={() => refetch()} accessibilityRole="button">
            <TextoAccion>Reintentar</TextoAccion>
          </BotonAccion>
        </EstadoLista>
      );
    }

    return (
      <EstadoLista>
        <Mensaje>
          Todavía no hiciste ningún registro. Cuando algo te afecte, anotalo:
          después vas a poder revisarlo con tu profesional.
        </Mensaje>
      </EstadoLista>
    );
  };

  return (
    <Lista
      data={data ?? []}
      keyExtractor={(registro) => registro.id}
      ListHeaderComponent={EncabezadoLista}
      ListEmptyComponent={renderEstadoLista()}
      renderItem={({ item }) => <RegistroCard registro={item} />}
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
