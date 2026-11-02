import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const RESORTE = { damping: 15, stiffness: 300 };

export function useEscalaPresion(escalaPresionada = 0.97) {
  const escala = useSharedValue(1);

  const estiloEscala = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));

  const alPresionar = () => {
    escala.value = withSpring(escalaPresionada, RESORTE);
  };

  const alSoltar = () => {
    escala.value = withSpring(1, RESORTE);
  };

  return { estiloEscala, alPresionar, alSoltar };
}
