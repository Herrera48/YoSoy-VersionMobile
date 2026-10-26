import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';

import BotonPrimario from '../../components/BotonPrimario';
import Header from '../../components/Header';
import TurnoCard from '../../components/TurnoCard';
import { theme } from '../../constants/theme';
import { cancelarTurno, confirmarTurno, obtenerMisTurnos } from '../../services/turnos';
import { useSesionStore } from '../../store/useSesionStore';
import { Turno } from '../../types';

// Mis turnos (Feature 4): los turnos que reservó el paciente y que todavía no
// pasaron, del más cercano al más lejano.
//
// Misma estructura que el listado de profesionales: FlatList con el
// encabezado en ListHeaderComponent y la carga, el error y el estado vacío en
// ListEmptyComponent. Además se puede deslizar hacia abajo para actualizar.
//
// Desde cada tarjeta se puede cancelar el turno (Feature 5) o modificarlo:
// modificar lleva a "Solicitar turno" con el profesional ya elegido y el id
// del turno a cambiar, y ahí se elige el nuevo día y horario.
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

const MensajeExito = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.azulPrimario};
  background-color: ${theme.colores.fondoBadgeEspecialidad};
  border-radius: ${theme.radios.md}px;
  padding: ${theme.espaciado.md}px;
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
function EncabezadoLista({ mensajeExito }: { mensajeExito: string | null }) {
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
      {mensajeExito && <MensajeExito>{mensajeExito}</MensajeExito>}
      <TituloSeccion>PRÓXIMOS TURNOS</TituloSeccion>
    </>
  );
}

export default function MisTurnos() {
  const router = useRouter();
  const usuario = useSesionStore((state) => state.usuario);
  const queryClient = useQueryClient();

  // Qué turno se está cancelando y, si falló, en cuál y por qué: así el
  // spinner y el error se ven solo en esa tarjeta.
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [errorCancelacion, setErrorCancelacion] = useState<{
    turnoId: string;
    mensaje: string;
  } | null>(null);

  const [confirmandoId, setConfirmandoId] = useState<string | null>(null);
  const [errorConfirmacion, setErrorConfirmacion] = useState<{
    turnoId: string;
    mensaje: string;
  } | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // El usuario va en la queryKey: si cambia la sesión, no se muestran los
  // turnos del anterior. AgendaTurnos invalida ['mis-turnos'] al reservar,
  // así que al volver acá la lista ya incluye el turno nuevo.
  const { data, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: ['mis-turnos', usuario],
    queryFn: () => obtenerMisTurnos(usuario ?? ''),
    enabled: usuario !== null,
  });

  const cancelar = async (turno: Turno) => {
    if (!usuario) {
      return;
    }
    setErrorCancelacion(null);
    setMensajeExito(null);
    setErrorConfirmacion(null);
    setCancelandoId(turno.id);
    try {
      await cancelarTurno(turno.id, usuario);
      // El turno vuelve a estar libre: las agendas en caché quedaron viejas.
      queryClient.invalidateQueries({ queryKey: ['turnos'] });
      await refetch();
    } catch (e) {
      setErrorCancelacion({
        turnoId: turno.id,
        mensaje: e instanceof Error ? e.message : 'No pudimos cancelar el turno.',
      });
    } finally {
      setCancelandoId(null);
    }
  };

  const confirmar = async (turno: Turno) => {
    setErrorConfirmacion(null);
    setMensajeExito(null);
    setErrorCancelacion(null);
    setConfirmandoId(turno.id);
    try {
      await confirmarTurno(turno.id);
      setMensajeExito('Turno confirmado. El profesional va a generar la sala para ese día.');
      await refetch();
    } catch (e) {
      setErrorConfirmacion({
        turnoId: turno.id,
        mensaje: e instanceof Error ? e.message : 'No pudimos confirmar el turno.',
      });
    } finally {
      setConfirmandoId(null);
    }
  };

  // RN-02: el backend rechaza la confirmación si el paciente no firmó el
  // consentimiento de telemedicina. Se detecta por el texto del error (la API
  // no expone un código aparte del mensaje) para ofrecer el link directo.
  const requiereConsentimiento = (mensaje: string) =>
    mensaje.includes('firmó el consentimiento informado');

  const modificar = (turno: Turno) => {
    setMensajeExito(null);
    setErrorConfirmacion(null);
    router.push({
      pathname: '/solicitar-turno',
      params: { profesionalId: turno.profesional.id, turnoAModificar: turno.id },
    });
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
      ListHeaderComponent={<EncabezadoLista mensajeExito={mensajeExito} />}
      ListEmptyComponent={renderEstadoLista()}
      // Sin extraData la FlatList no se vuelve a dibujar al cambiar estos
      // estados, porque `data` sigue siendo el mismo.
      extraData={[cancelandoId, errorCancelacion, confirmandoId, errorConfirmacion, mensajeExito]}
      renderItem={({ item }) => (
        <TurnoCard
          turno={item}
          onModificar={() => modificar(item)}
          onCancelar={() => cancelar(item)}
          onConfirmar={() => confirmar(item)}
          cancelando={cancelandoId === item.id}
          confirmandoTurno={confirmandoId === item.id}
          error={
            errorCancelacion?.turnoId === item.id
              ? errorCancelacion.mensaje
              : errorConfirmacion?.turnoId === item.id
                ? errorConfirmacion.mensaje
                : null
          }
          onIrAConsentimiento={
            errorConfirmacion?.turnoId === item.id && requiereConsentimiento(errorConfirmacion.mensaje)
              ? () => router.push('/consentimiento')
              : undefined
          }
        />
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
