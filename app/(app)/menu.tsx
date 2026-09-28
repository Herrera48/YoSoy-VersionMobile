import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import styled from 'styled-components/native';

import Header from '../../components/Header';
import MenuOpcion, { NombreIcono } from '../../components/MenuOpcion';
import { theme } from '../../constants/theme';
import { useSesionStore } from '../../store/useSesionStore';

// Menú principal del paciente, al que se llega después de iniciar sesión.
// Las opciones se declaran como datos y se dibujan con .map(): agregar una
// nueva o habilitar una pendiente es cambiar esta lista, no el JSX.
interface Opcion {
  id: string;
  titulo: string;
  descripcion: string;
  icono: NombreIcono;
  // null = todavía no desarrollada: se muestra como "Próximamente".
  ruta: Href | null;
}

const OPCIONES: Opcion[] = [
  {
    id: 'profesionales',
    titulo: 'Especialidades y profesionales',
    descripcion: 'Buscá profesionales y filtralos por especialidad.',
    icono: 'people-outline',
    ruta: '/profesionales',
  },
  {
    id: 'solicitar-turno',
    titulo: 'Solicitar turno',
    descripcion: 'Elegí especialidad o profesional y reservá un horario.',
    icono: 'calendar-outline',
    ruta: '/solicitar-turno',
  },
  {
    id: 'mis-turnos',
    titulo: 'Mis turnos',
    descripcion: 'Consultá los turnos que tenés agendados.',
    icono: 'time-outline',
    ruta: null,
  },
  {
    id: 'cancelar-turno',
    titulo: 'Cancelar un turno',
    descripcion: 'Liberá un turno que ya no vas a usar.',
    icono: 'close-circle-outline',
    ruta: null,
  },
];

const Pantalla = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: theme.espaciado.xl,
    paddingTop: theme.espaciado.superiorPantalla,
    paddingBottom: theme.espaciado.xxxl,
  },
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

const BotonCerrarSesion = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  align-self: center;
  padding: ${theme.espaciado.md}px;
  margin-top: ${theme.espaciado.xl}px;
`;

const TextoCerrarSesion = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.azulPrimario};
  margin-left: ${theme.espaciado.sm}px;
`;

export default function Menu() {
  const router = useRouter();
  const usuario = useSesionStore((state) => state.usuario);
  const cerrarSesion = useSesionStore((state) => state.cerrarSesion);

  const salir = () => {
    // Al quedar sin sesión, el layout de (app) redirige solo al login.
    cerrarSesion();
  };

  return (
    <Pantalla>
      <Header
        titulo="YoSoy"
        subtitulo={`Hola, ${usuario}. ¿Qué necesitás hoy?`}
      />

      <TituloSeccion>MENÚ</TituloSeccion>

      {OPCIONES.map((opcion) => {
        const ruta = opcion.ruta;
        return (
          <MenuOpcion
            key={opcion.id}
            titulo={opcion.titulo}
            descripcion={opcion.descripcion}
            icono={opcion.icono}
            disponible={ruta !== null}
            onPress={() => {
              if (ruta) {
                router.push(ruta);
              }
            }}
          />
        );
      })}

      <BotonCerrarSesion
        onPress={salir}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
      >
        <Ionicons
          name="log-out-outline"
          size={theme.iconos.md}
          color={theme.colores.azulPrimario}
        />
        <TextoCerrarSesion>Cerrar sesión</TextoCerrarSesion>
      </BotonCerrarSesion>
    </Pantalla>
  );
}
