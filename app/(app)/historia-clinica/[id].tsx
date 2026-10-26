import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components/native';

import Badge from '../../../components/Badge';
import Chip from '../../../components/Chip';
import { theme } from '../../../constants/theme';
import {
  EvolucionClinica,
  SesionClinica,
  obtenerEvolucionesClinicas,
  obtenerSesionesClinicas,
} from '../../../services/historiaClinica';
import { obtenerPerfil } from '../../../services/perfil';
import { aHora, formatearFechaLarga } from '../../../utils/fechas';

// Historia clínica (lado profesional), de solo lectura: tres pestañas, igual
// que el modal de la web (verHistoria en nuevo_dashboard.js). Acá no hay
// "Abrir sesión de video": es video, que la app no ofrece.

type Tab = 'datos' | 'evoluciones' | 'sesiones';

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

const Titulo = styled.Text`
  font-size: ${theme.fuentes.xl}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoPrincipal};
`;

const Subtitulo = styled.Text`
  font-size: ${theme.fuentes.md}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.xs}px;
  margin-bottom: ${theme.espaciado.xl}px;
`;

const FilaTabs = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: ${theme.espaciado.lg}px;
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

const Dato = styled.View`
  margin-bottom: ${theme.espaciado.lg}px;
`;

const EtiquetaDato = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.semi};
  letter-spacing: ${theme.espaciadoLetra.normal}px;
  color: ${theme.colores.textoSecundario};
  margin-bottom: ${theme.espaciado.xs}px;
`;

const ValorDato = styled.Text`
  font-size: ${theme.fuentes.md}px;
  color: ${theme.colores.textoPrincipal};
`;

const Evolucion = styled.View`
  margin-bottom: ${theme.espaciado.lg}px;
  padding-bottom: ${theme.espaciado.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colores.borde};
`;

const FilaFechaEvolucion = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${theme.espaciado.sm}px;
  margin-bottom: ${theme.espaciado.sm}px;
`;

const FechaEvolucion = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoPrincipal};
`;

const BloqueLabel = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoSecundario};
  margin-bottom: ${theme.espaciado.xs}px;
`;

const BloqueTexto = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.textoPrincipal};
  margin-bottom: ${theme.espaciado.md}px;
`;

const FilaEmociones = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${theme.espaciado.sm}px;
  margin-bottom: ${theme.espaciado.md}px;
`;

const ChipEmocion = styled.View`
  background-color: ${theme.colores.fondoBadgeModalidad};
  border-radius: ${theme.radios.md}px;
  padding-vertical: ${theme.espaciado.xs}px;
  padding-horizontal: ${theme.espaciado.md}px;
`;

const TextoEmocion = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.violetaPrimario};
`;

const EstadoVacio = styled.View`
  align-items: center;
  padding-vertical: ${theme.espaciado.xl}px;
`;

const MensajeVacio = styled.Text`
  font-size: ${theme.fuentes.md}px;
  color: ${theme.colores.textoSecundario};
  text-align: center;
`;

const EstadoCarga = styled.View`
  align-items: center;
  margin-top: ${theme.espaciado.xxxl}px;
