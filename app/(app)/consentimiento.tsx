import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import BotonPrimario from '../../components/BotonPrimario';
import Header from '../../components/Header';
import { theme } from '../../constants/theme';
import { EstadoConsentimiento, firmarConsentimiento, obtenerConsentimiento } from '../../services/consentimiento';
import { useSesionStore } from '../../store/useSesionStore';
import { aFechaCorta, aHora } from '../../utils/fechas';

// Consentimiento informado de telemedicina (RN-02), lado paciente. El
// backend ya exige esta firma para confirmar un turno (ver
// TurnoReglasService.ValidarPasoAConfirmado) aunque la app no tuviera esta
// pantalla: sin ella, el paciente se encontraba con el error de la API al
// confirmar y no tenía forma de resolverlo. Mismos estados que
// PANTALLAS/Pantalla_Paciente/consentimiento.html: cargando, error,
// ya firmado o para firmar. El texto legal es un placeholder porque el
// equipo todavía no redactó el definitivo (ver Consentimiento:VersionTexto
// = "sin-validar" en appsettings.json): se muestra igual que en la web.
function formatearFechaHora(iso: string): string {
  const fecha = new Date(iso);
  return `${aFechaCorta(fecha)} a las ${aHora(fecha)}`;
}

function versionEsReal(version: string): boolean {
  return version !== 'sin-validar';
}

const Pantalla = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: theme.espaciado.xl,
    paddingTop: theme.espaciado.superiorPantalla,
    paddingBottom: theme.espaciado.xxxl,
  },
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

const BotonAccion = styled.TouchableOpacity`
  padding-vertical: ${theme.espaciado.sm}px;
  margin-top: ${theme.espaciado.md}px;
`;

const TextoAccion = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.azulPrimario};
`;

const FilaFirmado = styled.View`
  flex-direction: row;
  align-items: flex-start;
  gap: ${theme.espaciado.md}px;
`;

const Columna = styled.View`
  flex: 1;
`;

const TituloFirmado = styled.Text`
  font-size: ${theme.fuentes.lg}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
`;

const DetalleFirmado = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.xs}px;
`;

const AyudaFirmado = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.md}px;
`;

const TextoLegal = styled.View`
  background-color: ${theme.colores.fondo};
  border-radius: ${theme.radios.md}px;
  border-width: 1px;
  border-color: ${theme.colores.borde};
  padding: ${theme.espaciado.lg}px;
`;

const Placeholder = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoPrincipal};
`;

const NotaBorrador = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.md}px;
`;

const LineaVersion = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.md}px;
`;

const Ayuda = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.lg}px;
`;

const MensajeError = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.error};
  margin-top: ${theme.espaciado.md}px;
`;

export default function Consentimiento() {
  const router = useRouter();
  const idPaciente = useSesionStore((state) => state.idPaciente);

  const { data, isLoading, error, refetch } = useQuery<EstadoConsentimiento>({
    queryKey: ['consentimiento', idPaciente],
    queryFn: () => obtenerConsentimiento(idPaciente as number),
    enabled: idPaciente !== null,
  });

  const [firmando, setFirmando] = useState(false);
  const [errorFirma, setErrorFirma] = useState<string | null>(null);

  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/menu');
    }
  };

  const firmar = async () => {
    if (!data) {
      return;
    }
    setErrorFirma(null);
    setFirmando(true);
    try {
      await firmarConsentimiento(idPaciente as number, data.versionTexto);
      await refetch();
    } catch (e) {
      setErrorFirma(e instanceof Error ? e.message : 'No pudimos registrar la firma.');
      await refetch();
    } finally {
      setFirmando(false);
    }
  };

  return (
    <Pantalla>
      <BotonVolver onPress={volver} accessibilityRole="button" accessibilityLabel="Volver al menú">
        <TextoVolver>← Menú</TextoVolver>
      </BotonVolver>

      <Header titulo="YoSoy" subtitulo="Consentimiento informado para la atención por telemedicina." />

      {isLoading && (
        <EstadoCarga>
          <ActivityIndicator size="large" color={theme.colores.azulPrimario} />
        </EstadoCarga>
      )}

      {!isLoading && error && (
        <EstadoCarga>
          <Mensaje>No pudimos consultar tu consentimiento.</Mensaje>
          <BotonAccion onPress={() => refetch()} accessibilityRole="button">
            <TextoAccion>Reintentar</TextoAccion>
          </BotonAccion>
        </EstadoCarga>
      )}

      {!isLoading && !error && data && data.firmado && (
        <Tarjeta>
          <FilaFirmado>
            <Ionicons name="checkmark-circle" size={theme.iconos.lg} color={theme.colores.azulPrimario} />
            <Columna>
              <TituloFirmado>Ya firmaste este consentimiento</TituloFirmado>
              <DetalleFirmado>
                {data.fechaFirma && `Lo firmaste el ${formatearFechaHora(data.fechaFirma)}`}
                {data.versionFirmada &&
                  versionEsReal(data.versionFirmada) &&
                  ` (versión del texto: ${data.versionFirmada}).`}
              </DetalleFirmado>
            </Columna>
          </FilaFirmado>
          <AyudaFirmado>
            No hace falta volver a firmarlo. Si necesitás revocarlo o tenés dudas, hablalo con tu
            profesional.
          </AyudaFirmado>
        </Tarjeta>
      )}

      {!isLoading && !error && data && !data.firmado && (
        <Tarjeta>
          <TextoLegal>
            <Placeholder>[Texto legal del consentimiento informado]</Placeholder>
            <NotaBorrador>
              Este espacio muestra el texto del consentimiento informado para la atención
              psicológica por telemedicina. El texto definitivo todavía tiene que ser redactado y
              validado por el equipo.
            </NotaBorrador>
          </TextoLegal>

          {versionEsReal(data.versionTexto) && (
            <LineaVersion>Versión del texto: {data.versionTexto}</LineaVersion>
          )}

          {errorFirma && <MensajeError>{errorFirma}</MensajeError>}

          <BotonPrimario
            texto="Leí el consentimiento y lo acepto"
            onPress={firmar}
            cargando={firmando}
          />

          <Ayuda>Al aceptar se guarda la fecha y la hora de tu firma. Es necesario para que se confirmen tus turnos.</Ayuda>
        </Tarjeta>
      )}
    </Pantalla>
  );
}
