import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';

import Header from '../../components/Header';
import TurnoAgendaCard from '../../components/TurnoAgendaCard';
import { theme } from '../../constants/theme';
import { TurnoAgenda, cancelarTurnoProfesional, obtenerAgendaProfesional } from '../../services/agenda';
import { useSesionStore } from '../../store/useSesionStore';
import { formatearFechaLarga } from '../../utils/fechas';

// Agenda (lado profesional): lista simplificada de turnos agrupados por día,
// no el calendario en grilla de la web. Sin acción de "Ir a sala": es video,
// que la app no ofrece.
interface Seccion {
  fecha: string;
  turnos: TurnoAgenda[];
}

const Lista = styled(FlatList<Seccion>).attrs({
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

const TituloDia = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.bold};
  letter-spacing: ${theme.espaciadoLetra.amplio}px;
  color: ${theme.colores.violetaOscuro};
  margin-top: ${theme.espaciado.lg}px;
  margin-bottom: ${theme.espaciado.md}px;
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

function agruparPorDia(turnos: TurnoAgenda[]): Seccion[] {
  const porFecha = new Map<string, TurnoAgenda[]>();
  for (const turno of turnos) {
    const lista = porFecha.get(turno.fecha) ?? [];
    lista.push(turno);
    porFecha.set(turno.fecha, lista);
  }
  return [...porFecha.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, turnos]) => ({ fecha, turnos }));
}

export default function Agenda() {
  const router = useRouter();
  const idProfesional = useSesionStore((state) => state.idProfesional);

  const { data, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: ['agenda', idProfesional],
    queryFn: () => obtenerAgendaProfesional(idProfesional!),
    enabled: idProfesional !== null,
  });

  const [cancelandoId, setCancelandoId] = useState<number | null>(null);
  const [errorCancelar, setErrorCancelar] = useState<{ idTurno: number; mensaje: string } | null>(null);

  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  };

  const cancelar = async (turno: TurnoAgenda) => {
    setErrorCancelar(null);
    setCancelandoId(turno.idTurno);
    try {
      await cancelarTurnoProfesional(turno.idTurno);
      await refetch();
    } catch (e) {
      setErrorCancelar({
        idTurno: turno.idTurno,
        mensaje: e instanceof Error ? e.message : 'No pudimos cancelar el turno.',
      });
    } finally {
      setCancelandoId(null);
    }
  };

  const secciones = agruparPorDia(data ?? []);

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
          <Mensaje>No pudimos cargar tu agenda.</Mensaje>
          <BotonAccion onPress={() => refetch()} accessibilityRole="button">
            <TextoAccion>Reintentar</TextoAccion>
          </BotonAccion>
        </EstadoLista>
      );
    }

    return (
      <EstadoLista>
        <Mensaje>Todavía no tenés turnos agendados.</Mensaje>
      </EstadoLista>
    );
  };

  return (
    <Lista
      data={secciones}
      keyExtractor={(seccion) => seccion.fecha}
      ListHeaderComponent={
        <>
          <BotonVolver onPress={volver} accessibilityRole="button" accessibilityLabel="Volver al menú">
            <TextoVolver>← Menú</TextoVolver>
          </BotonVolver>
          <Header titulo="YoSoy" subtitulo="Mirá y gestioná los turnos de tus pacientes." />
        </>
      }
      ListEmptyComponent={renderEstadoLista()}
      extraData={[cancelandoId, errorCancelar]}
      renderItem={({ item }) => (
        <>
          <TituloDia>{formatearFechaLarga(item.fecha).toUpperCase()}</TituloDia>
          {item.turnos.map((turno) => (
            <TurnoAgendaCard
              key={turno.idTurno}
              turno={turno}
              onCancelar={() => cancelar(turno)}
              cancelando={cancelandoId === turno.idTurno}
              error={errorCancelar?.idTurno === turno.idTurno ? errorCancelar.mensaje : null}
            />
          ))}
        </>
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