`;

export default function HistoriaClinica() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const idPaciente = Number(id);
  const [tab, setTab] = useState<Tab>('datos');

  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/mis-pacientes');
    }
  };

  const {
    data: perfil,
    isLoading: cargandoPerfil,
    error: errorPerfil,
  } = useQuery({
    queryKey: ['historia-clinica-paciente', idPaciente],
    queryFn: () => obtenerPerfil(idPaciente),
  });

  const {
    data: evoluciones,
    isLoading: cargandoEvoluciones,
    error: errorEvoluciones,
  } = useQuery({
    queryKey: ['historia-clinica-evoluciones', idPaciente],
    queryFn: () => obtenerEvolucionesClinicas(idPaciente),
  });

  const {
    data: sesiones,
    isLoading: cargandoSesiones,
    error: errorSesiones,
  } = useQuery({
    queryKey: ['historia-clinica-sesiones', idPaciente],
    queryFn: () => obtenerSesionesClinicas(idPaciente),
  });

  return (
    <Pantalla>
      <BotonVolver onPress={volver} accessibilityRole="button" accessibilityLabel="Volver">
        <TextoVolver>← Volver</TextoVolver>
      </BotonVolver>

      <Titulo>Historia clínica</Titulo>
      <Subtitulo>{perfil?.nombre ?? '...'}</Subtitulo>

      <FilaTabs>
        <Chip texto="Datos del paciente" activo={tab === 'datos'} onPress={() => setTab('datos')} />
        <Chip
          texto={`Evoluciones${evoluciones ? ` (${evoluciones.length})` : ''}`}
          activo={tab === 'evoluciones'}
          onPress={() => setTab('evoluciones')}
        />
        <Chip
          texto={`Sesiones clínicas${sesiones ? ` (${sesiones.length})` : ''}`}
          activo={tab === 'sesiones'}
          onPress={() => setTab('sesiones')}
        />
      </FilaTabs>

      {tab === 'datos' && (
        <Tarjeta>
          {cargandoPerfil ? (
            <EstadoCarga>
              <ActivityIndicator size="large" color={theme.colores.azulPrimario} />
            </EstadoCarga>
          ) : errorPerfil || !perfil ? (
            <MensajeVacio>No pudimos cargar los datos del paciente.</MensajeVacio>
          ) : (
            <>
              <Dato>
                <EtiquetaDato>NOMBRE</EtiquetaDato>
                <ValorDato>{perfil.nombre}</ValorDato>
              </Dato>
              <Dato>
                <EtiquetaDato>DNI</EtiquetaDato>
                <ValorDato>{perfil.dni || '—'}</ValorDato>
              </Dato>
              <Dato>
                <EtiquetaDato>FECHA DE NACIMIENTO</EtiquetaDato>
                <ValorDato>
                  {perfil.fechaNacimiento ? formatearFechaLarga(perfil.fechaNacimiento) : '—'}
                </ValorDato>
              </Dato>
              <Dato>
                <EtiquetaDato>ESTADO</EtiquetaDato>
                <ValorDato>{perfil.estado || '—'}</ValorDato>
              </Dato>
              <Dato>
                <EtiquetaDato>MAIL</EtiquetaDato>
                <ValorDato>{perfil.mail || '—'}</ValorDato>
              </Dato>
              <Dato>
                <EtiquetaDato>TELÉFONO</EtiquetaDato>
                <ValorDato>{perfil.telefono || '—'}</ValorDato>
              </Dato>
              <Dato>
                <EtiquetaDato>DOMICILIO</EtiquetaDato>
                <ValorDato>{perfil.domicilio || '—'}</ValorDato>
              </Dato>
            </>
          )}
        </Tarjeta>
      )}

      {tab === 'evoluciones' && (
        <Tarjeta>
          {cargandoEvoluciones ? (
            <EstadoCarga>
              <ActivityIndicator size="large" color={theme.colores.azulPrimario} />
            </EstadoCarga>
          ) : errorEvoluciones ? (
            <MensajeVacio>No pudimos cargar las evoluciones.</MensajeVacio>
          ) : (evoluciones ?? []).length === 0 ? (
            <EstadoVacio>
              <MensajeVacio>Todavía no hay evoluciones registradas.</MensajeVacio>
            </EstadoVacio>
          ) : (
            (evoluciones ?? []).map((e, indice) => <ItemEvolucion key={indice} evolucion={e} />)
          )}
        </Tarjeta>
      )}

      {tab === 'sesiones' && (
        <Tarjeta>
          {cargandoSesiones ? (
            <EstadoCarga>
              <ActivityIndicator size="large" color={theme.colores.azulPrimario} />
            </EstadoCarga>
          ) : errorSesiones ? (
            <MensajeVacio>No pudimos cargar las sesiones clínicas.</MensajeVacio>
          ) : (sesiones ?? []).length === 0 ? (
            <EstadoVacio>
              <MensajeVacio>Todavía no hay sesiones clínicas registradas.</MensajeVacio>
            </EstadoVacio>
          ) : (
            (sesiones ?? []).map((s) => <ItemSesion key={s.idSesion} sesion={s} />)
          )}
        </Tarjeta>
      )}
    </Pantalla>
  );
}

function ItemEvolucion({ evolucion }: { evolucion: EvolucionClinica }) {
  const esAdmision = (evolucion.diagnostico ?? '').toLowerCase().includes('admis');
  return (
    <Evolucion>
      <FilaFechaEvolucion>
        <FechaEvolucion>{formatearFechaLarga(evolucion.fecha.slice(0, 10))}</FechaEvolucion>
        {esAdmision && <Badge texto="Admisión" variante="especialidad" />}
      </FilaFechaEvolucion>
      {evolucion.diagnostico && (
        <>
          <BloqueLabel>DIAGNÓSTICO</BloqueLabel>
          <BloqueTexto>{evolucion.diagnostico}</BloqueTexto>
        </>
      )}
      {evolucion.observaciones && (
        <>
          <BloqueLabel>OBSERVACIONES</BloqueLabel>
          <BloqueTexto>{evolucion.observaciones}</BloqueTexto>
        </>
      )}
      {evolucion.planTratamiento && (
        <>
          <BloqueLabel>{esAdmision ? 'DERIVACIÓN' : 'PLAN'}</BloqueLabel>
          <BloqueTexto>{evolucion.planTratamiento}</BloqueTexto>
        </>
      )}
    </Evolucion>
  );
}

function ItemSesion({ sesion }: { sesion: SesionClinica }) {
  const fecha = new Date(sesion.fechaHora);
  return (
    <Evolucion>
      <FilaFechaEvolucion>
        <FechaEvolucion>
          {formatearFechaLarga(sesion.fechaHora.slice(0, 10))} · {aHora(fecha)}
        </FechaEvolucion>
        {sesion.tipoCierre && <Badge texto={sesion.tipoCierre} variante="modalidad" />}
      </FilaFechaEvolucion>
      {sesion.emociones && (
        <>
          <BloqueLabel>PROMEDIO DE EMOCIONES</BloqueLabel>
          <FilaEmociones>
            {Object.entries(sesion.emociones).map(([emocion, valor]) => (
              <ChipEmocion key={emocion}>
                <TextoEmocion>
                  {emocion}: {valor}%
                </TextoEmocion>
              </ChipEmocion>
            ))}
          </FilaEmociones>
        </>
      )}
      {sesion.transcripcion && (
        <>
          <BloqueLabel>TRANSCRIPCIÓN</BloqueLabel>
          <BloqueTexto>{sesion.transcripcion}</BloqueTexto>
        </>
      )}
      {sesion.notasEvolucion && (
        <>
          <BloqueLabel>NOTAS DEL MÉDICO</BloqueLabel>
          <BloqueTexto>{sesion.notasEvolucion}</BloqueTexto>
        </>
      )}
    </Evolucion>
  );
}
