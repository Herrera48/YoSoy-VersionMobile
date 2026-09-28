import { useLocalSearchParams, useRouter } from 'expo-router';
import styled from 'styled-components/native';

import Badge from '../../../components/Badge';
import BotonPrimario from '../../../components/BotonPrimario';
import { theme } from '../../../constants/theme';
import { profesionales } from '../../../data/profesionales';

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

const Perfil = styled.View`
  align-items: center;
`;

const Avatar = styled.Image`
  width: 96px;
  height: 96px;
  border-radius: 48px;
  background-color: ${theme.colores.fondoBadgeModalidad};
`;

const Nombre = styled.Text`
  font-size: ${theme.fuentes.xl}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
  text-align: center;
  margin-top: ${theme.espaciado.lg}px;
`;

const Matricula = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.xs}px;
`;

const Etiquetas = styled.View`
  flex-direction: row;
  justify-content: center;
  margin-top: ${theme.espaciado.lg}px;
`;

const Separador = styled.View`
  width: ${theme.espaciado.sm}px;
`;

const Divisor = styled.View`
  height: 1px;
  background-color: ${theme.colores.borde};
  margin-vertical: ${theme.espaciado.xl}px;
`;

const TituloSeccion = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.bold};
  letter-spacing: ${theme.espaciadoLetra.amplio}px;
  color: ${theme.colores.violetaOscuro};
  margin-bottom: ${theme.espaciado.sm}px;
`;

const Descripcion = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoSecundario};
`;

const AccionTurno = styled.View`
  margin-top: ${theme.espaciado.xl}px;
`;

const MensajeNoEncontrado = styled.Text`
  font-size: ${theme.fuentes.md}px;
  line-height: ${theme.interlineado.md}px;
  color: ${theme.colores.textoSecundario};
  text-align: center;
  margin-top: ${theme.espaciado.xxxl}px;
`;

export default function DetalleProfesional() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const profesional = profesionales.find((p) => p.id === id);

  // Si se entra directo por un deep link (yosoymobile://profesional/3) no hay
  // pantalla anterior en el historial, y router.back() no tendría a dónde ir.
  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profesionales');
    }
  };

  return (
    <Pantalla>
      <BotonVolver
        onPress={volver}
        accessibilityRole="button"
        accessibilityLabel="Volver al listado"
      >
        <TextoVolver>← Volver</TextoVolver>
      </BotonVolver>

      {profesional ? (
        <Tarjeta>
          <Perfil>
            <Avatar source={{ uri: profesional.avatar }} />
            <Nombre>
              {profesional.nombre} {profesional.apellido}
            </Nombre>
            <Matricula>{profesional.matricula}</Matricula>

            <Etiquetas>
              <Badge texto={profesional.especialidad} variante="especialidad" />
              <Separador />
              <Badge texto={profesional.modalidad} variante="modalidad" />
            </Etiquetas>
          </Perfil>

          <Divisor />

          <TituloSeccion>SOBRE EL PROFESIONAL</TituloSeccion>
          <Descripcion>{profesional.descripcion}</Descripcion>

          {/* La búsqueda de turno arranca ya filtrada por este profesional. */}
          <AccionTurno>
            <BotonPrimario
              texto="Solicitar turno"
              onPress={() =>
                router.push({
                  pathname: '/solicitar-turno',
                  params: { profesionalId: profesional.id },
                })
              }
            />
          </AccionTurno>
        </Tarjeta>
      ) : (
        <MensajeNoEncontrado>
          No encontramos a este profesional.
        </MensajeNoEncontrado>
      )}
    </Pantalla>
  );
}
