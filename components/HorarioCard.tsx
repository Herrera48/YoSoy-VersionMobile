import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { HorarioInput, HorarioProfesional } from '../services/horarios';
import Badge from './Badge';
import FormularioHorario from './FormularioHorario';

// Tarjeta de un horario de atención, para la pantalla Horarios (lado
// profesional). Presentacional, igual que TurnoCard: recibe el horario por
// props y lleva su propio diálogo de confirmación para Eliminar (en la misma
// tarjeta, no con Alert.alert, que en web no funciona). Al editar, el
// FormularioHorario reemplaza las acciones dentro de la misma tarjeta.
interface HorarioCardProps {
  horario: HorarioProfesional;
  editando: boolean;
  onEditar: () => void;
  onGuardarEdicion: (input: HorarioInput) => Promise<void>;
  onCancelarEdicion: () => void;
  guardandoEdicion: boolean;
  onEliminar: () => void;
  eliminando: boolean;
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

const FilaDia = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${theme.espaciado.sm}px;
`;

const Dia = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoPrincipal};
`;

const FilaHora = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${theme.espaciado.xs}px;
`;

const Hora = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.azulPrimario};
  margin-left: ${theme.espaciado.xs}px;
`;

const Intervalo = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.xs}px;
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

export default function HorarioCard({
  horario,
  editando,
  onEditar,
  onGuardarEdicion,
  onCancelarEdicion,
  guardandoEdicion,
  onEliminar,
  eliminando,
  error,
}: HorarioCardProps) {
  const [confirmando, setConfirmando] = useState(false);

  return (
    <Tarjeta>
      <FilaDia>
        <Dia>{horario.dia}</Dia>
        <Badge texto={horario.disponible ? 'Disponible' : 'No disponible'} variante="modalidad" />
      </FilaDia>

      <FilaHora>
        <Ionicons name="time-outline" size={theme.iconos.md} color={theme.colores.azulPrimario} />
        <Hora>
          {horario.horaInicio} a {horario.horaFin}
        </Hora>
      </FilaHora>

      <Intervalo>Turnos cada {horario.intervaloMinutos} minutos</Intervalo>

      {error && <MensajeError>{error}</MensajeError>}

      {editando ? (
        <FormularioHorario
          valoresIniciales={horario}
          onGuardar={onGuardarEdicion}
          onCancelar={onCancelarEdicion}
          guardando={guardandoEdicion}
        />
      ) : (
        <Acciones>
          {eliminando ? (
            <ActivityIndicator size="small" color={theme.colores.error} />
          ) : confirmando ? (
            <>
              <Pregunta>¿Eliminar este horario?</Pregunta>
              <BotonAccion
                onPress={() => setConfirmando(false)}
                accessibilityRole="button"
                accessibilityLabel="No eliminar el horario"
              >
                <TextoAccion>No</TextoAccion>
              </BotonAccion>
              <BotonAccion
                onPress={() => {
                  setConfirmando(false);
                  onEliminar();
                }}
                accessibilityRole="button"
                accessibilityLabel="Sí, eliminar el horario"
              >
                <TextoAccion $peligro>Sí, eliminar</TextoAccion>
              </BotonAccion>
            </>
          ) : (
            <>
              <BotonAccion onPress={onEditar} accessibilityRole="button" accessibilityLabel="Editar horario">
                <Ionicons name="create-outline" size={theme.iconos.md} color={theme.colores.azulPrimario} />
                <TextoAccion>Editar</TextoAccion>
              </BotonAccion>
              <BotonAccion
                onPress={() => setConfirmando(true)}
                accessibilityRole="button"
                accessibilityLabel="Eliminar horario"
              >
                <Ionicons name="trash-outline" size={theme.iconos.md} color={theme.colores.error} />
                <TextoAccion $peligro>Eliminar</TextoAccion>
              </BotonAccion>
            </>
          )}
        </Acciones>
      )}
    </Tarjeta>
  );
}
