import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { Turno } from '../types';
import { NOMBRES_DIAS, NOMBRES_MESES, aClave, desdeClave } from '../utils/fechas';
import Badge from './Badge';

// Tarjeta de un turno reservado, para "Mis turnos". Presentacional, igual que
// ProfesionalCard: recibe el turno por props y no sabe de dónde viene.
// A la izquierda, un bloque con la fecha para ubicar el turno de un vistazo;
// a la derecha, la hora, el profesional y los badges de especialidad y
// modalidad.
// Abajo, las acciones "Modificar" y "Cancelar". Cancelar pide confirmación en
// la misma tarjeta (y no con Alert.alert, que en web no funciona).
interface TurnoCardProps {
  turno: Turno;
  onModificar: () => void;
  onCancelar: () => void;
  onConfirmar: () => void;
  // true mientras se está cancelando este turno.
  cancelando: boolean;
  confirmandoTurno: boolean;
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

const Contenido = styled.View`
  flex-direction: row;
`;

const BloqueFecha = styled.View`
  width: 64px;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colores.fondoBadgeEspecialidad};
  border-radius: ${theme.radios.md}px;
  padding-vertical: ${theme.espaciado.sm}px;
`;

const DiaSemana = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.bold};
  letter-spacing: ${theme.espaciadoLetra.normal}px;
  color: ${theme.colores.violetaOscuro};
`;

const DiaNumero = styled.Text`
  font-size: ${theme.fuentes.xl}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.azulPrimario};
`;

const Mes = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoSecundario};
`;

const Datos = styled.View`
  flex: 1;
  margin-left: ${theme.espaciado.lg}px;
`;

const FilaHora = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Hora = styled.Text`
  font-size: ${theme.fuentes.lg}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
  margin-left: ${theme.espaciado.xs}px;
  margin-right: ${theme.espaciado.sm}px;
`;

const Profesional = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoPrincipal};
  margin-top: ${theme.espaciado.xs}px;
`;

const Badges = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${theme.espaciado.sm}px;
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
  color: ${({ $peligro }) =>
    $peligro ? theme.colores.error : theme.colores.azulPrimario};
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

const MensajePropuesto = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.violetaOscuro};
  margin-top: ${theme.espaciado.md}px;
`;

// Tres letras en mayúscula: 'miércoles' → 'MIÉ', 'septiembre' → 'SEP'.
const abreviar = (texto: string) => texto.slice(0, 3).toUpperCase();

export default function TurnoCard({
  turno,
  onModificar,
  onCancelar,
  onConfirmar,
  cancelando,
  confirmandoTurno,
  error,
}: TurnoCardProps) {
  const [dialogo, setDialogo] = useState<'cancelar' | 'confirmar' | null>(null);
  const fecha = desdeClave(turno.fecha);
  const esHoy = turno.fecha === aClave(new Date());
  const { profesional } = turno;

  return (
    <Tarjeta>
      <Contenido
        accessible
        accessibilityLabel={`Turno${esHoy ? ' de hoy' : ''}, ${NOMBRES_DIAS[fecha.getDay()]} ${fecha.getDate()} de ${NOMBRES_MESES[fecha.getMonth()]} a las ${turno.hora} con ${profesional.nombre} ${profesional.apellido}`}
      >
        <BloqueFecha>
          <DiaSemana>{abreviar(NOMBRES_DIAS[fecha.getDay()])}</DiaSemana>
          <DiaNumero>{fecha.getDate()}</DiaNumero>
          <Mes>{abreviar(NOMBRES_MESES[fecha.getMonth()])}</Mes>
        </BloqueFecha>

        <Datos>
          <FilaHora>
            <Ionicons
              name="time-outline"
              size={theme.iconos.md}
              color={theme.colores.azulPrimario}
            />
            <Hora>{turno.hora} h</Hora>
            {esHoy && <Badge texto="Hoy" variante="especialidad" />}
          </FilaHora>

          <Profesional>
            {profesional.nombre} {profesional.apellido}
          </Profesional>

          <Badges>
            <Badge texto={profesional.especialidad} variante="especialidad" />
            <Badge texto={profesional.modalidad} variante="modalidad" />
            {turno.estado && <Badge texto={turno.estado} variante="modalidad" />}
          </Badges>
        </Datos>
      </Contenido>

      {turno.propuestoPorProfesional && (
        <MensajePropuesto>
          Tu profesional te propuso este turno. Confirmalo para que quede agendado.
        </MensajePropuesto>
      )}

      {error && <MensajeError>{error}</MensajeError>}

      <Acciones>
        {cancelando || confirmandoTurno ? (
          <ActivityIndicator
            size="small"
            color={confirmandoTurno ? theme.colores.azulPrimario : theme.colores.error}
          />
        ) : dialogo === 'cancelar' ? (
          <>
            <Pregunta>¿Cancelar este turno?</Pregunta>
            <BotonAccion
              onPress={() => setDialogo(null)}
              accessibilityRole="button"
              accessibilityLabel="No cancelar el turno"
            >
              <TextoAccion>No</TextoAccion>
            </BotonAccion>
            <BotonAccion
              onPress={() => {
                setDialogo(null);
                onCancelar();
              }}
              accessibilityRole="button"
              accessibilityLabel="Sí, cancelar el turno"
            >
              <TextoAccion $peligro>Sí, cancelar</TextoAccion>
            </BotonAccion>
          </>
        ) : dialogo === 'confirmar' ? (
          <>
            <Pregunta>¿Confirmar este turno?</Pregunta>
            <BotonAccion
              onPress={() => setDialogo(null)}
              accessibilityRole="button"
              accessibilityLabel="No confirmar el turno todavía"
            >
              <TextoAccion>No</TextoAccion>
            </BotonAccion>
            <BotonAccion
              onPress={() => {
                setDialogo(null);
                onConfirmar();
              }}
              accessibilityRole="button"
              accessibilityLabel="Sí, confirmar el turno"
            >
              <TextoAccion>Sí, confirmar</TextoAccion>
            </BotonAccion>
          </>
        ) : (
          <>
            {turno.propuestoPorProfesional && (
              <BotonAccion
                onPress={() => setDialogo('confirmar')}
                accessibilityRole="button"
                accessibilityLabel="Confirmar el turno"
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={theme.iconos.md}
                  color={theme.colores.azulPrimario}
                />
                <TextoAccion>Confirmar turno</TextoAccion>
              </BotonAccion>
            )}
            <BotonAccion
              onPress={onModificar}
              accessibilityRole="button"
              accessibilityLabel="Modificar el turno"
            >
              <Ionicons
                name="create-outline"
                size={theme.iconos.md}
                color={theme.colores.azulPrimario}
              />
              <TextoAccion>Modificar</TextoAccion>
            </BotonAccion>
            <BotonAccion
              onPress={() => setDialogo('cancelar')}
              accessibilityRole="button"
              accessibilityLabel="Cancelar el turno"
            >
              <Ionicons
                name="close-circle-outline"
                size={theme.iconos.md}
                color={theme.colores.error}
              />
              <TextoAccion $peligro>Cancelar</TextoAccion>
            </BotonAccion>
          </>
        )}
      </Acciones>
    </Tarjeta>
  );
}
