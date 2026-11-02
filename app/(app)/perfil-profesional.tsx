import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, TextInput } from 'react-native';
import styled from 'styled-components/native';

import BotonPrimario from '../../components/BotonPrimario';
import CampoTexto from '../../components/CampoTexto';
import Chip from '../../components/Chip';
import Header from '../../components/Header';
import { theme } from '../../constants/theme';
import {
  activarLinkPublico,
  actualizarPerfilProfesional,
  obtenerPerfilProfesional,
} from '../../services/perfilProfesional';
import { obtenerEspecialidades } from '../../services/profesionales';
import { useSesionStore } from '../../store/useSesionStore';
import { aClave, aFechaCorta, desdeClave, desdeFechaCorta } from '../../utils/fechas';

// Mi perfil (lado profesional): ver y editar los datos propios. Mismos
// campos que deja editar la web (nombre, apellido, DNI, fecha de
// nacimiento, teléfono, mail, provincia y especialidad); la matrícula se
// muestra pero no se edita. El link público de reserva se prende o apaga
// aparte, con su propio pedido (PUT /profesionales/{id}/link-publico).

const formatearFechaNacimiento = (texto: string): string => {
  const digitos = texto.replace(/\D/g, '').slice(0, 8);
  const dia = digitos.slice(0, 2);
  const mes = digitos.slice(2, 4);
  const anio = digitos.slice(4, 8);
  return [dia, mes, anio].filter(Boolean).join('/');
};

const REGEX_DNI = /^\d{7,9}$/;
const REGEX_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Pantalla = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: theme.espaciado.xl,
    paddingTop: theme.espaciado.superiorPantalla,
    paddingBottom: theme.espaciado.xxxl,
  },
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
  margin-bottom: ${theme.espaciado.lg}px;
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

const TarjetaLink = styled(Tarjeta)`
  margin-top: ${theme.espaciado.xl}px;
`;

const Fila = styled.ScrollView.attrs({
  horizontal: true,
  showsHorizontalScrollIndicator: false,
})`
  margin-bottom: ${theme.espaciado.lg}px;
`;

const EstadoCarga = styled.View`
  align-items: center;
  margin-top: ${theme.espaciado.xxxl}px;
`;

const Mensaje = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoSecundario};
  text-align: center;
`;

const MensajeAyuda = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-bottom: ${theme.espaciado.md}px;
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

const TextoAccionPeligro = styled(TextoAccion)`
  color: ${theme.colores.error};
`;

const MensajeError = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.error};
  margin-bottom: ${theme.espaciado.md}px;
`;

const MensajeExito = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.azulPrimario};
  background-color: ${theme.colores.fondoBadgeEspecialidad};
  border-radius: ${theme.radios.md}px;
  padding: ${theme.espaciado.md}px;
  margin-bottom: ${theme.espaciado.lg}px;
