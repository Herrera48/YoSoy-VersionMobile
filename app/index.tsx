import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList } from 'react-native';
import styled from 'styled-components/native';

import BuscadorProfesionales from '../components/BuscadorProfesionales';
import FiltroEspecialidades from '../components/FiltroEspecialidades';
import Header from '../components/Header';
import ProfesionalCard from '../components/ProfesionalCard';
import { theme } from '../constants/theme';
import { obtenerProfesionales } from '../services/profesionales';
import { useFiltrosStore } from '../store/useFiltrosStore';
import { Profesional } from '../types';

// FlatList reemplaza al ScrollView: ya scrollea por sí misma, y anidarla dentro
// de un ScrollView anula el virtualizado (renderizaría todas las cards juntas).
// El padding va en contentContainerStyle para que acompañe al contenido al
// scrollear; con styled-components se declara vía attrs.
// keyboardShouldPersistTaps: con el teclado abierto, el primer toque sobre
// una card o un chip ya ejecuta la acción en vez de solo cerrar el teclado.
const Lista = styled(FlatList<Profesional>).attrs({
  contentContainerStyle: {
    paddingHorizontal: theme.espaciado.xl,
    paddingTop: theme.espaciado.superiorPantalla,
    paddingBottom: theme.espaciado.xxxl,
  },
  keyboardShouldPersistTaps: 'handled',
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

const EstadoLista = styled.View`
  align-items: center;
  margin-top: ${theme.espaciado.xxxl}px;
`;

const MensajeVacio = styled.Text`
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

// Compara sin distinguir mayúsculas ni tildes: "martin" encuentra a "Martín".
const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

function coincideConBusqueda(profesional: Profesional, busqueda: string) {
  const termino = normalizar(busqueda);
  if (termino === '') {
    return true;
  }
  const texto = normalizar(
    `${profesional.nombre} ${profesional.apellido} ${profesional.especialidad}`
  );
  return texto.includes(termino);
}

// Definido fuera de Home para que la FlatList reciba siempre el mismo
// componente: si se declarara adentro, cada letra tipeada lo recrearía, el
// TextInput se desmontaría y el teclado se cerraría. Buscador y chips leen el
// store de Zustand por su cuenta, así que no necesita props.
function EncabezadoLista() {
  return (
    <>
      <Header
        titulo="YoSoy"
        subtitulo="Acompañamiento en salud mental, cerca tuyo."
      />
      <BuscadorProfesionales />
      <FiltroEspecialidades />
      <TituloSeccion>PROFESIONALES DISPONIBLES</TituloSeccion>
    </>
  );
}

export default function Home() {
  const router = useRouter();
  const busqueda = useFiltrosStore((state) => state.busqueda);
  const especialidad = useFiltrosStore((state) => state.especialidad);
  const limpiarFiltros = useFiltrosStore((state) => state.limpiarFiltros);

  // La especialidad es parte de la queryKey: al cambiarla TanStack hace un
  // fetch nuevo, y cada especialidad queda en su propia entrada del caché
  // (volver a una ya consultada la muestra al instante).
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['profesionales', especialidad],
    queryFn: () => obtenerProfesionales(especialidad),
  });

  // La búsqueda por texto se resuelve local, sobre lo que ya llegó: filtrar
  // en cada tecla no justifica una petición nueva.
  const resultados = useMemo(
    () => (data ?? []).filter((p) => coincideConBusqueda(p, busqueda)),
    [data, busqueda]
  );

  const hayFiltros = busqueda.trim() !== '' || especialidad !== null;

  // El estado de carga y los errores se muestran en el lugar de la lista y no
  // reemplazando a la FlatList: así el encabezado, con el buscador, sigue
  // montado y no pierde el foco ni lo tipeado.
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
          <MensajeVacio>No pudimos cargar los profesionales.</MensajeVacio>
          <BotonAccion onPress={() => refetch()} accessibilityRole="button">
            <TextoAccion>Reintentar</TextoAccion>
          </BotonAccion>
        </EstadoLista>
      );
    }

    if (hayFiltros) {
      return (
        <EstadoLista>
          <MensajeVacio>
            No encontramos profesionales que coincidan con tu búsqueda.
          </MensajeVacio>
          <BotonAccion onPress={limpiarFiltros} accessibilityRole="button">
            <TextoAccion>Limpiar filtros</TextoAccion>
          </BotonAccion>
        </EstadoLista>
      );
    }

    return (
      <EstadoLista>
        <MensajeVacio>
          No hay profesionales disponibles por el momento.
        </MensajeVacio>
      </EstadoLista>
    );
  };

  return (
    <Lista
      data={resultados}
      keyExtractor={(profesional) => profesional.id}
      ListHeaderComponent={EncabezadoLista}
      ListEmptyComponent={renderEstadoLista()}
      renderItem={({ item }) => (
        <ProfesionalCard
          nombre={item.nombre}
          apellido={item.apellido}
          matricula={item.matricula}
          especialidad={item.especialidad}
          modalidad={item.modalidad}
          avatar={item.avatar}
          descripcion={item.descripcion}
          onPress={() =>
            router.push({
              pathname: '/profesional/[id]',
              params: { id: item.id },
            })
          }
        />
      )}
    />
  );
}
