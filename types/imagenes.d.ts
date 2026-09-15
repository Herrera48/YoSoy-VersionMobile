// Permite importar imágenes locales como módulos tipados:
//   import logoYoSoy from '../assets/images/logo-yosoy.png';
//
// Metro resuelve estos imports en tiempo de bundle, pero TypeScript por sí solo
// no los conoce. Expo genera un `expo-env.d.ts` equivalente al arrancar, pero
// ese archivo está en .gitignore, así que la declaración vive acá para que
// `tsc --noEmit` funcione en cualquier máquina recién clonada.
declare module '*.png' {
  import type { ImageSourcePropType } from 'react-native';

  const contenido: ImageSourcePropType;
  export default contenido;
}
