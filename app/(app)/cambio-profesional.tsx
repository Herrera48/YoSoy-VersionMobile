import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import BotonPrimario from '../../components/BotonPrimario';
import CampoTexto from '../../components/CampoTexto';
import Header from '../../components/Header';
import ProfesionalOpcion from '../../components/ProfesionalOpcion';
import { theme } from '../../constants/theme';
import { solicitarCambioProfesional } from '../../services/derivaciones';
import { obtenerMisProfesionales } from '../../services/profesionales';
import { useSesionStore } from '../../store/useSesionStore';

// Solicitar cambio de profesional (lado paciente): elegís a cuál de tus
// profesionales asignados querés dejar, contás el motivo (opcional) y lo
// manda a revisión del equipo de admisión, que asigna el profesional nuevo.
// Mismo armado que Mi perfil: ScrollView con una Tarjeta y CampoTexto/
// BotonPrimario.

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
  margin-top: ${theme.espaciado.xl}px;
  shadow-color: ${theme.colores.sombra};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 2;
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

const MensajeError = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.error};
  margin-top: ${theme.espaciado.md}px;
`;

const MensajeExito = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.azulPrimario};
  background-color: ${theme.colores.fondoBadgeEspecialidad};
  border-radius: ${theme.radios.md}px;
  padding: ${theme.espaciado.md}px;
  margin-top: ${theme.espaciado.lg}px;
`;

export default function CambioProfesional() {
  const router = useRouter();
  const idPaciente = useSesionStore((state) => state.idPaciente);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['mis-profesionales', idPaciente, null],
    queryFn: () => obtenerMisProfesionales(idPaciente as number, null),
    enabled: idPaciente !== null,
  });

  const [idElegido, setIdElegido] = useState<string | null>(null);
  const [motivo, setMotivo] = useState('');
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  };

  const enviar = async () => {
    if (!idElegido) {
      setErrorEnvio('Elegí el profesional del que querés cambiarte.');
      setMensajeExito(null);
      return;
    }

    setErrorEnvio(null);
    setMensajeExito(null);
    setEnviando(true);

    try {
      await solicitarCambioProfesional(idElegido, motivo.trim() === '' ? null : motivo.trim());
      setMensajeExito('Solicitud enviada. El equipo la va a revisar.');
      setMotivo('');
      setIdElegido(null);
    } catch (e) {
      setErrorEnvio(e instanceof Error ? e.message : 'No se pudo enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Pantalla>
      <BotonVolver onPress={volver} accessibilityRole="button" accessibilityLabel="Volver al menú">
        <TextoVolver>← Menú</TextoVolver>
      </BotonVolver>

      <Header titulo="YoSoy" subtitulo="Solicitá el cambio de un profesional asignado." />

      <TituloSeccion>PROFESIONAL ACTUAL</TituloSeccion>

      {isLoading && (
        <EstadoLista>
          <ActivityIndicator size="large" color={theme.colores.azulPrimario} />
        </EstadoLista>
      )}

      {!isLoading && error && (
        <EstadoLista>
          <Mensaje>No pudimos cargar tus profesionales.</Mensaje>
          <BotonAccion onPress={() => refetch()} accessibilityRole="button">
            <TextoAccion>Reintentar</TextoAccion>
          </BotonAccion>
        </EstadoLista>
      )}

      {!isLoading && !error && (data ?? []).length === 0 && (
        <EstadoLista>
          <Mensaje>Todavía no tenés profesionales asignados.</Mensaje>
        </EstadoLista>
      )}

      {!isLoading &&
        !error &&
        (data ?? []).map((profesional) => (
          <ProfesionalOpcion
            key={profesional.id}
            profesional={profesional}
            activo={idElegido === profesional.id}
            onPress={() => setIdElegido(profesional.id)}
          />
        ))}

      {!isLoading && !error && (data ?? []).length > 0 && (
        <Tarjeta>
          <CampoTexto
            etiqueta="Motivo (opcional)"
            ayuda="Contanos por qué querés cambiar de profesional."
            value={motivo}
            onChangeText={setMotivo}
            placeholder="Escribí acá..."
            multiline
            textAlignVertical="top"
            style={{ minHeight: 96 }}
            maxLength={500}
          />

          {errorEnvio && <MensajeError>{errorEnvio}</MensajeError>}
          {mensajeExito && <MensajeExito>{mensajeExito}</MensajeExito>}

          <BotonPrimario texto="Enviar solicitud" onPress={enviar} cargando={enviando} />
        </Tarjeta>
      )}
    </Pantalla>
  );
}
