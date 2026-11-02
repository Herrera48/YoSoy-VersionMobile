import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';

import Chip from '../../components/Chip';
import Header from '../../components/Header';
import PacienteCard from '../../components/PacienteCard';
import { theme } from '../../constants/theme';
import {
  PacienteAsignado,
  devolverPacienteAAdmision,
  obtenerMisPacientes,
  proponerPrimerTurno,
} from '../../services/pacientes';
import { useSesionStore } from '../../store/useSesionStore';

// Mis pacientes (lado profesional): los pacientes asignados, con las
// asignaciones nuevas (recién derivadas por admisión) primero en la lista.
// Mismo esqueleto que Mis turnos/Notificaciones: FlatList con el encabezado y
// los estados de carga/error/vacío en ListHeaderComponent/ListEmptyComponent.
//
// Acá no hay botón de "Sesión" para los pacientes ya confirmados: es video,
// que la app no ofrece. "Historia clínica" llega con esa pantalla.

type Filtro = 'todos' | 'nuevos';

const Lista = styled(FlatList<PacienteAsignado>).attrs({
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

const FilaFiltros = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
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

function EncabezadoLista({
  filtro,
  onCambiarFiltro,
  nuevos,
}: {
  filtro: Filtro;
  onCambiarFiltro: (filtro: Filtro) => void;
  nuevos: number;
}) {
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
      <BotonVolver onPress={volver} accessibilityRole="button" accessibilityLabel="Volver al menú">
        <TextoVolver>← Menú</TextoVolver>
      </BotonVolver>
      <Header titulo="YoSoy" subtitulo="Consultá tus pacientes asignados y los nuevos por confirmar." />

      <FilaFiltros>
        <Chip texto="Todos" activo={filtro === 'todos'} onPress={() => onCambiarFiltro('todos')} />
        <Chip
          texto={`Asignaciones nuevas${nuevos ? ` (${nuevos})` : ''}`}
          activo={filtro === 'nuevos'}
          onPress={() => onCambiarFiltro('nuevos')}
        />
      </FilaFiltros>

      <TituloSeccion>PACIENTES</TituloSeccion>
    </>
  );
}

export default function MisPacientes() {
  const idProfesional = useSesionStore((state) => state.idProfesional);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const { data, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: ['mis-pacientes', idProfesional],
    queryFn: obtenerMisPacientes,
    enabled: idProfesional !== null,
  });

  const [confirmandoId, setConfirmandoId] = useState<number | null>(null);
  const [errorConfirmar, setErrorConfirmar] = useState<{ idPaciente: number; mensaje: string } | null>(
    null
  );
  const [devolviendoId, setDevolviendoId] = useState<number | null>(null);
  const [errorDevolver, setErrorDevolver] = useState<{ idPaciente: number; mensaje: string } | null>(
    null
  );

  const confirmar = async (paciente: PacienteAsignado, fecha: string, hora: string) => {
    setErrorConfirmar(null);
    setConfirmandoId(paciente.idPaciente);
    try {
      await proponerPrimerTurno(paciente.idPaciente, fecha, hora);
      await refetch();
    } catch (e) {
      setErrorConfirmar({
        idPaciente: paciente.idPaciente,
        mensaje: e instanceof Error ? e.message : 'No pudimos enviar la propuesta.',
      });
    } finally {
      setConfirmandoId(null);
    }
  };

  const devolver = async (paciente: PacienteAsignado, motivo: string) => {
    setErrorDevolver(null);
    setDevolviendoId(paciente.idPaciente);
    try {
      await devolverPacienteAAdmision(paciente.idPaciente, motivo);
      await refetch();
    } catch (e) {
      setErrorDevolver({
        idPaciente: paciente.idPaciente,
        mensaje: e instanceof Error ? e.message : 'No pudimos devolver el caso.',
      });
    } finally {
      setDevolviendoId(null);
    }
  };

  const nuevos = (data ?? []).filter((p) => p.estadoAsignacion === 'Nueva').length;
  const listado = (data ?? []).filter((p) => filtro === 'todos' || p.estadoAsignacion === 'Nueva');

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
          <Mensaje>No pudimos cargar tus pacientes.</Mensaje>
          <BotonAccion onPress={() => refetch()} accessibilityRole="button">
            <TextoAccion>Reintentar</TextoAccion>
          </BotonAccion>
        </EstadoLista>
      );
    }

    return (
      <EstadoLista>
        <Mensaje>
          {filtro === 'nuevos'
            ? 'No tenés asignaciones nuevas por confirmar.'
            : 'Todavía no tenés pacientes asignados. Te los asigna el equipo de admisión.'}
        </Mensaje>
      </EstadoLista>
    );
  };

  return (
    <Lista
      data={listado}
      keyExtractor={(paciente) => String(paciente.idPaciente)}
      ListHeaderComponent={
        <EncabezadoLista filtro={filtro} onCambiarFiltro={setFiltro} nuevos={nuevos} />
      }
      ListEmptyComponent={renderEstadoLista()}
      extraData={[confirmandoId, errorConfirmar, devolviendoId, errorDevolver]}
      renderItem={({ item }) => (
        <PacienteCard
          paciente={item}
          onConfirmar={(fecha, hora) => confirmar(item, fecha, hora)}
          onDevolver={(motivo) => devolver(item, motivo)}
          confirmando={confirmandoId === item.idPaciente}
          devolviendo={devolviendoId === item.idPaciente}
          errorConfirmar={errorConfirmar?.idPaciente === item.idPaciente ? errorConfirmar.mensaje : null}
          errorDevolver={errorDevolver?.idPaciente === item.idPaciente ? errorDevolver.mensaje : null}
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
