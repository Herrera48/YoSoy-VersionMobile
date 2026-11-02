import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import styled from 'styled-components/native';

import FormularioHorario from '../../components/FormularioHorario';
import Header from '../../components/Header';
import HorarioCard from '../../components/HorarioCard';
import { theme } from '../../constants/theme';
import {
  HorarioInput,
  HorarioProfesional,
  actualizarHorario,
  crearHorario,
  eliminarHorario,
  obtenerHorarios,
  ordenDia,
} from '../../services/horarios';
import { useSesionStore } from '../../store/useSesionStore';

// Horarios (lado profesional): alta, baja y modificación de las franjas de
// atención (Agenda) del profesional logueado. Mismo esqueleto que Mis
// pacientes: FlatList con el encabezado y los estados de carga/error/vacío en
// ListHeaderComponent/ListEmptyComponent.
const Lista = styled(FlatList<HorarioProfesional>).attrs({
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

const TarjetaAgregar = styled.View`
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.lg}px;
  border-width: 1px;
  border-color: ${theme.colores.borde};
  padding: ${theme.espaciado.lg}px;
  margin-bottom: ${theme.espaciado.lg}px;
`;

const BotonAgregar = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-vertical: ${theme.espaciado.sm}px;
`;

const TextoAgregar = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.azulPrimario};
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

export default function Horarios() {
  const router = useRouter();
  const idProfesional = useSesionStore((state) => state.idProfesional);

  const { data, isLoading, isRefetching, error, refetch } = useQuery({
    queryKey: ['horarios', idProfesional],
    queryFn: () => obtenerHorarios(idProfesional!),
    enabled: idProfesional !== null,
  });

  const [agregando, setAgregando] = useState(false);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);
  const [errorNuevo, setErrorNuevo] = useState<string | null>(null);

  const [idEditando, setIdEditando] = useState<number | null>(null);
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  const [errorEdicion, setErrorEdicion] = useState<string | null>(null);

  const [eliminandoId, setEliminandoId] = useState<number | null>(null);
  const [errorEliminar, setErrorEliminar] = useState<{ idAgenda: number; mensaje: string } | null>(null);

  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  };

  const agregar = async (input: HorarioInput) => {
    if (idProfesional === null) {
      return;
    }
    setErrorNuevo(null);
    setGuardandoNuevo(true);
    try {
      await crearHorario(idProfesional, input);
      setAgregando(false);
      await refetch();
    } catch (e) {
      setErrorNuevo(e instanceof Error ? e.message : 'No pudimos guardar el horario.');
    } finally {
      setGuardandoNuevo(false);
    }
  };

  const editar = async (horario: HorarioProfesional, input: HorarioInput) => {
    if (idProfesional === null) {
      return;
    }
    setErrorEdicion(null);
    setGuardandoEdicion(true);
    try {
      await actualizarHorario(horario.idAgenda, idProfesional, input);
      setIdEditando(null);
      await refetch();
    } catch (e) {
      setErrorEdicion(e instanceof Error ? e.message : 'No pudimos guardar los cambios.');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const eliminar = async (horario: HorarioProfesional) => {
    setErrorEliminar(null);
    setEliminandoId(horario.idAgenda);
    try {
      await eliminarHorario(horario.idAgenda);
      await refetch();
    } catch (e) {
      setErrorEliminar({
        idAgenda: horario.idAgenda,
        mensaje: e instanceof Error ? e.message : 'No pudimos eliminar el horario.',
      });
    } finally {
      setEliminandoId(null);
    }
  };

  const listado = [...(data ?? [])].sort(
    (a, b) => ordenDia(a.dia) - ordenDia(b.dia) || a.horaInicio.localeCompare(b.horaInicio)
  );

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
          <Mensaje>No pudimos cargar tus horarios.</Mensaje>
          <BotonAccion onPress={() => refetch()} accessibilityRole="button">
            <TextoAccion>Reintentar</TextoAccion>
          </BotonAccion>
        </EstadoLista>
      );
    }

    return (
      <EstadoLista>
        <Mensaje>Todavía no cargaste horarios de atención. Agregá uno para que tus pacientes puedan pedir turno.</Mensaje>
      </EstadoLista>
    );
  };

  return (
    <Lista
      data={listado}
      keyExtractor={(horario) => String(horario.idAgenda)}
      ListHeaderComponent={
        <>
          <BotonVolver onPress={volver} accessibilityRole="button" accessibilityLabel="Volver al menú">
            <TextoVolver>← Menú</TextoVolver>
          </BotonVolver>
          <Header titulo="YoSoy" subtitulo="Definí tus horarios de atención disponibles." />

          <TarjetaAgregar>
            {agregando ? (
              <FormularioHorario
                onGuardar={agregar}
                onCancelar={() => {
                  setAgregando(false);
                  setErrorNuevo(null);
                }}
                guardando={guardandoNuevo}
              />
            ) : (
              <BotonAgregar onPress={() => setAgregando(true)} accessibilityRole="button" accessibilityLabel="Agregar horario">
                <TextoAgregar>+ Agregar horario</TextoAgregar>
              </BotonAgregar>
            )}
            {!agregando && errorNuevo && <Mensaje>{errorNuevo}</Mensaje>}
          </TarjetaAgregar>

          <TituloSeccion>HORARIOS</TituloSeccion>
        </>
      }
      ListEmptyComponent={renderEstadoLista()}
      extraData={[idEditando, guardandoEdicion, errorEdicion, eliminandoId, errorEliminar]}
      renderItem={({ item }) => (
        <HorarioCard
          horario={item}
          editando={idEditando === item.idAgenda}
          onEditar={() => {
            setIdEditando(item.idAgenda);
            setErrorEdicion(null);
          }}
          onGuardarEdicion={(input) => editar(item, input)}
          onCancelarEdicion={() => setIdEditando(null)}
          guardandoEdicion={guardandoEdicion && idEditando === item.idAgenda}
          onEliminar={() => eliminar(item)}
          eliminando={eliminandoId === item.idAgenda}
          error={
            (idEditando === item.idAgenda ? errorEdicion : null) ??
            (errorEliminar?.idAgenda === item.idAgenda ? errorEliminar.mensaje : null)
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
