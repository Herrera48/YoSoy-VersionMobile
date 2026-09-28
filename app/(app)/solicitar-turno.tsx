import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import AgendaTurnos from '../../components/AgendaTurnos';
import BotonPrimario from '../../components/BotonPrimario';
import BuscadorProfesionales from '../../components/BuscadorProfesionales';
import FiltroEspecialidades from '../../components/FiltroEspecialidades';
import Header from '../../components/Header';
import ProfesionalOpcion from '../../components/ProfesionalOpcion';
import { theme } from '../../constants/theme';
import { obtenerProfesionales } from '../../services/profesionales';
import { Turno } from '../../types';
import { coincideConBusqueda } from '../../utils/busqueda';
import { formatearFechaLarga } from '../../utils/fechas';

// Solicitar turno. La búsqueda es la misma que la del listado de
// profesionales: texto libre y chips de especialidad.
//  - Con una especialidad elegida, la agenda muestra los turnos de todos sus
//    profesionales: al elegir un día se ve, hora por hora, quién atiende.
//  - Al tocar un profesional, la agenda pasa a mostrar solo sus turnos,
//    empezando por el próximo libre.
// Desde el detalle de un profesional se llega con ?profesionalId=... y la
// búsqueda arranca con ese profesional elegido.
//
// Los filtros viven en el estado de la pantalla y no en el store de Zustand:
// así no se mezclan con los del listado de profesionales.
//
// Igual que el recupero de contraseña, la pantalla tiene dos estados: la
// búsqueda y la confirmación del turno reservado.

const Pantalla = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: theme.espaciado.xl,
    paddingTop: theme.espaciado.superiorPantalla,
    paddingBottom: theme.espaciado.xxxl,
  },
  // Con el teclado abierto, el primer toque sobre un profesional o un chip ya
  // ejecuta la acción en vez de solo cerrar el teclado.
  keyboardShouldPersistTaps: 'handled',
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
  margin-bottom: ${theme.espaciado.md}px;
`;

// Separa la agenda de la lista de profesionales.
const TituloTurnos = styled(TituloSeccion)`
  margin-top: ${theme.espaciado.xl}px;
`;

const Cargando = styled.View`
  align-items: flex-start;
  margin-bottom: ${theme.espaciado.lg}px;
`;

const BotonCambiar = styled.TouchableOpacity`
  align-self: flex-start;
  padding-vertical: ${theme.espaciado.xs}px;
  margin-bottom: ${theme.espaciado.lg}px;
`;

const TextoCambiar = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.azulPrimario};
`;

const BotonVerTurnos = styled.TouchableOpacity`
  align-self: center;
  padding-vertical: ${theme.espaciado.sm}px;
  margin-top: ${theme.espaciado.md}px;
`;

const Indicacion = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoSecundario};
  text-align: center;
  margin-top: ${theme.espaciado.xl}px;
`;

const Tarjeta = styled.View`
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.lg}px;
  border-width: 1px;
  border-color: ${theme.colores.borde};
  padding: ${theme.espaciado.xl}px;
  shadow-color: ${theme.colores.sombra};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 2;
`;

const Icono = styled.View`
  align-items: center;
  margin-bottom: ${theme.espaciado.lg}px;
`;

const TituloConfirmacion = styled.Text`
  font-size: ${theme.fuentes.xl}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
  text-align: center;
  margin-bottom: ${theme.espaciado.sm}px;
`;

const DetalleConfirmacion = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoSecundario};
  text-align: center;
  margin-bottom: ${theme.espaciado.xl}px;
`;

