import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, TextInput } from 'react-native';
import styled from 'styled-components/native';

import logoYoSoy from '../assets/images/logo-yosoy.png';
import BotonPrimario from '../components/BotonPrimario';
import CampoTexto from '../components/CampoTexto';
import { theme } from '../constants/theme';
import { iniciarSesion } from '../services/auth';
import { useSesionStore } from '../store/useSesionStore';

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

const Marca = styled.View`
  align-items: center;
  margin-bottom: ${theme.espaciado.xxxl}px;
`;

const Logo = styled.Image`
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

const EnlaceOlvido = styled(Link)`
  align-self: center;
  margin-top: ${theme.espaciado.lg}px;
  padding-vertical: ${theme.espaciado.sm}px;
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.azulPrimario};
`;

export default function Login() {
  const router = useRouter();
  const guardarSesion = useSesionStore((state) => state.guardarSesion);

  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [claveVisible, setClaveVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  // Para pasar del campo usuario al de contraseña con la tecla "siguiente".
  const refClave = useRef<TextInput>(null);

  // El error se muestra como texto bajo los campos y no con Alert.alert, que
  // en web no funciona.
  const ingresar = async () => {
    if (usuario.trim() === '' || clave === '') {
      setError('Ingresá tu usuario y tu contraseña.');
      return;
    }

    setError(null);
    setCargando(true);
    try {
      const sesion = await iniciarSesion(usuario, clave);
      guardarSesion(sesion.usuario);
      // replace y no push: una vez adentro, "volver" no debe regresar al login.
      router.replace('/menu');
    } catch {
      setError('No pudimos iniciar sesión. Intentá de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Contenido>
        <Marca>
          <Logo source={logoYoSoy} />
          <Titulo>YoSoy</Titulo>
          <Tagline>TELEMEDICINA EN SALUD MENTAL</Tagline>
        </Marca>

        <Tarjeta>
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

          {error && <MensajeError>{error}</MensajeError>}

          <BotonPrimario texto="Ingresar" onPress={ingresar} cargando={cargando} />

          <EnlaceOlvido href="/recuperar-clave">
            Olvidé mi contraseña
          </EnlaceOlvido>
        </Tarjeta>
      </Contenido>
    </Pantalla>
  );
}
