// Tokens de diseño de YoSoy, tomados de la identidad visual de la plataforma
// web. Es la única fuente de verdad de estilos: ningún componente debe llevar
// un color, espaciado, radio o tamaño de fuente escrito a mano.
//
// Se consume importando el objeto directamente en cada componente
// (`import { theme } from '../constants/theme'`). No usa ThemeProvider de
// styled-components a propósito: eso es contenido de la Unidad II.

export const theme = {
  colores: {
    // ── Marca ──────────────────────────────────────────────────────────
    azulPrimario: '#2563EB',
    violetaPrimario: '#6366F1',
    violetaOscuro: '#6D28D9',

    // ── Superficies ────────────────────────────────────────────────────
    fondo: '#EDE9FE',
    card: '#FFFFFF',

    // ── Texto ──────────────────────────────────────────────────────────
    textoPrincipal: '#1E1B4B',
    textoSecundario: '#6B7280',

    // ── Bordes y sombra ────────────────────────────────────────────────
    borde: '#E5E7EB',
    sombra: '#1E1B4B',

    // ── Fondos de badge ────────────────────────────────────────────────
    // Derivados de la marca: el azul y el violeta de la familia, aclarados,
    // para que las dos variantes se lean como pareja y no como dos grises.
    fondoBadgeEspecialidad: '#DBEAFE',
    fondoBadgeModalidad: '#EDE9FE',
  },

  // Escala de espaciado en px. Se usa como `${theme.espaciado.md}px`.
  espaciado: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Radios de esquina en px.
  radios: {
    sm: 8,
    md: 12,
    lg: 16,
    circulo: 999,
  },

  // Tamaños de fuente en px.
  fuentes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 30,
  },

  // Interlineados en px, alineados con los tamaños de fuente.
  interlineado: {
    sm: 19,
    md: 21,
  },

  // Pesos tipográficos. Van como string porque React Native espera
  // '400' | '600' | '700' y no un número.
  pesos: {
    regular: '400',
    semi: '600',
    bold: '700',
  },

  // Separación entre letras, en px. El tagline de la marca usa la amplia.
  espaciadoLetra: {
    normal: 0.5,
    amplio: 1.8,
  },
} as const;

export default theme;
