import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { obtenerMotivoAsignacion, PacienteAsignado } from '../services/pacientes';
import { aClave, aFechaCorta, desdeFechaCorta, formatearFechaLarga, validarHora } from '../utils/fechas';
import Badge from './Badge';
import BotonPrimario from './BotonPrimario';
import CampoTexto from './CampoTexto';

// Tarjeta de un paciente asignado, para "Mis pacientes" (lado profesional).
// Presentacional, igual que TurnoCard: recibe el paciente y los callbacks de
// acción por props, y lleva su propio estado de qué panel tiene abierto.
//
// Una asignación "Nueva" (recién derivada por admisión) muestra tres
// acciones, igual que la web: ver el motivo de la asignación (la evolución
// que dejó admisión), proponer el primer turno o devolver el caso a
// admisión. Una asignación ya confirmada solo muestra "Historia clínica":
// no hay "Sesión" porque es video, que la app no ofrece.
interface PacienteCardProps {
  paciente: PacienteAsignado;
  onConfirmar: (fecha: string, hora: string) => Promise<void>;
  onDevolver: (motivo: string) => Promise<void>;
  confirmando: boolean;
  devolviendo: boolean;
  errorConfirmar: string | null;
  errorDevolver: string | null;
}

type Panel = 'motivo' | 'confirmar' | 'devolver' | null;

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

const FilaNombre = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${theme.espaciado.sm}px;
`;

const Nombre = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoPrincipal};
`;

const Dato = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.xs}px;
`;

const Acciones = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
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

const Panel = styled.View`
  border-top-width: 1px;
  border-top-color: ${theme.colores.borde};
  margin-top: ${theme.espaciado.md}px;
  padding-top: ${theme.espaciado.md}px;
`;

const Ayuda = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-bottom: ${theme.espaciado.md}px;
`;

const FilaFechaHora = styled.View`
  flex-direction: row;
  gap: ${theme.espaciado.md}px;
`;

const Columna = styled.View`
  flex: 1;
`;

const MensajeError = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.error};
  margin-bottom: ${theme.espaciado.md}px;
`;

const MensajeVacio = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.textoSecundario};
`;

const Evolucion = styled.View`
  margin-bottom: ${theme.espaciado.md}px;
`;

const FechaEvolucion = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoPrincipal};
  margin-bottom: ${theme.espaciado.xs}px;
`;

const TextoEvolucion = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.textoPrincipal};
  margin-bottom: ${theme.espaciado.xs}px;
`;

