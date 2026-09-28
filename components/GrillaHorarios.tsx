import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { Turno } from '../types';
import { dosDigitos } from '../utils/fechas';

// Agenda de un día dividida en franjas de una hora, como la vista diaria de
// un calendario: a la izquierda la hora y a la derecha los turnos de esa
// franja. Los libres se pueden tocar; los ocupados se ven pero no responden.
// Las franjas sin atención quedan vacías para que se note el paso de las horas.
interface GrillaHorariosProps {
  // Turnos (libres y ocupados) de un mismo día.
  turnos: Turno[];
  turnoElegido: Turno | null;
  onElegir: (turno: Turno) => void;
  // En la búsqueda por especialidad hay varios profesionales por franja y
  // hace falta mostrar el nombre; en la de un profesional, no.
  mostrarProfesional: boolean;
}

type EstadoTurno = 'libre' | 'elegido' | 'ocupado';

const COLORES_TURNO: Record<
  EstadoTurno,
  { fondo: string; borde: string; texto: string }
> = {
  libre: {
    fondo: theme.colores.card,
    borde: theme.colores.azulPrimario,
    texto: theme.colores.azulPrimario,
  },
  elegido: {
    fondo: theme.colores.azulPrimario,
    borde: theme.colores.azulPrimario,
    texto: theme.colores.textoSobrePrimario,
  },
  ocupado: {
    fondo: theme.colores.fondo,
    borde: theme.colores.borde,
    texto: theme.colores.textoSecundario,
  },
};

const Tarjeta = styled.View`
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.lg}px;
  border-width: 1px;
  border-color: ${theme.colores.borde};
  padding-horizontal: ${theme.espaciado.lg}px;
  shadow-color: ${theme.colores.sombra};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 2;
`;

const Franja = styled.View<{ $primera: boolean }>`
  flex-direction: row;
  min-height: 56px;
  padding-vertical: ${theme.espaciado.sm}px;
  border-top-width: ${({ $primera }) => ($primera ? '0px' : '1px')};
  border-top-color: ${theme.colores.borde};
`;

const ColumnaHora = styled.View`
  width: 56px;
  padding-top: ${theme.espaciado.sm}px;
`;

const Hora = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
`;

const HoraFin = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  color: ${theme.colores.textoSecundario};
`;

const ColumnaTurnos = styled.View`
  flex: 1;
  justify-content: center;
`;

const Bloque = styled.TouchableOpacity<{ $estado: EstadoTurno }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ $estado }) => COLORES_TURNO[$estado].fondo};
  border-width: 1px;
  border-color: ${({ $estado }) => COLORES_TURNO[$estado].borde};
  border-radius: ${theme.radios.sm}px;
  padding-vertical: ${theme.espaciado.sm}px;
  padding-horizontal: ${theme.espaciado.md}px;
  margin-vertical: 2px;
`;

const NombreBloque = styled.Text<{ $estado: EstadoTurno }>`
  flex: 1;
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.semi};
  color: ${({ $estado }) => COLORES_TURNO[$estado].texto};
  margin-right: ${theme.espaciado.sm}px;
`;

const EstadoBloque = styled.Text<{ $estado: EstadoTurno }>`
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.bold};
  color: ${({ $estado }) => COLORES_TURNO[$estado].texto};
`;

const SinAtencion = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.textoSecundario};
  opacity: ${theme.opacidades.deshabilitado};
`;

const TEXTO_ESTADO: Record<EstadoTurno, string> = {
  libre: 'Libre',
  elegido: 'Elegido',
  ocupado: 'Ocupado',
};

export default function GrillaHorarios({
  turnos,
  turnoElegido,
  onElegir,
  mostrarProfesional,
}: GrillaHorariosProps) {
  if (turnos.length === 0) {
    return null;
  }

  // Franjas desde el primer hasta el último turno del día, de hora en hora.
  const horasDeInicio = turnos.map((turno) => Number(turno.hora.slice(0, 2)));
  const primeraHora = Math.min(...horasDeInicio);
  const ultimaHora = Math.max(...horasDeInicio);
  const franjas: number[] = [];
  for (let h = primeraHora; h <= ultimaHora; h++) {
    franjas.push(h);
  }

  const estadoDe = (turno: Turno): EstadoTurno => {
    if (!turno.disponible) {
      return 'ocupado';
    }
    return turnoElegido?.id === turno.id ? 'elegido' : 'libre';
  };

  return (
    <Tarjeta>
      {franjas.map((h, i) => {
        const hora = `${dosDigitos(h)}:00`;
        const turnosDeLaFranja = turnos.filter((turno) => turno.hora === hora);

        return (
          <Franja key={hora} $primera={i === 0}>
            <ColumnaHora>
              <Hora>{hora}</Hora>
              <HoraFin>a {dosDigitos(h + 1)}:00</HoraFin>
            </ColumnaHora>

            <ColumnaTurnos>
              {turnosDeLaFranja.length === 0 ? (
                <SinAtencion>Sin atención</SinAtencion>
              ) : (
                turnosDeLaFranja.map((turno) => {
                  const estado = estadoDe(turno);
                  const nombre = `${turno.profesional.nombre} ${turno.profesional.apellido}`;
                  return (
                    <Bloque
                      key={turno.id}
                      $estado={estado}
                      disabled={estado === 'ocupado'}
                      activeOpacity={0.7}
                      onPress={() => onElegir(turno)}
                      accessibilityRole="button"
                      accessibilityState={{
                        selected: estado === 'elegido',
                        disabled: estado === 'ocupado',
                      }}
                      accessibilityLabel={`${hora}, ${nombre}, ${TEXTO_ESTADO[estado]}`}
                    >
                      <NombreBloque $estado={estado} numberOfLines={1}>
                        {mostrarProfesional
                          ? `${nombre} · ${turno.profesional.modalidad}`
                          : `Turno ${turno.profesional.modalidad.toLowerCase()}`}
                      </NombreBloque>
                      <EstadoBloque $estado={estado}>
                        {TEXTO_ESTADO[estado]}
                      </EstadoBloque>
                    </Bloque>
                  );
                })
              )}
            </ColumnaTurnos>
          </Franja>
        );
      })}
    </Tarjeta>
  );
}
