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

const OPCIONES_PACIENTE: Opcion[] = [
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
    descripcion: 'Consultá, modificá o cancelá los turnos que tenés agendados.',
    icono: 'time-outline',
    ruta: '/mis-turnos',
  },
  {
    id: 'autorregistro',
    titulo: 'Registrar mi estado de ánimo',
    descripcion: 'Anotá qué pasó, qué pensaste, cómo te sentiste y qué hiciste.',
    icono: 'journal-outline',
    ruta: '/autorregistro',
  },
  {
    id: 'notificaciones',
    titulo: 'Notificaciones',
    descripcion: 'Avisos sobre tus turnos y tu tratamiento.',
    icono: 'notifications-outline',
    ruta: '/notificaciones',
  },
  {
    id: 'mi-perfil',
    titulo: 'Mi perfil',
    descripcion: 'Consultá y actualizá tus datos personales.',
    icono: 'person-outline',
    ruta: '/mi-perfil',
  },
  {
    id: 'cambio-profesional',
    titulo: 'Solicitar cambio de profesional',
    descripcion: 'Pedile al equipo de admisión que te asigne otro profesional.',
    icono: 'swap-horizontal-outline',
    ruta: '/cambio-profesional',
  },
  {
    id: 'consentimiento',
    titulo: 'Consentimiento informado',
    descripcion: 'Firmá el consentimiento para la atención por telemedicina.',
    icono: 'create-outline',
    ruta: '/consentimiento',
  },
];

const OPCIONES_PROFESIONAL: Opcion[] = [
  {
    id: 'mis-pacientes',
    titulo: 'Mis pacientes',
    descripcion: 'Consultá tus pacientes asignados y los nuevos por confirmar.',
    icono: 'people-outline',
    ruta: '/mis-pacientes',
  },
  {
    id: 'historia-clinica',
    titulo: 'Historia clínica',
    descripcion: 'Datos, evoluciones y sesiones clínicas de tus pacientes.',
    icono: 'document-text-outline',
    ruta: null,
  },
  {
    id: 'agenda',
    titulo: 'Agenda',
    descripcion: 'Mirá y gestioná los turnos de tus pacientes.',
    icono: 'calendar-outline',
    ruta: '/agenda',
  },
  {
    id: 'horarios',
    titulo: 'Horarios',
    descripcion: 'Definí tus horarios de atención disponibles.',
    icono: 'time-outline',
    ruta: '/horarios',
  },
  {
    id: 'mis-casos',
    titulo: 'Mis casos',
    descripcion: 'Seguimiento de tus casos abiertos.',
    icono: 'briefcase-outline',
    ruta: '/mis-casos',
  },
  {
    id: 'perfil-profesional',
    titulo: 'Mi perfil',
    descripcion: 'Consultá y actualizá tus datos profesionales.',
    icono: 'person-outline',
    ruta: '/perfil-profesional',
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
  const rol = useSesionStore((state) => state.rol);
  const cerrarSesion = useSesionStore((state) => state.cerrarSesion);

  const opciones = rol === 'profesional' ? OPCIONES_PROFESIONAL : OPCIONES_PACIENTE;

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

      {opciones.map((opcion) => {
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
