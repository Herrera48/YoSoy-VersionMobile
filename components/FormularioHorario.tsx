import { useState } from 'react';
import styled from 'styled-components/native';

import { theme } from '../constants/theme';
import { DIAS_HORARIO, HorarioInput, HorarioProfesional } from '../services/horarios';
import { validarHora } from '../utils/fechas';
import BotonPrimario from './BotonPrimario';
import CampoTexto from './CampoTexto';
import Chip from './Chip';

// Formulario para crear o editar un horario de atención (Agenda). Lo usa la
// pantalla Horarios: como panel propio al agregar uno nuevo, o embebido en
// HorarioCard al editar uno existente — mismo componente en los dos casos
// para no duplicar la validación.
interface FormularioHorarioProps {
  valoresIniciales?: HorarioProfesional;
  onGuardar: (input: HorarioInput) => Promise<void>;
  onCancelar: () => void;
  guardando: boolean;
}

const Panel = styled.View`
  border-top-width: 1px;
  border-top-color: ${theme.colores.borde};
  margin-top: ${theme.espaciado.md}px;
  padding-top: ${theme.espaciado.md}px;
`;

const Etiqueta = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoPrincipal};
  margin-bottom: ${theme.espaciado.sm}px;
`;

const FilaChips = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-bottom: ${theme.espaciado.md}px;
`;

const FilaCampos = styled.View`
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

const BotonCancelar = styled.TouchableOpacity`
  align-items: center;
  padding-vertical: ${theme.espaciado.md}px;
`;

const TextoCancelar = styled.Text`
  font-size: ${theme.fuentes.md}px;
  font-weight: ${theme.pesos.semi};
  color: ${theme.colores.textoSecundario};
`;

export default function FormularioHorario({
  valoresIniciales,
  onGuardar,
  onCancelar,
  guardando,
}: FormularioHorarioProps) {
  const [dia, setDia] = useState(valoresIniciales?.dia ?? DIAS_HORARIO[0]);
  const [horaInicio, setHoraInicio] = useState(valoresIniciales?.horaInicio ?? '');
  const [horaFin, setHoraFin] = useState(valoresIniciales?.horaFin ?? '');
  const [intervalo, setIntervalo] = useState(String(valoresIniciales?.intervaloMinutos ?? 30));
  const [disponible, setDisponible] = useState(valoresIniciales?.disponible ?? true);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const guardar = async () => {
    const inicioValido = validarHora(horaInicio);
    const finValido = validarHora(horaFin);
    if (!inicioValido || !finValido) {
      setErrorForm('Ingresá las horas como HH:MM, por ejemplo 09:00.');
      return;
    }
    if (finValido <= inicioValido) {
      setErrorForm('La hora de fin tiene que ser después de la de inicio.');
      return;
    }
    const minutos = Number(intervalo);
    if (!Number.isInteger(minutos) || minutos <= 0) {
      setErrorForm('Ingresá un intervalo en minutos mayor a 0.');
      return;
    }
    setErrorForm(null);
    await onGuardar({ dia, horaInicio: inicioValido, horaFin: finValido, intervaloMinutos: minutos, disponible });
  };

  return (
    <Panel>
      <Etiqueta>Día</Etiqueta>
      <FilaChips>
        {DIAS_HORARIO.map((opcion) => (
          <Chip key={opcion} texto={opcion} activo={dia === opcion} onPress={() => setDia(opcion)} />
        ))}
      </FilaChips>

      <FilaCampos>
        <Columna>
          <CampoTexto
            etiqueta="Hora de inicio"
            value={horaInicio}
            onChangeText={setHoraInicio}
            placeholder="HH:MM"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </Columna>
        <Columna>
          <CampoTexto
            etiqueta="Hora de fin"
            value={horaFin}
            onChangeText={setHoraFin}
            placeholder="HH:MM"
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
        </Columna>
      </FilaCampos>

      <CampoTexto
        etiqueta="Duración de cada turno (minutos)"
        value={intervalo}
        onChangeText={setIntervalo}
        placeholder="30"
        keyboardType="number-pad"
        maxLength={3}
      />

      <Etiqueta>Disponible</Etiqueta>
      <FilaChips>
        <Chip texto="Sí" activo={disponible} onPress={() => setDisponible(true)} />
        <Chip texto="No" activo={!disponible} onPress={() => setDisponible(false)} />
      </FilaChips>

      {errorForm && <MensajeError>{errorForm}</MensajeError>}
      <BotonPrimario texto="Guardar horario" onPress={guardar} cargando={guardando} />
      <BotonCancelar onPress={onCancelar} accessibilityRole="button" accessibilityLabel="Cancelar">
        <TextoCancelar>Cancelar</TextoCancelar>
      </BotonCancelar>
    </Panel>
  );
}