export default function SolicitarTurno() {
  const router = useRouter();
  const params = useLocalSearchParams<{ profesionalId?: string }>();

  const [busqueda, setBusqueda] = useState('');
  const [especialidad, setEspecialidad] = useState<string | null>(null);
  const [profesionalId, setProfesionalId] = useState<string | null>(
    params.profesionalId ?? null
  );
  const [turnoReservado, setTurnoReservado] = useState<Turno | null>(null);

  // Misma consulta y misma queryKey que el listado: si ya se vio esa
  // especialidad, llega del caché al instante.
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['profesionales', especialidad],
    queryFn: () => obtenerProfesionales(especialidad),
  });

  const resultados = (data ?? []).filter((p) => coincideConBusqueda(p, busqueda));
  const profesionalElegido = data?.find((p) => p.id === profesionalId);

  // Buscar otra cosa o cambiar de especialidad suelta al profesional elegido.
  const cambiarBusqueda = (texto: string) => {
    setBusqueda(texto);
    setProfesionalId(null);
  };
  const cambiarEspecialidad = (nueva: string | null) => {
    setEspecialidad(nueva);
    setProfesionalId(null);
  };

  // De quién se muestran los turnos: del profesional elegido o, si no hay,
  // de la especialidad del chip.
  const por = profesionalId ? 'profesional' : 'especialidad';
  const valor = profesionalId ?? especialidad;

  // Sin historial (recarga en web o deep link) no hay a dónde volver con
  // back(): se va directo al menú.
  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  };

  if (turnoReservado) {
    const { profesional } = turnoReservado;
    return (
      <Pantalla>
        <Tarjeta>
          <Icono>
            <Ionicons
              name="checkmark-circle-outline"
              size={theme.iconos.xl}
              color={theme.colores.azulPrimario}
            />
          </Icono>
          <TituloConfirmacion>¡Turno confirmado!</TituloConfirmacion>
          <DetalleConfirmacion>
            {formatearFechaLarga(turnoReservado.fecha)} a las{' '}
            {turnoReservado.hora} h con {profesional.nombre}{' '}
            {profesional.apellido} ({profesional.especialidad},{' '}
            {profesional.modalidad.toLowerCase()}).
          </DetalleConfirmacion>
          {/* Vuelve a la pantalla desde la que se pidió el turno (el menú o
              el detalle del profesional). */}
          <BotonPrimario texto="Listo" onPress={volver} />
          {/* replace: desde "Mis turnos", volver no regresa a esta
              confirmación sino a la pantalla anterior. */}
          <BotonVerTurnos
            onPress={() => router.replace('/mis-turnos')}
            accessibilityRole="button"
          >
            <TextoCambiar>Ver mis turnos</TextoCambiar>
          </BotonVerTurnos>
        </Tarjeta>
      </Pantalla>
    );
  }

  const renderProfesionales = () => {
    if (isLoading) {
      return (
        <Cargando>
          <ActivityIndicator size="small" color={theme.colores.azulPrimario} />
        </Cargando>
      );
    }

    if (error) {
      return (
        <>
          <Indicacion>No pudimos cargar los profesionales.</Indicacion>
          <BotonCambiar onPress={() => refetch()} accessibilityRole="button">
            <TextoCambiar>Reintentar</TextoCambiar>
          </BotonCambiar>
        </>
      );
    }

    // Ya elegido, la lista se achica a ese profesional para dejar lugar a la
    // agenda.
    if (profesionalElegido) {
      return (
        <>
          <ProfesionalOpcion
            profesional={profesionalElegido}
            activo
            onPress={() => setProfesionalId(null)}
          />
          <BotonCambiar
            onPress={() => setProfesionalId(null)}
            accessibilityRole="button"
          >
            <TextoCambiar>Cambiar profesional</TextoCambiar>
          </BotonCambiar>
        </>
      );
    }

    if (resultados.length === 0) {
      return (
        <Indicacion>
          No encontramos profesionales que coincidan con tu búsqueda.
        </Indicacion>
      );
    }

    return resultados.map((profesional) => (
      <ProfesionalOpcion
        key={profesional.id}
        profesional={profesional}
        activo={false}
        onPress={() => setProfesionalId(profesional.id)}
      />
    ));
  };

  return (
    <Pantalla>
      <BotonVolver
        onPress={volver}
        accessibilityRole="button"
        accessibilityLabel="Volver"
      >
        <TextoVolver>← Volver</TextoVolver>
      </BotonVolver>

      <Header
        titulo="YoSoy"
        subtitulo="Buscá por especialidad o por profesional y reservá tu turno."
      />

      <BuscadorProfesionales valor={busqueda} onCambiar={cambiarBusqueda} />
      <FiltroEspecialidades
        especialidad={especialidad}
        onCambiar={cambiarEspecialidad}
      />

      <TituloSeccion>
        {profesionalElegido ? 'PROFESIONAL ELEGIDO' : 'PROFESIONALES'}
      </TituloSeccion>
      {renderProfesionales()}

      {valor ? (
        <>
          <TituloTurnos>TURNOS</TituloTurnos>
          <AgendaTurnos
            key={`${por}-${valor}`}
            por={por}
            valor={valor}
            onTurnoReservado={setTurnoReservado}
          />
        </>
      ) : (
        <Indicacion>
          Elegí una especialidad o un profesional para ver los turnos libres.
        </Indicacion>
      )}
    </Pantalla>
  );
}
