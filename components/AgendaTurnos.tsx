import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { obtenerAgendaDeTurnos, reservarTurno } from '../services/turnos';
import { useSesionStore } from '../store/useSesionStore';
import { BuscarTurnoPor, Turno } from '../types';
import {
  aClave,
  desdeClave,
  formatearFechaLarga,
  inicioDeMes,
} from '../utils/fechas';
import BotonPrimario from './BotonPrimario';
import Calendario from './Calendario';
import GrillaHorarios from './GrillaHorarios';

// Turnos de una especialidad o de un profesional: el próximo turno libre, el
// calendario con los días disponibles, la agenda hora por hora del día elegido
// y la confirmación.
//
// La pantalla lo monta con key={`${por}-${valor}`}: al cambiar de
// especialidad o de profesional se monta de nuevo y el día y el horario
// elegidos vuelven a cero solos.
interface AgendaTurnosProps {
  por: BuscarTurnoPor;
  valor: string;
  onTurnoReservado: (turno: Turno) => void;
}

const EstadoCarga = styled.View`
  align-items: center;
  margin-vertical: ${theme.espaciado.xxxl}px;
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

const Proximo = styled.TouchableOpacity`
  background-color: ${theme.colores.fondoBadgeEspecialidad};
  border-radius: ${theme.radios.md}px;
  padding: ${theme.espaciado.lg}px;
  margin-bottom: ${theme.espaciado.lg}px;
`;

const EtiquetaProximo = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.bold};
  letter-spacing: ${theme.espaciadoLetra.amplio}px;
  color: ${theme.colores.violetaOscuro};
`;

const FechaProximo = styled.Text`
  font-size: ${theme.fuentes.lg}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
  margin-top: ${theme.espaciado.xs}px;
`;

const DetalleProximo = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: 2px;
`;

const TituloSeccion = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.bold};
  letter-spacing: ${theme.espaciadoLetra.amplio}px;
  color: ${theme.colores.violetaOscuro};
  margin-top: ${theme.espaciado.xxl}px;
  margin-bottom: ${theme.espaciado.md}px;
`;

const Tarjeta = styled.View`
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.lg}px;
  border-width: 1px;
  border-color: ${theme.colores.borde};
  padding: ${theme.espaciado.lg}px;
  margin-bottom: ${theme.espaciado.md}px;
`;

const Resumen = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoPrincipal};
  margin-bottom: ${theme.espaciado.lg}px;
`;

const Destacado = styled.Text`
  font-weight: ${theme.pesos.bold};
`;

const MensajeError = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.error};
  margin-top: ${theme.espaciado.md}px;
`;

