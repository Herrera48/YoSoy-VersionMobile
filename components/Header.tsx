import styled from 'styled-components/native';

import logoYoSoy from '../assets/images/logo-yosoy.png';
import { theme } from '../constants/theme';

// El tagline es parte fija de la identidad de YoSoy, por eso viaja como valor
// por defecto y no hay que repetirlo en cada pantalla que use el Header.
const TAGLINE_YOSOY = 'TELEMEDICINA EN SALUD MENTAL';

interface HeaderProps {
  titulo: string;
  subtitulo: string;
  tagline?: string;
}

const Contenedor = styled.View`
  background-color: ${theme.colores.fondo};
  padding-bottom: ${theme.espaciado.xl}px;
  border-bottom-width: 1px;
  border-bottom-color: ${theme.colores.borde};
  margin-bottom: ${theme.espaciado.xxl}px;
`;

// Logo y nombre van en fila, como en la cabecera de la web.
const Marca = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Logo = styled.Image`
  width: 46px;
  height: 46px;
  margin-right: ${theme.espaciado.md}px;
  resize-mode: contain;
`;

const Titulo = styled.Text`
  font-size: ${theme.fuentes.xxl}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.azulPrimario};
`;

// El elemento más característico de la marca: mayúsculas, violeta oscuro y
// mucho aire entre letras.
const Tagline = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.bold};
  letter-spacing: ${theme.espaciadoLetra.amplio}px;
  color: ${theme.colores.violetaOscuro};
  margin-top: ${theme.espaciado.sm}px;
`;

// Tercer nivel de jerarquía: no compite con el tagline.
const Subtitulo = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.textoSecundario};
  margin-top: ${theme.espaciado.md}px;
`;

export default function Header({
  titulo,
  subtitulo,
  tagline = TAGLINE_YOSOY,
}: HeaderProps) {
  return (
    <Contenedor>
      <Marca>
        <Logo source={logoYoSoy} />
        <Titulo>{titulo}</Titulo>
      </Marca>

      <Tagline>{tagline}</Tagline>
      <Subtitulo>{subtitulo}</Subtitulo>
    </Contenedor>
  );
}
