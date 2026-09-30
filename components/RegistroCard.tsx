import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { CAMPOS_AUTORREGISTRO } from '../data/autorregistro';
import { RegistroAnimo } from '../types';
import { formatearFechaLarga } from '../utils/fechas';

// Tarjeta de una entrada del autorregistro. Cerrada muestra cuándo fue y el
// acontecimiento en pocas líneas, para recorrer la lista rápido; al tocarla
// se despliegan todas las columnas de la planilla.
interface RegistroCardProps {
  registro: RegistroAnimo;
}

const Tarjeta = styled.TouchableOpacity`
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

const Encabezado = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Fecha = styled.Text`
  flex: 1;
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
  margin-left: ${theme.espaciado.xs}px;
`;

const Resumen = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.sm}px;
`;

const Seccion = styled.View`
  margin-top: ${theme.espaciado.lg}px;
`;

const TituloSeccion = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${theme.espaciado.xs}px;
`;

const TextoTitulo = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.bold};
  letter-spacing: ${theme.espaciadoLetra.normal}px;
  color: ${theme.colores.violetaOscuro};
  margin-left: ${theme.espaciado.xs}px;
`;

const Texto = styled.Text<{ $vacio: boolean }>`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${({ $vacio }) =>
    $vacio ? theme.colores.textoSecundario : theme.colores.textoPrincipal};
  font-style: ${({ $vacio }) => ($vacio ? 'italic' : 'normal')};
`;

export default function RegistroCard({ registro }: RegistroCardProps) {
  const [abierto, setAbierto] = useState(false);
  const cuando = `${formatearFechaLarga(registro.fecha)}, ${registro.hora} h`;

  return (
    <Tarjeta
      activeOpacity={0.8}
      onPress={() => setAbierto(!abierto)}
      accessibilityRole="button"
      accessibilityState={{ expanded: abierto }}
      accessibilityLabel={`Registro del ${cuando}. ${abierto ? 'Tocá para cerrarlo' : 'Tocá para verlo completo'}`}
    >
      <Encabezado>
        <Ionicons
          name="calendar-outline"
          size={theme.iconos.md}
          color={theme.colores.azulPrimario}
        />
        <Fecha>{cuando}</Fecha>
        <Ionicons
          name={abierto ? 'chevron-up' : 'chevron-down'}
          size={theme.iconos.md}
          color={theme.colores.textoSecundario}
        />
      </Encabezado>

      {abierto ? (
        CAMPOS_AUTORREGISTRO.map(({ campo, titulo, icono }) => {
          const texto = registro[campo].trim();
          return (
            <Seccion key={campo}>
              <TituloSeccion>
                <Ionicons
                  name={icono}
                  size={theme.iconos.md}
                  color={theme.colores.violetaOscuro}
                />
                <TextoTitulo>{titulo.toUpperCase()}</TextoTitulo>
              </TituloSeccion>
              <Texto $vacio={texto === ''}>
                {texto === '' ? 'Sin completar' : texto}
              </Texto>
            </Seccion>
          );
        })
      ) : (
        <Resumen numberOfLines={2}>{registro.acontecimiento}</Resumen>
      )}
    </Tarjeta>
  );
}