`;

export default function PerfilProfesional() {
  const router = useRouter();
  const idProfesional = useSesionStore((state) => state.idProfesional);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['perfil-profesional', idProfesional],
    queryFn: () => obtenerPerfilProfesional(idProfesional as number),
    enabled: idProfesional !== null,
  });

  const { data: especialidades } = useQuery({
    queryKey: ['especialidades'],
    queryFn: obtenerEspecialidades,
  });

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mail, setMail] = useState('');
  const [provincia, setProvincia] = useState('');
  const [idEspecialidad, setIdEspecialidad] = useState<string | null>(null);

  const [errorForm, setErrorForm] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [errorLink, setErrorLink] = useState<string | null>(null);
  const [cambiandoLink, setCambiandoLink] = useState(false);

  // Carga los campos del formulario una sola vez, cuando llega la respuesta
  // del servidor: si se repitiera en cada render pisaría lo que el usuario
  // esté escribiendo.
  useEffect(() => {
    if (data) {
      setNombre(data.nombre);
      setApellido(data.apellido);
      setDni(data.dni);
      setFechaNacimiento(data.fechaNacimiento ? aFechaCorta(desdeClave(data.fechaNacimiento)) : '');
      setTelefono(data.telefono);
      setMail(data.mail);
      setProvincia(data.provincia);
      setIdEspecialidad(data.idEspecialidad);
    }
  }, [data]);

  const refApellido = useRef<TextInput>(null);
  const refDni = useRef<TextInput>(null);
  const refFecha = useRef<TextInput>(null);
  const refTelefono = useRef<TextInput>(null);
  const refMail = useRef<TextInput>(null);
  const refProvincia = useRef<TextInput>(null);

  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  };

  const validar = (): string | null => {
    if (nombre.trim() === '' || dni.trim() === '' || fechaNacimiento.trim() === '' || mail.trim() === '') {
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
    if (!idEspecialidad) {
      return 'Elegí tu especialidad.';
    }
    return null;
  };

  const guardar = async () => {
    const mensaje = validar();
    if (mensaje) {
      setErrorForm(mensaje);
      setMensajeExito(null);
      return;
    }
    if (!data) {
      return;
    }

    setErrorForm(null);
    setMensajeExito(null);
    setGuardando(true);

    try {
      await actualizarPerfilProfesional(idProfesional as number, {
        ...data,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        dni: dni.trim(),
        fechaNacimiento: desdeFechaCorta(fechaNacimiento) as string,
        telefono: telefono.trim(),
        mail: mail.trim(),
        provincia: provincia.trim(),
        idEspecialidad: idEspecialidad as string,
      });
      setMensajeExito('Tus datos quedaron guardados.');
      await refetch();
    } catch (e) {
      setErrorForm(e instanceof Error ? e.message : 'No pudimos guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarLink = async (activo: boolean) => {
    setErrorLink(null);
    setCambiandoLink(true);
    try {
      await activarLinkPublico(idProfesional as number, activo);
      await refetch();
    } catch (e) {
      setErrorLink(e instanceof Error ? e.message : 'No pudimos actualizar el link público.');
    } finally {
      setCambiandoLink(false);
    }
  };

  const urlLinkPublico = data?.slug
    ? `${process.env.EXPO_PUBLIC_API_URL ?? ''}/reservar/${data.slug}`
    : '';

  return (
    <Pantalla>
      <BotonVolver onPress={volver} accessibilityRole="button" accessibilityLabel="Volver al menú">
        <TextoVolver>← Menú</TextoVolver>
      </BotonVolver>

      <Header titulo="YoSoy" subtitulo="Tus datos profesionales." />

      {isLoading && (
        <EstadoCarga>
          <ActivityIndicator size="large" color={theme.colores.azulPrimario} />
        </EstadoCarga>
      )}

      {!isLoading && error && (
        <EstadoCarga>
          <Mensaje>No pudimos cargar tus datos.</Mensaje>
          <BotonAccion onPress={() => refetch()} accessibilityRole="button">
            <TextoAccion>Reintentar</TextoAccion>
          </BotonAccion>
        </EstadoCarga>
      )}

      {!isLoading && !error && data && (
        <>
          <Tarjeta>
            {mensajeExito && <MensajeExito>{mensajeExito}</MensajeExito>}

            <CampoTexto
              etiqueta="Nombre"
              value={nombre}
              onChangeText={setNombre}
              returnKeyType="next"
              onSubmitEditing={() => refApellido.current?.focus()}
              submitBehavior="submit"
            />

            <CampoTexto
              ref={refApellido}
              etiqueta="Apellido"
              value={apellido}
              onChangeText={setApellido}
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
              onChangeText={(texto) => setFechaNacimiento(formatearFechaNacimiento(texto))}
              placeholder="DD/MM/AAAA"
              keyboardType="number-pad"
              maxLength={10}
              returnKeyType="next"
              onSubmitEditing={() => refTelefono.current?.focus()}
              submitBehavior="submit"
            />

            <CampoTexto
              ref={refTelefono}
              etiqueta="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
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
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => refProvincia.current?.focus()}
              submitBehavior="submit"
            />

            <CampoTexto
              ref={refProvincia}
              etiqueta="Provincia"
              value={provincia}
              onChangeText={setProvincia}
              returnKeyType="done"
              onSubmitEditing={guardar}
            />

            <CampoTexto etiqueta="Matrícula" value={data.matricula} editable={false} />

            <TituloSeccion>ESPECIALIDAD</TituloSeccion>
            <Fila>
              {(especialidades ?? []).map((item) => (
                <Chip
                  key={item.id}
                  texto={item.nombre}
                  activo={idEspecialidad === item.id}
                  onPress={() => setIdEspecialidad(item.id)}
                  accessibilityLabel={`Elegir especialidad ${item.nombre}`}
                />
              ))}
            </Fila>

            {errorForm && <MensajeError>{errorForm}</MensajeError>}

            <BotonPrimario texto="Guardar cambios" onPress={guardar} cargando={guardando} />
          </Tarjeta>

          <TarjetaLink>
            <TituloSeccion>LINK PÚBLICO DE RESERVA</TituloSeccion>
            <MensajeAyuda>
              {data.linkPublicoActivo
                ? 'Cualquiera con este link puede reservar un turno con vos sin pasar por admisión.'
                : 'Activalo para que cualquiera pueda reservar un turno con vos sin pasar por admisión.'}
            </MensajeAyuda>

            {data.linkPublicoActivo && urlLinkPublico !== '' && (
              <CampoTexto etiqueta="Tu link" value={urlLinkPublico} editable={false} selectTextOnFocus />
            )}

            {errorLink && <MensajeError>{errorLink}</MensajeError>}

            {cambiandoLink ? (
              <EstadoCarga>
                <ActivityIndicator size="small" color={theme.colores.azulPrimario} />
              </EstadoCarga>
            ) : data.linkPublicoActivo ? (
              <BotonAccion onPress={() => cambiarLink(false)} accessibilityRole="button">
                <TextoAccionPeligro>Apagar link público</TextoAccionPeligro>
              </BotonAccion>
            ) : (
              <BotonAccion onPress={() => cambiarLink(true)} accessibilityRole="button">
                <TextoAccion>Activar link público</TextoAccion>
              </BotonAccion>
            )}
          </TarjetaLink>
        </>
      )}
    </Pantalla>
  );
}
