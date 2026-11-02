import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';

import Header from '../../components/Header';
import NotificacionCard from '../../components/NotificacionCard';
import { theme } from '../../constants/theme';
import { marcarNotificacionLeida, obtenerNotificaciones } from '../../services/notificaciones';
import { useSesionStore } from '../../store/useSesionStore';
import { Notificacion } from '../../types';

// Notificaciones (lado paciente): mismo esqueleto que Mis turnos, FlatList con
// el encabezado y los estados de carga/error/vacío en ListHeaderComponent y
// ListEmptyComponent. Al tocar una notificación sin leer se marca como leída.
//
// La web también deja "unirse a la entrevista" desde una notificación con
// link de videollamada: la app todavía no tiene esa infraestructura, así que
// esta pantalla solo lista título, mensaje y fecha.

const Lista = styled(FlatList<Notificacion>).attrs({
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

function EncabezadoLista() {
  const router = useRouter();

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
      <Header titulo="YoSoy" subtitulo="Avisos sobre tus turnos y tu tratamiento." />
      <TituloSeccion>NOTIFICACIONES</TituloSeccion>
    </>
  );
}

export default function Notificaciones() {
  const idPaciente = useSesionStore((state) => state.idPaciente);
  const queryClient = useQueryClient();

  const { data, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: ['notificaciones', idPaciente],
    queryFn: obtenerNotificaciones,
    enabled: idPaciente !== null,
  });

  const marcarLeida = async (notificacion: Notificacion) => {
    try {
      await marcarNotificacionLeida(notificacion.id);
      queryClient.setQueryData<Notificacion[]>(
        ['notificaciones', idPaciente],
        (actuales) =>
          actuales?.map((n) => (n.id === notificacion.id ? { ...n, leida: true } : n))
      );
    } catch {
      // Si falla, la notificación sigue mostrándose como no leída: el
      // usuario puede tocarla de nuevo para reintentar.
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
          <Mensaje>No pudimos cargar tus notificaciones.</Mensaje>
          <BotonAccion onPress={() => refetch()} accessibilityRole="button">
            <TextoAccion>Reintentar</TextoAccion>
          </BotonAccion>
        </EstadoLista>
      );
    }

    return (
      <EstadoLista>
        <Mensaje>Todavía no tenés notificaciones.</Mensaje>
      </EstadoLista>
    );
  };

  return (
    <Lista
      data={data ?? []}
      keyExtractor={(notificacion) => notificacion.id}
      ListHeaderComponent={EncabezadoLista}
      ListEmptyComponent={renderEstadoLista()}
      renderItem={({ item }) => (
        <NotificacionCard notificacion={item} onAbrir={() => marcarLeida(item)} />
      )}
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
