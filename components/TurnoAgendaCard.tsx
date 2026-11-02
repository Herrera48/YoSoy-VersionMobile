import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { TurnoAgenda } from '../services/agenda';
import Badge from './Badge';

// Tarjeta de un turno en la Agenda del profesional. Presentacional, igual que
// TurnoCard (lado paciente): Cancelar pide confirmación en la misma tarjeta,
// no con Alert.alert. Sin acceso a sala: es video, que la app no ofrece.
interface TurnoAgendaCardProps {
  turno: TurnoAgenda;
  onCancelar: () => void;
  cancelando: boolean;
  error: string | null;
}

const Tarjeta = styled.View`
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.lg}px;
  border-width: 1px;
  border-color: ${theme.colores.borde};
  padding: ${theme.espaciado.lg}px;
  margin-bottom: ${theme.espaciado.md}px;
  shadow-color: ${theme.colores.sombra};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 2;
`;

const FilaHora = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${theme.espaciado.sm}px;
`;

const Hora = styled.Text`
  font-size: ${theme.fuentes.lg}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
`;

const Paciente = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoPrincipal};
  margin-top: ${theme.espaciado.sm}px;
`;

const Motivo = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.xs}px;
`;

const MensajePropuesto = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.violetaOscuro};
  margin-top: ${theme.espaciado.sm}px;
`;

const Acciones = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: ${theme.espaciado.lg}px;
  border-top-width: 1px;
  border-top-color: ${theme.colores.borde};
  margin-top: ${theme.espaciado.md}px;
  padding-top: ${theme.espaciado.sm}px;
`;

const BotonAccion = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding-vertical: ${theme.espaciado.xs}px;
`;

const TextoAccion = styled.Text<{ $peligro?: boolean }>`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.semi};
  color: ${({ $peligro }) => ($peligro ? theme.colores.error : theme.colores.azulPrimario)};
  margin-left: ${theme.espaciado.xs}px;
`;

const Pregunta = styled.Text`
  flex: 1;
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.textoPrincipal};
`;

const MensajeError = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.error};
  margin-top: ${theme.espaciado.sm}px;
`;

export default function TurnoAgendaCard({ turno, onCancelar, cancelando, error }: TurnoAgendaCardProps) {
  const [confirmando, setConfirmando] = useState(false);
  const puedeCancelar = turno.estado === 'Pendiente' || turno.estado === 'Confirmado';

  return (
    <Tarjeta>
      <FilaHora>
        <Ionicons name="time-outline" size={theme.iconos.md} color={theme.colores.azulPrimario} />
        <Hora>{turno.hora} h</Hora>
        <Badge texto={turno.estado} variante="modalidad" />
      </FilaHora>

      <Paciente>{turno.nombrePaciente}</Paciente>
      {turno.motivo && <Motivo>{turno.motivo}</Motivo>}

      {turno.propuestoPorProfesional && (
        <MensajePropuesto>Esperando que el paciente confirme este turno.</MensajePropuesto>
      )}

      {error && <MensajeError>{error}</MensajeError>}

      {puedeCancelar && (
        <Acciones>
          {cancelando ? (
            <ActivityIndicator size="small" color={theme.colores.error} />
          ) : confirmando ? (
            <>
              <Pregunta>¿Cancelar este turno?</Pregunta>
              <BotonAccion
                onPress={() => setConfirmando(false)}
                accessibilityRole="button"
                accessibilityLabel="No cancelar el turno"
              >
                <TextoAccion>No</TextoAccion>
              </BotonAccion>
              <BotonAccion
                onPress={() => {
                  setConfirmando(false);
                  onCancelar();
                }}
                accessibilityRole="button"
                accessibilityLabel="Sí, cancelar el turno"
              >
                <TextoAccion $peligro>Sí, cancelar</TextoAccion>
              </BotonAccion>
            </>
          ) : (
            <BotonAccion
              onPress={() => setConfirmando(true)}
              accessibilityRole="button"
              accessibilityLabel="Cancelar el turno"
            >
              <Ionicons name="close-circle-outline" size={theme.iconos.md} color={theme.colores.error} />
              <TextoAccion $peligro>Cancelar</TextoAccion>
            </BotonAccion>
          )}
        </Acciones>
      )}
    </Tarjeta>
  );
}
