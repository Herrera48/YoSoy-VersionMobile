import { Ionicons } from '@expo/vector-icons';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import {
  aClave,
  INICIALES_SEMANA,
  NOMBRES_MESES,
  sumarMeses,
} from '../utils/fechas';

// Calendario mensual armado con View y TouchableOpacity, sin librerías
// externas. Es presentacional: el mes visible y el día elegido los maneja la
// pantalla, que los recibe de vuelta por onCambiarMes y onSeleccionarDia.
// Solo se pueden tocar los días que tienen turnos libres.
interface CalendarioProps {
  // Primer día del mes que se muestra.
  mes: Date;
  // Fechas (AAAA-MM-DD) que tienen al menos un turno libre.
  diasConTurnos: string[];
  diaSeleccionado: string | null;
  onSeleccionarDia: (fecha: string) => void;
  onCambiarMes: (mes: Date) => void;
  // Rango de meses navegable con las flechas.
  mesMinimo: Date;
  mesMaximo: Date;
}

type EstadoDia = 'seleccionado' | 'conTurnos' | 'sinTurnos';

const COLORES_DIA: Record<EstadoDia, { fondo: string; texto: string }> = {
  seleccionado: {
    fondo: theme.colores.azulPrimario,
    texto: theme.colores.textoSobrePrimario,
  },
  conTurnos: {
    fondo: theme.colores.fondoBadgeEspecialidad,
    texto: theme.colores.azulPrimario,
  },
  sinTurnos: {
    fondo: 'transparent',
    texto: theme.colores.textoSecundario,
  },
};

const Tarjeta = styled.View`
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.lg}px;
  border-width: 1px;
  border-color: ${theme.colores.borde};
  padding: ${theme.espaciado.lg}px;
  shadow-color: ${theme.colores.sombra};
  shadow-offset: 0px 2px;
  shadow-opacity: 0.08;
  shadow-radius: 8px;
  elevation: 2;
`;

const Cabecera = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.espaciado.md}px;
`;

const BotonMes = styled.TouchableOpacity<{ $habilitado: boolean }>`
  padding: ${theme.espaciado.xs}px;
  opacity: ${({ $habilitado }) =>
    $habilitado ? 1 : theme.opacidades.deshabilitado};
`;

const TituloMes = styled.Text`
  font-size: ${theme.fuentes.lg}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
`;

// Siete columnas: cada celda ocupa 1/7 del ancho y flex-wrap baja a la
// siguiente semana.
const Grilla = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const Celda = styled.View`
  width: 14.28%;
  align-items: center;
  padding-vertical: 3px;
`;

const InicialDia = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoSecundario};
`;

const Dia = styled.TouchableOpacity<{ $estado: EstadoDia; $esHoy: boolean }>`
  width: 38px;
  height: 38px;
  border-radius: 19px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $estado }) => COLORES_DIA[$estado].fondo};
  border-width: ${({ $esHoy }) => ($esHoy ? '1px' : '0px')};
  border-color: ${theme.colores.violetaPrimario};
`;

const NumeroDia = styled.Text<{ $estado: EstadoDia }>`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${({ $estado }) =>
    $estado === 'sinTurnos' ? theme.pesos.regular : theme.pesos.bold};
  color: ${({ $estado }) => COLORES_DIA[$estado].texto};
  opacity: ${({ $estado }) =>
    $estado === 'sinTurnos' ? theme.opacidades.deshabilitado : 1};
`;

const Referencias = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: ${theme.espaciado.md}px;
`;

const MuestraColor = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${theme.colores.fondoBadgeEspecialidad};
  border-width: 1px;
  border-color: ${theme.colores.azulPrimario};
  margin-right: ${theme.espaciado.xs}px;
`;

const TextoReferencia = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  color: ${theme.colores.textoSecundario};
`;

export default function Calendario({
  mes,
  diasConTurnos,
  diaSeleccionado,
  onSeleccionarDia,
  onCambiarMes,
  mesMinimo,
  mesMaximo,
}: CalendarioProps) {
  const hoy = aClave(new Date());
  const anio = mes.getFullYear();
  const numeroMes = mes.getMonth();
  const cantidadDias = new Date(anio, numeroMes + 1, 0).getDate();

  // getDay() cuenta desde el domingo; la semana del calendario arranca el
  // lunes. Son las celdas vacías antes del día 1.
  const celdasVacias = (mes.getDay() + 6) % 7;

  const puedeRetroceder = mes > mesMinimo;
  const puedeAvanzar = mes < mesMaximo;

  const dias: (string | null)[] = [];
  for (let i = 0; i < celdasVacias; i++) {
    dias.push(null);
  }
  for (let d = 1; d <= cantidadDias; d++) {
    dias.push(aClave(new Date(anio, numeroMes, d)));
  }

  const estadoDe = (fecha: string): EstadoDia => {
    if (fecha === diaSeleccionado) {
      return 'seleccionado';
    }
    return diasConTurnos.includes(fecha) ? 'conTurnos' : 'sinTurnos';
  };

  return (
    <Tarjeta>
      <Cabecera>
        <BotonMes
          $habilitado={puedeRetroceder}
          disabled={!puedeRetroceder}
          onPress={() => onCambiarMes(sumarMeses(mes, -1))}
          accessibilityRole="button"
          accessibilityLabel="Mes anterior"
        >
          <Ionicons
            name="chevron-back"
            size={theme.iconos.lg}
            color={theme.colores.azulPrimario}
          />
        </BotonMes>

        <TituloMes>
          {NOMBRES_MESES[numeroMes].charAt(0).toUpperCase() +
            NOMBRES_MESES[numeroMes].slice(1)}{' '}
          {anio}
        </TituloMes>

        <BotonMes
          $habilitado={puedeAvanzar}
          disabled={!puedeAvanzar}
          onPress={() => onCambiarMes(sumarMeses(mes, 1))}
          accessibilityRole="button"
          accessibilityLabel="Mes siguiente"
        >
          <Ionicons
            name="chevron-forward"
            size={theme.iconos.lg}
            color={theme.colores.azulPrimario}
          />
        </BotonMes>
      </Cabecera>

      <Grilla>
        {INICIALES_SEMANA.map((inicial, i) => (
          <Celda key={`inicial-${i}`}>
            <InicialDia>{inicial}</InicialDia>
          </Celda>
        ))}

        {dias.map((fecha, i) => {
          if (!fecha) {
            return <Celda key={`vacia-${i}`} />;
          }
          const estado = estadoDe(fecha);
          return (
            <Celda key={fecha}>
              <Dia
                $estado={estado}
                $esHoy={fecha === hoy}
                disabled={estado === 'sinTurnos'}
                activeOpacity={0.7}
                onPress={() => onSeleccionarDia(fecha)}
                accessibilityRole="button"
                accessibilityState={{
                  selected: estado === 'seleccionado',
                  disabled: estado === 'sinTurnos',
                }}
                accessibilityLabel={`Día ${Number(fecha.slice(8))}${
                  estado === 'sinTurnos' ? ', sin turnos' : ', con turnos libres'
                }`}
              >
                <NumeroDia $estado={estado}>{Number(fecha.slice(8))}</NumeroDia>
              </Dia>
            </Celda>
          );
        })}
      </Grilla>

      <Referencias>
        <MuestraColor />
        <TextoReferencia>Días con turnos libres</TextoReferencia>
      </Referencias>
    </Tarjeta>
  );
}
