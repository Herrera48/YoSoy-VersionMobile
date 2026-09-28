import { LinearGradient } from 'expo-linear-gradient';
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

// Degradado azul → violeta, como en la web. Va de izquierda a derecha para
// que el logo, el título y el tagline, que arrancan a la izquierda, queden
// sobre el azul: ahí el texto blanco tiene más contraste que sobre el violeta.
const Contenedor = styled(LinearGradient).attrs({
  colors: [theme.colores.azulPrimario, theme.colores.violetaPrimario],
  start: { x: 0, y: 0 },
  end: { x: 1, y: 0 },
})`
  border-radius: ${theme.radios.lg}px;
  overflow: hidden;
  padding: ${theme.espaciado.xl}px;
  margin-bottom: ${theme.espaciado.xxl}px;
`;

// Logo y nombre van en fila, como en la cabecera de la web.
const Marca = styled.View`
  flex-direction: row;
  align-items: center;
`;

// El logo es azul (#235DA7, el de la marca web) y sobre el degradado se
// perdería. En lugar de recolorearlo, se apoya sobre un círculo blanco.
const FondoLogo = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${theme.colores.card};
  align-items: center;
  justify-content: center;
  margin-right: ${theme.espaciado.md}px;
`;

// 60px compensa el padding transparente del lienzo: el dibujo ocupa 327x301
// de un PNG de 500x500.
const Logo = styled.Image`
  width: 60px;
  height: 60px;
  resize-mode: contain;
`;

const Titulo = styled.Text`
  font-size: ${theme.fuentes.xxl}px;
  font-weight: ${theme.pesos.bold};
  color: ${theme.colores.textoSobrePrimario};
`;

// El elemento más característico de la marca: mayúsculas y mucho aire entre
// letras.
const Tagline = styled.Text`
  font-size: ${theme.fuentes.xs}px;
  font-weight: ${theme.pesos.bold};
  letter-spacing: ${theme.espaciadoLetra.amplio}px;
  color: ${theme.colores.textoSobrePrimario};
  margin-top: ${theme.espaciado.md}px;
`;

// Tercer nivel de jerarquía: se diferencia del tagline por tamaño y peso.
const Subtitulo = styled.Text`
  font-size: ${theme.fuentes.sm}px;
  line-height: ${theme.interlineado.sm}px;
  color: ${theme.colores.textoSobrePrimario};
  margin-top: ${theme.espaciado.sm}px;
`;

export default function Header({
  titulo,
  subtitulo,
  tagline = TAGLINE_YOSOY,
}: HeaderProps) {
  return (
    <Contenedor>
      <Marca>
        <FondoLogo>
          <Logo source={logoYoSoy} />
        </FondoLogo>
        <Titulo>{titulo}</Titulo>
      </Marca>

      <Tagline>{tagline}</Tagline>
      <Subtitulo>{subtitulo}</Subtitulo>
    </Contenedor>
  );
}
