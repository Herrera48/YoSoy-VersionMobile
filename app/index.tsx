import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, TextInput } from 'react-native';
import styled from 'styled-components/native';

import logoYoSoy from '../assets/images/logo-yosoy.png';
import BotonPrimario from '../components/BotonPrimario';
import CampoTexto from '../components/CampoTexto';
import { theme } from '../constants/theme';
import { iniciarSesion } from '../services/auth';
import { useSesionStore } from '../store/useSesionStore';
import { USAR_DRIVER_NATIVO } from '../utils/animaciones';

// Pantalla de entrada de la app: inicio de sesión del paciente.
// Por ahora el servicio acepta cualquier usuario y contraseña (ver
// services/auth.ts); acá solo se valida que los dos campos estén completos.

// En iOS el teclado tapa el formulario si no se le deja lugar; en Android el
// sistema ya redimensiona la ventana.
const Pantalla = styled.KeyboardAvoidingView.attrs({
  behavior: Platform.OS === 'ios' ? 'padding' : undefined,
})`
  flex: 1;
  background-color: ${theme.colores.fondo};
`;

const Contenido = styled.ScrollView.attrs({
  contentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.espaciado.xl,
    paddingVertical: theme.espaciado.superiorPantalla,
  },
  keyboardShouldPersistTaps: 'handled',
})``;

const Marca = styled(Animated.View)`
  align-items: center;
  margin-bottom: ${theme.espaciado.xxxl}px;
`;

const Logo = styled(Animated.Image)`
  width: 96px;
  height: 96px;
  resize-mode: contain;
`;

const Titulo = styled.Text`
  font-size: ${theme.fuentes.xxl}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.azulPrimario};
  margin-top: ${theme.espaciado.sm}px;
`;

const Tagline = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.bold};
  letter-spacing: ${theme.espaciadoLetra.amplio}px;
  color: ${theme.colores.violetaOscuro};
  margin-top: ${theme.espaciado.sm}px;
`;

const Tarjeta = styled(Animated.View)`
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

const TituloFormulario = styled.Text`
  font-size: ${theme.fuentes.xl}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
  margin-bottom: ${theme.espaciado.xl}px;
`;

const BotonOjo = styled.TouchableOpacity`
  padding: ${theme.espaciado.xs}px;
`;

const MensajeError = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.error};
  margin-bottom: ${theme.espaciado.md}px;
`;

const MensajeExito = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.azulPrimario};
  margin-bottom: ${theme.espaciado.md}px;
`;

const EnlaceOlvido = styled(Link)`
  align-self: center;
  margin-top: ${theme.espaciado.lg}px;
  padding-vertical: ${theme.espaciado.sm}px;
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.azulPrimario};
`;

const EnlaceCrearCuenta = styled(Link)`
  align-self: center;
  margin-top: ${theme.espaciado.sm}px;
  padding-vertical: ${theme.espaciado.sm}px;
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.azulPrimario};
`;

export default function Login() {
  const router = useRouter();
  const { registrado } = useLocalSearchParams<{ registrado?: string }>();
  const guardarSesion = useSesionStore((state) => state.guardarSesion);

  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [claveVisible, setClaveVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Para pasar del campo usuario al de contraseña con la tecla "siguiente".
  const refClave = useRef<TextInput>(null);

  const entradaMarca = useRef(new Animated.Value(0)).current;
  const entradaTarjeta = useRef(new Animated.Value(0)).current;
  const respiracion = useRef(new Animated.Value(1)).current;
  const sacudida = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(180, [
      Animated.timing(entradaMarca, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USAR_DRIVER_NATIVO,
      }),
      Animated.timing(entradaTarjeta, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USAR_DRIVER_NATIVO,
      }),
    ]).start();

    const latido = Animated.loop(
      Animated.sequence([
        Animated.timing(respiracion, {
          toValue: 1.06,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USAR_DRIVER_NATIVO,
        }),
        Animated.timing(respiracion, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: USAR_DRIVER_NATIVO,
        }),
      ])
    );
    latido.start();

    return () => latido.stop();
  }, [entradaMarca, entradaTarjeta, respiracion]);

  const sacudir = () => {
    sacudida.setValue(0);
    Animated.sequence(
      [10, -10, 7, -7, 3, 0].map((valor) =>
        Animated.timing(sacudida, {
          toValue: valor,
          duration: 50,
          useNativeDriver: USAR_DRIVER_NATIVO,
        })
      )
    ).start();
  };

  const estiloMarca = {
    opacity: entradaMarca,
    transform: [
      {
        translateY: entradaMarca.interpolate({
          inputRange: [0, 1],
          outputRange: [-24, 0],
        }),
      },
    ],
  };

  const estiloTarjeta = {
    opacity: entradaTarjeta,
    transform: [
      {
        translateY: entradaTarjeta.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
      { translateX: sacudida },
    ],
  };

  // El error se muestra como texto bajo los campos y no con Alert.alert, que
  // en web no funciona.
  const ingresar = async () => {
    if (usuario.trim() === '' || clave === '') {
      setError('Ingresá tu usuario y tu contraseña.');
      sacudir();
      return;
    }

    setError(null);
    setCargando(true);
    try {
      const sesion = await iniciarSesion(usuario, clave);
      guardarSesion(sesion.usuario, sesion.token, sesion.rol, sesion.idPaciente, sesion.idProfesional);
      // replace y no push: una vez adentro, "volver" no debe regresar al login.
      router.replace('/menu');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No pudimos iniciar sesión. Intentá de nuevo.'
      );
      sacudir();
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Contenido>
        <Marca style={estiloMarca}>
          <Logo
            source={logoYoSoy}
            style={{ transform: [{ scale: respiracion }] }}
          />
          <Titulo>YoSoy</Titulo>
          <Tagline>TELEMEDICINA EN SALUD MENTAL</Tagline>
        </Marca>

        <Tarjeta style={estiloTarjeta}>
          <TituloFormulario>Iniciar sesión</TituloFormulario>

          <CampoTexto
            etiqueta="Usuario"
            value={usuario}
            onChangeText={setUsuario}
            placeholder="Tu usuario"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            returnKeyType="next"
            onSubmitEditing={() => refClave.current?.focus()}
            submitBehavior="submit"
          />

          <CampoTexto
            ref={refClave}
            etiqueta="Contraseña"
            value={clave}
            onChangeText={setClave}
            placeholder="Tu contraseña"
            secureTextEntry={!claveVisible}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password"
            returnKeyType="go"
            onSubmitEditing={ingresar}
            accesorio={
              <BotonOjo
                onPress={() => setClaveVisible((visible) => !visible)}
                accessibilityRole="button"
                accessibilityLabel={
                  claveVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                <Ionicons
                  name={claveVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={theme.iconos.md}
                  color={theme.colores.textoSecundario}
                />
              </BotonOjo>
            }
          />

          {!error && registrado && (
            <MensajeExito>
              Tu cuenta se creó. Ingresá con tu usuario y contraseña.
            </MensajeExito>
          )}

          {error && <MensajeError>{error}</MensajeError>}

          <BotonPrimario texto="Ingresar" onPress={ingresar} cargando={cargando} />

          <EnlaceCrearCuenta href="/registro">Crear cuenta</EnlaceCrearCuenta>

          <EnlaceOlvido href="/recuperar-clave">
            Olvidé mi contraseña
          </EnlaceOlvido>
        </Tarjeta>
      </Contenido>
    </Pantalla>
  );
}
