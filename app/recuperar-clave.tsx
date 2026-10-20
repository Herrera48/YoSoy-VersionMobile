import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';
import styled from 'styled-components/native';

import BotonPrimario from '../components/BotonPrimario';
import CampoTexto from '../components/CampoTexto';
import { theme } from '../constants/theme';
import { solicitarRecuperoClave } from '../services/auth';

const Pantalla = styled.KeyboardAvoidingView.attrs({
  behavior: Platform.OS === 'ios' ? 'padding' : undefined,
})`
  flex: 1;
  background-color: ${theme.colores.fondo};
`;

const Contenido = styled.ScrollView.attrs({
  contentContainerStyle: {
    flexGrow: 1,
    paddingHorizontal: theme.espaciado.xl,
    paddingTop: theme.espaciado.superiorPantalla,
    paddingBottom: theme.espaciado.xxxl,
  },
  keyboardShouldPersistTaps: 'handled',
})``;

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

const Titulo = styled.Text`
  font-size: ${theme.fuentes.xl}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
  margin-bottom: ${theme.espaciado.sm}px;
`;

const Descripcion = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoSecundario};
  margin-bottom: ${theme.espaciado.xl}px;
`;

const MensajeError = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.error};
  margin-bottom: ${theme.espaciado.md}px;
`;

export default function RecuperarClave() {
  const router = useRouter();

  const [usuario, setUsuario] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const enviar = async () => {
    const usuarioLimpio = usuario.trim();
    if (usuarioLimpio === '') {
      setError('Ingresá tu usuario.');
      return;
    }

    setError(null);
    setCargando(true);
    try {
      const respuesta = await solicitarRecuperoClave(usuarioLimpio);
      setMensaje(respuesta);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No pudimos enviar la solicitud. Intentá de nuevo.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <Pantalla>
      <Contenido>
        <BotonVolver
          onPress={volver}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio de sesión"
        >
          <TextoVolver>← Volver</TextoVolver>
        </BotonVolver>

        {mensaje ? (
          <Tarjeta>
            <Icono>
              <Ionicons
                name="mail-open-outline"
                size={theme.iconos.xl}
                color={theme.colores.azulPrimario}
              />
            </Icono>
            <Titulo>Revisá tu correo</Titulo>
            <Descripcion>{mensaje}</Descripcion>
            <BotonPrimario texto="Volver a iniciar sesión" onPress={volver} />
          </Tarjeta>
        ) : (
          <Tarjeta>
            <Titulo>Recuperar contraseña</Titulo>
            <Descripcion>
              Ingresá tu usuario y te enviaremos un enlace para crear una
              nueva contraseña.
            </Descripcion>

            <CampoTexto
              etiqueta="Usuario"
              value={usuario}
              onChangeText={setUsuario}
              placeholder="Tu usuario"
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              returnKeyType="send"
              onSubmitEditing={enviar}
            />

            {error && <MensajeError>{error}</MensajeError>}

            <BotonPrimario
              texto="Enviar enlace"
              onPress={enviar}
              cargando={cargando}
            />
          </Tarjeta>
        )}
      </Contenido>
    </Pantalla>
  );
}