const PlanEvolucion = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.violetaOscuro};
`;

export default function PacienteCard({
  paciente,
  onConfirmar,
  onDevolver,
  confirmando,
  devolviendo,
  errorConfirmar,
  errorDevolver,
}: PacienteCardProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>(null);
  const esNueva = paciente.estadoAsignacion === 'Nueva';

  const [fecha, setFecha] = useState(() => aFechaCorta(new Date()));
  const [hora, setHora] = useState('');
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const [motivoDevolucion, setMotivoDevolucion] = useState('');
  const [errorForm2, setErrorForm2] = useState<string | null>(null);

  const alternarPanel = (siguiente: Panel) => setPanel((actual) => (actual === siguiente ? null : siguiente));

  const {
    data: motivos,
    isLoading: cargandoMotivos,
    error: errorMotivos,
  } = useQuery({
    queryKey: ['motivo-asignacion', paciente.idPaciente],
    queryFn: () => obtenerMotivoAsignacion(paciente.idPaciente),
    enabled: panel === 'motivo',
  });

  const confirmar = async () => {
    const fechaClave = desdeFechaCorta(fecha);
    const horaValida = validarHora(hora);
    if (!fechaClave) {
      setErrorForm('Ingresá la fecha como DD/MM/AAAA, por ejemplo 28/09/2026.');
      return;
    }
    if (fechaClave < aClave(new Date())) {
      setErrorForm('Elegí una fecha de hoy en adelante.');
      return;
    }
    if (!horaValida) {
      setErrorForm('Ingresá la hora como HH:MM, por ejemplo 14:30.');
      return;
    }
    setErrorForm(null);
    await onConfirmar(fechaClave, horaValida);
  };

  const devolver = async () => {
    if (motivoDevolucion.trim() === '') {
      setErrorForm2('Contale al equipo el motivo.');
      return;
    }
    setErrorForm2(null);
    await onDevolver(motivoDevolucion.trim());
  };

  return (
    <Tarjeta>
      <FilaNombre>
        <Nombre>{paciente.nombre}</Nombre>
        {esNueva && <Badge texto="Nuevo" variante="especialidad" />}
      </FilaNombre>
      {paciente.dni !== '' && <Dato>DNI {paciente.dni}</Dato>}
      {paciente.mail !== '' && <Dato>{paciente.mail}</Dato>}
      {paciente.telefono !== '' && <Dato>{paciente.telefono}</Dato>}

      {esNueva && (
        <>
          <Acciones>
            <BotonAccion
              onPress={() => alternarPanel('motivo')}
              accessibilityRole="button"
              accessibilityLabel="Ver el motivo de la asignación"
            >
              <TextoAccion>Motivo de la asignación</TextoAccion>
            </BotonAccion>
            <BotonAccion
              onPress={() => alternarPanel('confirmar')}
              accessibilityRole="button"
              accessibilityLabel="Confirmar paciente"
            >
              <Ionicons name="checkmark-circle-outline" size={theme.iconos.md} color={theme.colores.azulPrimario} />
              <TextoAccion>Confirmar</TextoAccion>
            </BotonAccion>
            <BotonAccion
              onPress={() => alternarPanel('devolver')}
              accessibilityRole="button"
              accessibilityLabel="Devolver paciente a admisión"
            >
              <Ionicons name="arrow-undo-outline" size={theme.iconos.md} color={theme.colores.error} />
              <TextoAccion $peligro>Devolver a admisión</TextoAccion>
            </BotonAccion>
          </Acciones>

          {panel === 'motivo' && (
            <Panel>
              {cargandoMotivos && (
                <ActivityIndicator size="small" color={theme.colores.azulPrimario} />
              )}
              {!cargandoMotivos && errorMotivos && (
                <MensajeVacio>No pudimos cargar el motivo de la asignación.</MensajeVacio>
              )}
              {!cargandoMotivos && !errorMotivos && (motivos ?? []).length === 0 && (
                <MensajeVacio>El equipo de admisión no dejó una evolución para este paciente.</MensajeVacio>
              )}
              {!cargandoMotivos &&
                !errorMotivos &&
                (motivos ?? []).map((m, indice) => (
                  <Evolucion key={indice}>
                    <FechaEvolucion>{formatearFechaLarga(m.fecha.slice(0, 10))}</FechaEvolucion>
                    {m.observaciones && <TextoEvolucion>{m.observaciones}</TextoEvolucion>}
                    {m.planTratamiento && <PlanEvolucion>{m.planTratamiento}</PlanEvolucion>}
                  </Evolucion>
                ))}
            </Panel>
          )}

          {panel === 'confirmar' && (
            <Panel>
              <Ayuda>
                Elegí una fecha estimativa. Al paciente le llega como turno pendiente y puede
                confirmarlo o reprogramarlo según tu agenda.
              </Ayuda>
              <FilaFechaHora>
                <Columna>
                  <CampoTexto
                    etiqueta="Fecha"
                    value={fecha}
                    onChangeText={setFecha}
                    placeholder="DD/MM/AAAA"
                    keyboardType="numbers-and-punctuation"
                    maxLength={10}
                  />
                </Columna>
                <Columna>
                  <CampoTexto
                    etiqueta="Hora"
                    value={hora}
                    onChangeText={setHora}
                    placeholder="HH:MM"
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                  />
                </Columna>
              </FilaFechaHora>
              {(errorForm || errorConfirmar) && <MensajeError>{errorForm ?? errorConfirmar}</MensajeError>}
              <BotonPrimario texto="Enviar propuesta" onPress={confirmar} cargando={confirmando} />
            </Panel>
          )}

          {panel === 'devolver' && (
            <Panel>
              <CampoTexto
                etiqueta="Por qué no vas a atender a este paciente"
                value={motivoDevolucion}
                onChangeText={setMotivoDevolucion}
                placeholder="Escribí acá..."
                multiline
                textAlignVertical="top"
                style={{ minHeight: 80 }}
                maxLength={500}
              />
              {(errorForm2 || errorDevolver) && <MensajeError>{errorForm2 ?? errorDevolver}</MensajeError>}
              <BotonPrimario texto="Devolver a admisión" onPress={devolver} cargando={devolviendo} />
            </Panel>
          )}
        </>
      )}

      {!esNueva && (
        <Acciones>
          <BotonAccion
            onPress={() =>
              router.push({
                pathname: '/historia-clinica/[id]',
                params: { id: paciente.idPaciente },
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Ver historia clínica"
          >
            <TextoAccion>Historia clínica</TextoAccion>
          </BotonAccion>
        </Acciones>
      )}
    </Tarjeta>
  );
}
