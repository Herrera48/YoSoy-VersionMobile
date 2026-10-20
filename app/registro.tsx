import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, TextInput } from 'react-native';
import styled from 'styled-components/native';

import BotonPrimario from '../components/BotonPrimario';
import CampoTexto from '../components/CampoTexto';
import { theme } from '../constants/theme';
import { iniciarSesion, registrarPaciente } from '../services/auth';
import { useSesionStore } from '../store/useSesionStore';
import { aClave, desdeFechaCorta } from '../utils/fechas';

const REGEX_DNI = /^\d{7,9}$/;
const REGEX_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REGEX_USUARIO = /^[a-zA-Z0-9_.-]{3,50}$/;

const TEXTO_ACUERDO = `Bienvenido/a a YoSoy

Usted está por registrarse en nuestra plataforma digital de atención en salud mental, creada con el objetivo de brindar una atención personalizada, segura y adaptada a las necesidades de cada paciente.

Al registrarse, usted acepta que:
- Los datos personales e información brindada serán almacenados de manera segura y confidencial.
- Las consultas y sesiones se realizarán bajo modalidad virtual.
- El sistema analizará su perfil para recomendar profesionales especializados.
- Se evaluará la evolución del tratamiento y posibles cambios de especialista.
- Los turnos podrán seleccionarse según disponibilidad.
- El enlace de acceso será enviado a su correo electrónico.

Información clínica
Durante las consultas podrán registrarse:
- Expresiones faciales.
- Grabaciones de audio y/o video.
- Información conversada durante las sesiones.

La información será utilizada exclusivamente con fines clínicos y almacenada en su Historia Clínica Digital (HC). El acceso estará restringido únicamente a usted y a los profesionales autorizados.

En caso de no aceptar las condiciones, no podrá utilizar la plataforma. Sus datos serán utilizados únicamente con fines médicos, administrativos y de telemedicina.`;

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

const Titulo = styled.Text`
  font-size: ${theme.fuentes.xl}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
  margin-bottom: ${theme.espaciado.sm}px;
`;

const Subtitulo = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoSecundario};
  margin-bottom: ${theme.espaciado.xl}px;
`;

const CuerpoAcuerdo = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.textoPrincipal};
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.lg}px;
  border-width: 1px;
  border-color: ${theme.colores.borde};
  padding: ${theme.espaciado.xl}px;
  margin-bottom: ${theme.espaciado.xl}px;
`;

const BotonNoAcepto = styled.TouchableOpacity`
  align-self: center;
  margin-top: ${theme.espaciado.lg}px;
  padding-vertical: ${theme.espaciado.sm}px;
`;

const TextoNoAcepto = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.error};
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

