# YoSoy Mobile

Aplicación móvil de **YoSoy**, una plataforma de telemedicina enfocada en
salud mental. Esta app está orientada al perfil **paciente**.

## Descripción y problemática

Pedir ayuda en salud mental ya cuesta bastante por sí solo; el circuito
administrativo que viene después suma una barrera que sobra. Encontrar un
profesional que atienda la especialidad que uno necesita, averiguar si trabaja
de forma virtual o presencial, conseguir un turno y después recordar cuándo
era implica normalmente llamados telefónicos, horarios de secretaría y
mensajes sueltos de WhatsApp. Esa fricción hace que muchas consultas se
posterguen o directamente no ocurran.

**YoSoy Mobile** concentra ese circuito en un solo lugar: consultar el listado
de profesionales con su especialidad y modalidad, filtrar por lo que uno
necesita, solicitar y cancelar turnos, y llevar un registro personal del
propio estado de ánimo para poder mirar la evolución en el tiempo y
compartirla con el profesional tratante.

Proyecto académico de la materia **Laboratorio de Programación II**, con
metodología ABP (Aprendizaje Basado en Proyectos): la aplicación se construye
de forma incremental, unidad por unidad, a lo largo de la cursada.

## Integrantes del grupo

- Agustín Herrera
- Santiago Mantovani
- Jorge Torcigliani - 31619
- Mariana Gallo - 30919

## Stack

- React Native con Expo
- Expo Router (ruteo por archivos)
- TypeScript
- Styled Components (`styled-components/native`)

## Features

| # | Feature | Estado |
|---|---------|--------|
| 1 | Consultar profesionales disponibles | En desarrollo — listado con FlatList y pantalla de detalle |
| 2 | Buscar y filtrar profesionales por especialidad | Pendiente |
| 3 | Solicitar un turno | Pendiente |
| 4 | Consultar mis turnos | Pendiente |
| 5 | Cancelar un turno | Pendiente |
| 6 | Registrar mi estado de ánimo diario | Pendiente |

La Feature 1 muestra el listado de profesionales con `FlatList` y, al tocar
una card, navega a una pantalla de detalle con todos sus datos. Los datos
siguen siendo estáticos (`data/profesionales.ts`): todavía no hay búsqueda ni
conexión a un backend. Ninguna feature está terminada.

## Cómo levantar el proyecto

### Requisitos previos

- [Node.js](https://nodejs.org/) (LTS)
- [Expo Go](https://expo.dev/go) en el celular (Android o iOS), o un emulador
  configurado

### Instalación

```bash
git clone https://github.com/Herrera48/YoSoy-Mobile.git
cd YoSoy-Mobile
npm install
```

### Ejecución

```bash
npx expo start
```

Esto abre Expo Dev Tools. Desde ahí:

- Escanear el código QR con la app **Expo Go** en el celular
- `a` para abrir en un emulador de Android
- `i` para abrir en un simulador de iOS (requiere macOS)
- `w` para abrir la versión web

## Sobre el archivo `.npmrc`

El proyecto incluye un `.npmrc` con:

```
legacy-peer-deps=true
```

`styled-components` v6 declara `react-dom` entre sus *peer dependencies*,
porque el mismo paquete sirve para web y para React Native. Desde npm 7 los
peers se instalan de forma automática, así que sin esta opción npm agrega
`react-dom` al árbol de dependencias: un paquete exclusivo de web que en una
app de React Native no se usa nunca y solo pesa. También evita los conflictos
de `ERESOLVE` entre los peers opcionales de Expo (`react-native-worklets`).

`legacy-peer-deps=true` le devuelve a npm el comportamiento de la v6 —no
instalar peers automáticamente— y deja el árbol limpio.

## Contenidos aplicados por unidad

### Unidad I

| Contenido | Dónde |
|-----------|-------|
| `View` | `styled.View` en [Badge.tsx](components/Badge.tsx), [Header.tsx](components/Header.tsx), [ProfesionalCard.tsx](components/ProfesionalCard.tsx) y las pantallas |
| `Text` | `styled.Text` en los tres componentes y en las dos pantallas |
| `Image` | avatar del profesional en [ProfesionalCard.tsx](components/ProfesionalCard.tsx) y en el detalle; logo en [Header.tsx](components/Header.tsx) |
| `ScrollView` | [profesional/[id].tsx](app/profesional/[id].tsx) — envuelve el detalle. En el listado lo reemplazó `FlatList` (ver Unidad II) |
| Datos estáticos | [data/profesionales.ts](data/profesionales.ts) (8 profesionales) y [data/especialidades.ts](data/especialidades.ts) |
| Componentes reutilizables | [components/](components/) — `ProfesionalCard`, `Badge` y `Header` |
| Props | interfaces de props explícitas en TypeScript en los tres componentes; tipos de dominio en [types/index.ts](types/index.ts) |
| Styled Components | `styled-components/native` en todos los componentes y pantallas, con los valores de diseño centralizados en [constants/theme.ts](constants/theme.ts). No hay estilos inline ni colores sueltos |

**`ProfesionalCard` es un componente presentacional puro.** Recibe todos sus
datos por props y no importa nada de `data/`. Así el mismo componente sirve
para el listado de hoy, para un resultado de búsqueda filtrada (Feature 2) y
para datos que más adelante lleguen de una API, sin modificarlo.

**`TextInput` todavía no se usa.** La pantalla actual es de solo lectura.
Entra con la Feature 2 (búsqueda de profesionales).

### Unidad II

| Contenido | Dónde |
|-----------|-------|
| `FlatList` | [index.tsx](app/index.tsx) — listado con `keyExtractor`, `ListHeaderComponent` (Header y título de sección) y `ListEmptyComponent` |
| `TouchableOpacity` | [ProfesionalCard.tsx](components/ProfesionalCard.tsx) (toda la card es tocable) y botón de volver en el detalle |
| Expo Router — `Stack` | [_layout.tsx](app/_layout.tsx) — da la transición nativa y el gesto de volver |
| Ruta dinámica | [profesional/[id].tsx](app/profesional/[id].tsx) — lee el id con `useLocalSearchParams` y busca el profesional en `data/` |
| `useRouter` | `router.push` al detalle desde el listado; `router.back()` para volver |
| Flexbox | `flex-direction`, `align-items`, `justify-content` y `align-self` en las cards y el detalle |

**El listado pasó de `.map()` a `FlatList`.** `FlatList` virtualiza: solo
renderiza las cards visibles. Por eso se quitó el `ScrollView` del listado:
anidar una `FlatList` dentro de un `ScrollView` anula el virtualizado.

**La navegación la decide la pantalla, no la card.** `ProfesionalCard` recibe
un `onPress` por props y el `router.push` vive en [index.tsx](app/index.tsx).
Así la card sigue sin saber nada de rutas.

**El botón de volver contempla que no haya historial.** Si se entra directo
al detalle por un deep link, no hay pantalla anterior; en ese caso vuelve al
listado con `router.replace('/')` en lugar de `router.back()`.

### Pendiente de la Unidad II

- **Zustand** y **`LinearGradient`**: en curso.
- **TanStack Query** y **`ActivityIndicator`**: quedan para cuando la app se
  conecte a un backend. Con datos locales no hay carga asíncrona que manejar.
