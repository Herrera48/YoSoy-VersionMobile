import { useRouter } from 'expo-router';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { CasoProfesional } from '../services/casos';
import { formatearFechaLarga } from '../utils/fechas';
import Badge from './Badge';

// Tarjeta de un caso, para "Mis casos" (lado profesional). Solo lectura: los
// endpoints que cambian de estado un caso (reasignar, grupos, reglas) son de
// CRM/admisión, no del profesional (ver AutorizacionCasos.Resolver). El único
// link es a Historia clínica, igual que en Mis pacientes.
interface CasoCardProps {
  caso: CasoProfesional;
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
  border-top-width: 1px;
  border-top-color: ${theme.colores.borde};
  margin-top: ${theme.espaciado.md}px;
  padding-top: ${theme.espaciado.sm}px;
`;

const BotonAccion = styled.TouchableOpacity`
  padding-vertical: ${theme.espaciado.xs}px;
`;

const TextoAccion = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.azulPrimario};
`;

export default function CasoCard({ caso }: CasoCardProps) {
  const router = useRouter();
  const variante = caso.estado === 'Nuevo' || caso.estado === 'Derivado' ? 'especialidad' : 'modalidad';

  return (
    <Tarjeta>
      <FilaNombre>
        <Nombre>{caso.nombrePaciente}</Nombre>
        <Badge texto={caso.estado} variante={variante} />
      </FilaNombre>
      {caso.nombreGrupo && <Dato>Grupo {caso.nombreGrupo}</Dato>}
      <Dato>Origen: {caso.origen}</Dato>
      <Dato>Creado el {formatearFechaLarga(caso.fechaCreacion)}</Dato>

      <Acciones>
        <BotonAccion
          onPress={() =>
            router.push({
              pathname: '/historia-clinica/[id]',
              params: { id: caso.idPaciente },
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Ver historia clínica"
        >
          <TextoAccion>Historia clínica</TextoAccion>
        </BotonAccion>
      </Acciones>
    </Tarjeta>
  );
}
