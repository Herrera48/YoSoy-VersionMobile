import { useState } from 'react';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { Notificacion } from '../types';

// Tarjeta de una notificación. Cerrada muestra el título, la fecha y un
// punto azul si todavía no se leyó; al tocarla se despliega el mensaje
// completo y, si estaba sin leer, se marca como leída (Feature: Mi perfil y
// notificaciones del lado paciente).
interface NotificacionCardProps {
  notificacion: Notificacion;
  onAbrir: () => void;
}

const Tarjeta = styled.TouchableOpacity<{ $leida: boolean }>`
  background-color: ${theme.colores.card};
  border-radius: ${theme.radios.lg}px;
  border-width: 1px;
  border-color: ${({ $leida }) =>
    $leida ? theme.colores.borde : theme.colores.azulPrimario};
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
  align-items: flex-start;
`;

const Punto = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${theme.colores.azulPrimario};
  margin-top: 6px;
  margin-right: ${theme.espaciado.sm}px;
`;

const Textos = styled.View`
  flex: 1;
`;

const Titulo = styled.Text<{ $leida: boolean }>`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${({ $leida }) => ($leida ? theme.pesos.semi : theme.pesos.bold)};
  color: ${theme.colores.textoPrincipal};
`;

const Fecha = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  color: ${theme.colores.textoSecundario};
  margin-top: 2px;
`;

const Mensaje = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.sm}px;
`;

export default function NotificacionCard({ notificacion, onAbrir }: NotificacionCardProps) {
  const [abierto, setAbierto] = useState(false);

  const alPresionar = () => {
    if (!abierto && !notificacion.leida) {
      onAbrir();
    }
    setAbierto(!abierto);
  };

  return (
    <Tarjeta
      $leida={notificacion.leida}
      activeOpacity={0.8}
      onPress={alPresionar}
      accessibilityRole="button"
      accessibilityState={{ expanded: abierto }}
      accessibilityLabel={`${notificacion.titulo}, ${notificacion.fecha}${
        notificacion.leida ? '' : ', sin leer'
      }`}
    >
      <Encabezado>
        {!notificacion.leida && <Punto />}
        <Textos>
          <Titulo $leida={notificacion.leida}>{notificacion.titulo}</Titulo>
          <Fecha>{notificacion.fecha}</Fecha>
          {abierto && <Mensaje>{notificacion.mensaje}</Mensaje>}
        </Textos>
      </Encabezado>
    </Tarjeta>
  );
}
