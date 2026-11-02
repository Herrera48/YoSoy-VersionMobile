import { ReactNode } from 'react';
import Animated, { FadeInDown, FadeOutLeft } from 'react-native-reanimated';

interface EntradaAnimadaProps {
  indice?: number;
  salida?: boolean;
  children: ReactNode;
}

const RETARDO_POR_ITEM = 60;
const MAX_ITEMS_CON_RETARDO = 8;

export default function EntradaAnimada({
  indice = 0,
  salida = false,
  children,
}: EntradaAnimadaProps) {
  const retardo = Math.min(indice, MAX_ITEMS_CON_RETARDO) * RETARDO_POR_ITEM;

  return (
    <Animated.View
      entering={FadeInDown.delay(retardo).springify().damping(18)}
      exiting={salida ? FadeOutLeft.duration(250) : undefined}
    >
      {children}
    </Animated.View>
  );
}
