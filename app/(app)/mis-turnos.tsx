import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';

import BotonPrimario from '../../components/BotonPrimario';
import Header from '../../components/Header';
import TurnoCard from '../../components/TurnoCard';
import { theme } from '../../constants/theme';
import { obtenerMisTurnos } from '../../services/turnos';
import { useSesionStore } from '../../store/useSesionStore';
import { Turno } from '../../types';

// Mis turnos (Feature 4): los turnos que reservó el paciente y que todavía no
// pasaron, del más cercano al más lejano.
//
// Misma estructura que el listado de profesionales: FlatList con el
// encabezado en ListHeaderComponent y la carga, el error y el estado vacío en
// ListEmptyComponent. Además se puede deslizar hacia abajo para actualizar.
//
// Las reservas se guardan en memoria (services/turnos.ts): al recargar la app
// la lista vuelve a quedar vacía hasta que se pida un turno.

const Lista = styled(FlatList<Turno>).attrs({
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
  margin-bottom: ${theme.espaciado.xl}px;
`;

const ContenedorBoton = styled.View`
  align-self: stretch;
`;

const BotonAccion = styled.TouchableOpacity`
  padding-vertical: ${theme.espaciado.sm}px;
`;

const TextoAccion = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.azulPrimario};
`;

// Definido fuera de la pantalla, como en el listado de profesionales: así la
// FlatList recibe siempre el mismo componente y no lo recrea en cada render.
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
      <Header titulo="YoSoy" subtitulo="Estos son los turnos que tenés agendados." />
      <TituloSeccion>PRÓXIMOS TURNOS</TituloSeccion>
    </>
  );
}

export default function MisTurnos() {
  const router = useRouter();
  const usuario = useSesionStore((state) => state.usuario);

  // El usuario va en la queryKey: si cambia la sesión, no se muestran los
  // turnos del anterior. AgendaTurnos invalida ['mis-turnos'] al reservar,
  // así que al volver acá la lista ya incluye el turno nuevo.
  const { data, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: ['mis-turnos', usuario],
    queryFn: () => obtenerMisTurnos(usuario ?? ''),
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
          <Mensaje>No pudimos cargar tus turnos.</Mensaje>
          <BotonAccion onPress={() => refetch()} accessibilityRole="button">
            <TextoAccion>Reintentar</TextoAccion>
          </BotonAccion>
        </EstadoLista>
      );
    }

    return (
      <EstadoLista>
        <Mensaje>Todavía no tenés turnos agendados.</Mensaje>
        <ContenedorBoton>
          <BotonPrimario
            texto="Solicitar un turno"
            onPress={() => router.push('/solicitar-turno')}
          />
        </ContenedorBoton>
      </EstadoLista>
    );
  };

  return (
    <Lista
      data={data ?? []}
      keyExtractor={(turno) => turno.id}
      ListHeaderComponent={EncabezadoLista}
      ListEmptyComponent={renderEstadoLista()}
      renderItem={({ item }) => <TurnoCard turno={item} />}
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
