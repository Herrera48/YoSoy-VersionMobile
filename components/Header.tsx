import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import styled from 'styled-components/native';

import logoYoSoy from '../assets/images/logo-yosoy.png';
import { theme } from '../constants/theme';
import { USAR_DRIVER_NATIVO } from '../utils/animaciones';

// El tagline es parte fija de la identidad de YoSoy, por eso viaja como valor
// por defecto y no hay que repetirlo en cada pantalla que use el Header.
const TAGLINE_YOSOY = 'TELEMEDICINA EN SALUD MENTAL';

interface HeaderProps {
  titulo: string;
  subtitulo: string;
  tagline?: string;
}

// Degradado azul → violeta, como en la web, de izquierda a derecha. Termina en
// el violeta oscuro y no en el primario: el texto va en blanco y, con el
// violeta primario, el subtítulo quedaba apenas bajo el contraste mínimo
// (4.5) en el extremo derecho. Así supera 5 en todo el ancho.
const Contenedor = styled(LinearGradient).attrs({
  colors: [theme.colores.azulPrimario, theme.colores.violetaOscuro],
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
const FondoLogo = styled(Animated.View)`
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
  const entrada = useRef(new Animated.Value(0)).current;
  const escalaLogo = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entrada, {
        toValue: 1,
        duration: 450,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USAR_DRIVER_NATIVO,
      }),
      Animated.spring(escalaLogo, {
        toValue: 1,
        friction: 5,
        tension: 80,
        delay: 150,
        useNativeDriver: USAR_DRIVER_NATIVO,
      }),
    ]).start();
  }, [entrada, escalaLogo]);

  const desplazamiento = entrada.interpolate({
    inputRange: [0, 1],
    outputRange: [-16, 0],
  });

  return (
    <Animated.View
      style={{ opacity: entrada, transform: [{ translateY: desplazamiento }] }}
    >
      <Contenedor>
        <Marca>
          <FondoLogo style={{ transform: [{ scale: escalaLogo }] }}>
            <Logo source={logoYoSoy} />
          </FondoLogo>
          <Titulo>{titulo}</Titulo>
        </Marca>

        <Tagline>{tagline}</Tagline>
        <Subtitulo>{subtitulo}</Subtitulo>
      </Contenedor>
    </Animated.View>
  );
}
