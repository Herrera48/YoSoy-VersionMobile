import { NombreIcono } from '../components/MenuOpcion';
import { CampoRegistroAnimo } from '../types';

// Las columnas de la planilla de autorregistro, en el mismo orden. Las usan
// el formulario (etiqueta y preguntas guía de cada campo) y la tarjeta de
// cada registro (títulos de cada sección). Agregar o cambiar una pregunta es
// cambiar esta lista, no el JSX.
interface CampoAutorregistro {
  campo: CampoRegistroAnimo;
  titulo: string;
  ayuda: string;
  icono: NombreIcono;
}

export const CAMPOS_AUTORREGISTRO: CampoAutorregistro[] = [
  {
    campo: 'acontecimiento',
    titulo: 'Acontecimiento estresante',
    ayuda: '¿Qué sucedió, con quiénes estabas, en qué lugar?',
    icono: 'alert-circle-outline',
  },
  {
    campo: 'pensamientos',
    titulo: 'Pensamientos',
    ayuda:
      '¿Cuál fue tu primer pensamiento ante la situación? ¿Qué otras ideas tuviste? ¿Qué pensaste sobre vos en relación con lo que pasó?',
    icono: 'bulb-outline',
  },
  {
    campo: 'emociones',
    titulo: 'Emociones y reacciones físicas',
    ayuda: '¿Cómo te sentiste? ¿Cuáles fueron tus reacciones físicas?',
    icono: 'heart-outline',
  },
  {
    campo: 'conducta',
    titulo: 'Conducta',
    ayuda:
      '¿Cuál fue tu reacción? ¿Qué hiciste, qué dijiste, a quién o adónde fuiste, de qué modo?',
    icono: 'walk-outline',
  },
  {
    campo: 'consecuencias',
    titulo: 'Consecuencias',
    ayuda:
      '¿Qué sucedió después de que actuaras así? ¿Cómo reaccionaron los demás? ¿Cómo te sentiste?',
    icono: 'git-branch-outline',
  },
];
