import { Redirect, Stack } from 'expo-router';

import { useSesionStore } from '../../store/useSesionStore';

// Layout del grupo (app): agrupa las pantallas que requieren sesión (menú,
// profesionales, detalle y solicitar turno). Los paréntesis hacen que "app"
// no aparezca en la URL: las rutas siguen siendo /menu, /profesionales,
// /profesional/[id] y /solicitar-turno.
//
// Si no hay sesión, redirige al login. Así se cubre la entrada por deep link,
// la recarga en web y el cierre de sesión, sin repetir el chequeo en cada
// pantalla.
export default function AppLayout() {
  const usuario = useSesionStore((state) => state.usuario);

  if (!usuario) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