export default function AgendaTurnos({
  por,
  valor,
  onTurnoReservado,
}: AgendaTurnosProps) {
  const usuario = useSesionStore((state) => state.usuario);

  const [diaElegido, setDiaElegido] = useState<string | null>(null);
  const [mesElegido, setMesElegido] = useState<Date | null>(null);
  const [turnoElegido, setTurnoElegido] = useState<Turno | null>(null);
  const [reservando, setReservando] = useState(false);
  const [errorReserva, setErrorReserva] = useState<string | null>(null);

  // Cada especialidad y cada profesional tienen su propia entrada en el caché.
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['turnos', por, valor],
    queryFn: () => obtenerAgendaDeTurnos(por, valor),
  });

  const turnos = data ?? [];
  const libres = turnos.filter((turno) => turno.disponible);

  // Días con al menos un turno libre, sin repetir: los turnos ya vienen
  // ordenados por fecha.
  const diasConTurnos: string[] = [];
  libres.forEach((turno) => {
    if (!diasConTurnos.includes(turno.fecha)) {
      diasConTurnos.push(turno.fecha);
    }
  });

  if (isLoading) {
    return (
      <EstadoCarga>
        <ActivityIndicator size="large" color={theme.colores.azulPrimario} />
      </EstadoCarga>
    );
  }

  if (error) {
    return (
      <EstadoCarga>
        <Mensaje>No pudimos cargar los turnos.</Mensaje>
        <BotonAccion onPress={() => refetch()} accessibilityRole="button">
          <TextoAccion>Reintentar</TextoAccion>
        </BotonAccion>
      </EstadoCarga>
    );
  }

  if (libres.length === 0) {
    return (
      <EstadoCarga>
        <Mensaje>No hay turnos libres por el momento. Probá con otra opción.</Mensaje>
      </EstadoCarga>
    );
  }

  const proximo = libres[0];

  // Mientras el paciente no elija un día, se muestra el del próximo turno
  // libre. Si el día elegido se quedó sin turnos (otro lo reservó), también.
  const dia =
    diaElegido && diasConTurnos.includes(diaElegido) ? diaElegido : proximo.fecha;
  const mes = mesElegido ?? inicioDeMes(desdeClave(dia));
  // Del día elegido van también los ocupados: la grilla muestra la agenda
  // completa.
  const turnosDelDia = turnos.filter((turno) => turno.fecha === dia);

  const elegirDia = (fecha: string) => {
    setDiaElegido(fecha);
    setTurnoElegido(null);
    setErrorReserva(null);
  };

  // Al cambiar de mes se elige el primer día con turnos de ese mes, así
  // siempre hay horarios a la vista.
  const cambiarMes = (nuevoMes: Date) => {
    setMesElegido(nuevoMes);
    const prefijo = aClave(nuevoMes).slice(0, 7);
    const primero = diasConTurnos.find((fecha) => fecha.startsWith(prefijo));
    if (primero) {
      elegirDia(primero);
    }
  };

  const elegirProximo = () => {
    setDiaElegido(proximo.fecha);
    setMesElegido(null);
    setTurnoElegido(proximo);
    setErrorReserva(null);
  };

  const confirmar = async () => {
    if (!turnoElegido || !usuario) {
      return;
    }
    setErrorReserva(null);
    setReservando(true);
    try {
      await reservarTurno(turnoElegido.id, usuario);
      onTurnoReservado(turnoElegido);
    } catch (e) {
      setErrorReserva(
        e instanceof Error ? e.message : 'No pudimos reservar el turno.'
      );
      setTurnoElegido(null);
      refetch();
    } finally {
      setReservando(false);
    }
  };

  return (
    <>
      <Proximo
        activeOpacity={0.7}
        onPress={elegirProximo}
        accessibilityRole="button"
        accessibilityLabel="Elegir el próximo turno libre"
      >
        <EtiquetaProximo>PRÓXIMO TURNO LIBRE</EtiquetaProximo>
        <FechaProximo>
          {formatearFechaLarga(proximo.fecha)}, {proximo.hora} h
        </FechaProximo>
        <DetalleProximo>
          {proximo.profesional.nombre} {proximo.profesional.apellido} ·{' '}
          {proximo.profesional.modalidad} — tocá para elegirlo
        </DetalleProximo>
      </Proximo>

      <Calendario
        mes={mes}
        diasConTurnos={diasConTurnos}
        diaSeleccionado={dia}
        onSeleccionarDia={elegirDia}
        onCambiarMes={cambiarMes}
        mesMinimo={inicioDeMes(new Date())}
        mesMaximo={inicioDeMes(desdeClave(diasConTurnos[diasConTurnos.length - 1]))}
      />

      <TituloSeccion>
        {`AGENDA DEL ${formatearFechaLarga(dia).toUpperCase()}`}
      </TituloSeccion>

      <GrillaHorarios
        turnos={turnosDelDia}
        turnoElegido={turnoElegido}
        onElegir={(turno) => {
          setTurnoElegido(turno);
          setErrorReserva(null);
        }}
        mostrarProfesional={por === 'especialidad'}
      />

      {errorReserva && <MensajeError>{errorReserva}</MensajeError>}

      {turnoElegido && (
        <>
          <TituloSeccion>TU TURNO</TituloSeccion>
          <Tarjeta>
            <Resumen>
              <Destacado>{formatearFechaLarga(turnoElegido.fecha)}</Destacado>
              {' a las '}
              <Destacado>{turnoElegido.hora} h</Destacado>
              {'\n'}
              con {turnoElegido.profesional.nombre}{' '}
              {turnoElegido.profesional.apellido} (
              {turnoElegido.profesional.especialidad}),{' '}
              {turnoElegido.profesional.modalidad.toLowerCase()}.
            </Resumen>
            <BotonPrimario
              texto="Confirmar turno"
              onPress={confirmar}
              cargando={reservando}
            />
          </Tarjeta>
        </>
      )}
    </>
  );
}