export default function Registro() {
  const router = useRouter();
  const guardarSesion = useSesionStore((state) => state.guardarSesion);

  const [paso, setPaso] = useState<'acuerdo' | 'formulario'>('acuerdo');

  const [nombre, setNombre] = useState('');
  const [dni, setDni] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mail, setMail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [repetirContrasena, setRepetirContrasena] = useState('');
  const [contrasenaVisible, setContrasenaVisible] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const refDni = useRef<TextInput>(null);
  const refFecha = useRef<TextInput>(null);
  const refDomicilio = useRef<TextInput>(null);
  const refTelefono = useRef<TextInput>(null);
  const refMail = useRef<TextInput>(null);
  const refUsuario = useRef<TextInput>(null);
  const refContrasena = useRef<TextInput>(null);
  const refRepetir = useRef<TextInput>(null);

  const volverAlLogin = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const validar = (): string | null => {
    if (
      nombre.trim() === '' ||
      dni.trim() === '' ||
      fechaNacimiento.trim() === '' ||
      domicilio.trim() === '' ||
      mail.trim() === '' ||
      usuario.trim() === '' ||
      contrasena === ''
    ) {
      return 'Completá todos los campos obligatorios.';
    }
    if (!REGEX_DNI.test(dni.trim())) {
      return 'El DNI debe tener entre 7 y 9 números, sin puntos.';
    }
    const fechaClave = desdeFechaCorta(fechaNacimiento);
    if (!fechaClave) {
      return 'Ingresá una fecha de nacimiento válida (DD/MM/AAAA).';
    }
    if (fechaClave > aClave(new Date())) {
      return 'La fecha de nacimiento no puede ser futura.';
    }
    if (!REGEX_MAIL.test(mail.trim())) {
      return 'Ingresá un mail válido.';
    }
    if (!REGEX_USUARIO.test(usuario.trim())) {
      return 'El usuario debe tener de 3 a 50 caracteres: letras, números, puntos, guiones o guiones bajos.';
    }
    if (contrasena.length < 6 || contrasena.length > 100) {
      return 'La contraseña debe tener entre 6 y 100 caracteres.';
    }
    if (contrasena !== repetirContrasena) {
      return 'Las contraseñas no coinciden.';
    }
    return null;
  };

  const registrar = async () => {
    const mensajeError = validar();
    if (mensajeError) {
      setError(mensajeError);
      return;
    }

    setError(null);
    setCargando(true);

    try {
      await registrarPaciente({
        nombre: nombre.trim(),
        dni: dni.trim(),
        fechaNacimiento: desdeFechaCorta(fechaNacimiento) as string,
        domicilio: domicilio.trim(),
        telefono: telefono.trim() === '' ? null : telefono.trim(),
        mail: mail.trim(),
        usuario: usuario.trim(),
        contrasena,
      });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'No pudimos completar el registro. Intentá de nuevo.'
      );
      setCargando(false);
      return;
    }

    try {
      const sesion = await iniciarSesion(usuario.trim(), contrasena);
      guardarSesion(sesion.usuario, sesion.token, sesion.idPaciente);
      router.replace('/menu');
    } catch {
      router.replace({ pathname: '/', params: { registrado: '1' } });
    } finally {
      setCargando(false);
    }
  };

  if (paso === 'acuerdo') {
    return (
      <Pantalla>
        <Contenido>
          <BotonVolver
            onPress={volverAlLogin}
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio de sesión"
          >
            <TextoVolver>← Volver</TextoVolver>
          </BotonVolver>

          <Titulo>Acuerdo de atención al paciente</Titulo>
          <Subtitulo>
            Leelo antes de registrarte. Para continuar tenés que aceptarlo.
          </Subtitulo>

          <CuerpoAcuerdo>{TEXTO_ACUERDO}</CuerpoAcuerdo>

          <BotonPrimario
            texto="Acepto y quiero registrarme"
            onPress={() => setPaso('formulario')}
          />

          <BotonNoAcepto
            onPress={volverAlLogin}
            accessibilityRole="button"
            accessibilityLabel="No acepto el acuerdo"
          >
            <TextoNoAcepto>No acepto</TextoNoAcepto>
          </BotonNoAcepto>
        </Contenido>
      </Pantalla>
    );
  }

  return (
    <Pantalla>
      <Contenido>
        <BotonVolver
          onPress={() => setPaso('acuerdo')}
          accessibilityRole="button"
          accessibilityLabel="Volver al acuerdo"
        >
          <TextoVolver>← Volver</TextoVolver>
        </BotonVolver>

        <Tarjeta>
          <TituloFormulario>Crear cuenta</TituloFormulario>

          <CampoTexto
            etiqueta="Nombre y apellido"
            value={nombre}
            onChangeText={setNombre}
            placeholder="Tu nombre y apellido"
            returnKeyType="next"
            onSubmitEditing={() => refDni.current?.focus()}
            submitBehavior="submit"
          />

          <CampoTexto
            ref={refDni}
            etiqueta="DNI"
            value={dni}
            onChangeText={setDni}
            placeholder="Sin puntos"
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => refFecha.current?.focus()}
            submitBehavior="submit"
          />

          <CampoTexto
            ref={refFecha}
            etiqueta="Fecha de nacimiento"
            value={fechaNacimiento}
            onChangeText={setFechaNacimiento}
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => refDomicilio.current?.focus()}
            submitBehavior="submit"
          />

          <CampoTexto
            ref={refDomicilio}
            etiqueta="Domicilio"
            value={domicilio}
            onChangeText={setDomicilio}
            placeholder="Tu domicilio"
            returnKeyType="next"
            onSubmitEditing={() => refTelefono.current?.focus()}
            submitBehavior="submit"
          />

          <CampoTexto
            ref={refTelefono}
            etiqueta="Teléfono (opcional)"
            value={telefono}
            onChangeText={setTelefono}
            placeholder="Tu teléfono"
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => refMail.current?.focus()}
            submitBehavior="submit"
          />

          <CampoTexto
            ref={refMail}
            etiqueta="Mail"
            value={mail}
            onChangeText={setMail}
            placeholder="Tu mail"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            returnKeyType="next"
            onSubmitEditing={() => refUsuario.current?.focus()}
            submitBehavior="submit"
          />

          <CampoTexto
            ref={refUsuario}
            etiqueta="Usuario"
            value={usuario}
            onChangeText={setUsuario}
            placeholder="Elegí un usuario"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            returnKeyType="next"
            onSubmitEditing={() => refContrasena.current?.focus()}
            submitBehavior="submit"
          />

          <CampoTexto
            ref={refContrasena}
            etiqueta="Contraseña"
            value={contrasena}
            onChangeText={setContrasena}
            placeholder="Elegí una contraseña"
            secureTextEntry={!contrasenaVisible}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => refRepetir.current?.focus()}
            submitBehavior="submit"
            accesorio={
              <BotonOjo
                onPress={() => setContrasenaVisible((visible) => !visible)}
                accessibilityRole="button"
                accessibilityLabel={
                  contrasenaVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                <Ionicons
                  name={contrasenaVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={theme.iconos.md}
                  color={theme.colores.textoSecundario}
                />
              </BotonOjo>
            }
          />

          <CampoTexto
            ref={refRepetir}
            etiqueta="Repetir contraseña"
            value={repetirContrasena}
            onChangeText={setRepetirContrasena}
            placeholder="Repetí la contraseña"
            secureTextEntry={!contrasenaVisible}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={registrar}
          />

          {error && <MensajeError>{error}</MensajeError>}

          <BotonPrimario texto="Crear cuenta" onPress={registrar} cargando={cargando} />
        </Tarjeta>
      </Contenido>
    </Pantalla>
  );
}
