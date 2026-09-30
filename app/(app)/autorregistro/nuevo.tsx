import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';
import styled from 'styled-components/native';

import BotonPrimario from '../../../components/BotonPrimario';
import CampoTexto from '../../../components/CampoTexto';
import Header from '../../../components/Header';
import { theme } from '../../../constants/theme';
import { CAMPOS_AUTORREGISTRO } from '../../../data/autorregistro';
import { guardarRegistro } from '../../../services/autorregistro';
import { useSesionStore } from '../../../store/useSesionStore';
import { CampoRegistroAnimo } from '../../../types';
import {
  aClave,
  aFechaCorta,
  aHora,
  desdeFechaCorta,
  validarHora,
} from '../../../utils/fechas';

// Nuevo registro del autorregistro (Feature 6). Un campo por cada columna de
// la planilla, con sus preguntas guía (data/autorregistro.ts). La fecha y la
// hora arrancan con el momento actual, pero se pueden cambiar: muchas veces
// se registra algo que pasó un rato antes.
//
// Solo el acontecimiento es obligatorio; el resto se completa en la medida de
// lo posible. Los errores se muestran como texto y no con Alert.alert, que en
// web no funciona.

const TEXTOS_VACIOS: Record<CampoRegistroAnimo, string> = {
  acontecimiento: '',
  pensamientos: '',
  emociones: '',
  conducta: '',
  consecuencias: '',
};

const Pantalla = styled.KeyboardAvoidingView.attrs({
  behavior: Platform.OS === 'ios' ? 'padding' : undefined,
})`
  flex: 1;
  background-color: ${theme.colores.fondo};
`;

const Contenido = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: theme.espaciado.xl,
    paddingTop: theme.espaciado.superiorPantalla,
    paddingBottom: theme.espaciado.xxxl,
  },
  keyboardShouldPersistTaps: 'handled',
})``;

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

export default function NuevoRegistro() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const usuario = useSesionStore((state) => state.usuario);

  // Se calcula una sola vez, al abrir el formulario.
  const [fecha, setFecha] = useState(() => aFechaCorta(new Date()));
  const [hora, setHora] = useState(() => aHora(new Date()));
  const [textos, setTextos] = useState(TEXTOS_VACIOS);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cambiarTexto = (campo: CampoRegistroAnimo, valor: string) => {
    setTextos({ ...textos, [campo]: valor });
  };

  // Sin historial (recarga en web o deep link) se vuelve a la lista.
  const volver = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/autorregistro');
    }
  };

  const guardar = async () => {
    const fechaClave = desdeFechaCorta(fecha);
    const horaValida = validarHora(hora);

    if (!fechaClave) {
      setError('Ingresá la fecha como DD/MM/AAAA, por ejemplo 28/09/2026.');
      return;
    }
    if (!horaValida) {
      setError('Ingresá la hora como HH:MM, por ejemplo 14:30.');
      return;
    }
    // Las claves (AAAA-MM-DD HH:MM) se comparan bien como texto.
    const ahora = new Date();
    if (`${fechaClave} ${horaValida}` > `${aClave(ahora)} ${aHora(ahora)}`) {
      setError('La fecha y la hora no pueden ser posteriores a este momento.');
      return;
    }
    if (textos.acontecimiento.trim() === '') {
      setError('Contá al menos qué sucedió.');
      return;
    }
    if (!usuario) {
      return;
    }

    setError(null);
    setGuardando(true);
    try {
      await guardarRegistro(usuario, {
        fecha: fechaClave,
        hora: horaValida,
        acontecimiento: textos.acontecimiento.trim(),
        pensamientos: textos.pensamientos.trim(),
        emociones: textos.emociones.trim(),
        conducta: textos.conducta.trim(),
        consecuencias: textos.consecuencias.trim(),
      });
      // La lista ya no está al día: al volver, TanStack la pide de nuevo.
      queryClient.invalidateQueries({ queryKey: ['autorregistros'] });
      volver();
    } catch {
      setError('No pudimos guardar el registro. Probá de nuevo.');
      setGuardando(false);
    }
  };

  return (
    <Pantalla>
      <Contenido>
        <BotonVolver
          onPress={volver}
          accessibilityRole="button"
          accessibilityLabel="Volver a mis registros"
        >
          <TextoVolver>← Mis registros</TextoVolver>
        </BotonVolver>

        <Header
          titulo="YoSoy"
          subtitulo="Tomate tu tiempo. Escribí con tus palabras; solo es obligatorio contar qué sucedió."
        />

        <Tarjeta>
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

          {CAMPOS_AUTORREGISTRO.map(({ campo, titulo, ayuda }) => (
            <CampoTexto
              key={campo}
              etiqueta={campo === 'acontecimiento' ? `${titulo} *` : titulo}
              ayuda={ayuda}
              value={textos[campo]}
              onChangeText={(valor) => cambiarTexto(campo, valor)}
              multiline
              textAlignVertical="top"
              style={{ minHeight: 96 }}
            />
          ))}

          {error && <MensajeError>{error}</MensajeError>}

          <BotonPrimario
            texto="Guardar registro"
            onPress={guardar}
            cargando={guardando}
          />
        </Tarjeta>
      </Contenido>
    </Pantalla>
  );
}
