import { Stack } from 'expo-router';

// Stack en lugar de Slot: da la transición nativa entre pantallas y el gesto
// de volver. El encabezado nativo se oculta porque cada pantalla dibuja el suyo.
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
