import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';

// Un único QueryClient para toda la app: es el que guarda el caché de
// TanStack Query. Se crea fuera del componente para que no se pierda en cada
// render del layout.
const queryClient = new QueryClient();

// Stack en lugar de Slot: da la transición nativa entre pantallas y el gesto
// de volver. El encabezado nativo se oculta porque cada pantalla dibuja el suyo.
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
