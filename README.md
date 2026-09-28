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

- Agustín Herrera - 31260
- Santiago Mantovani - (legajo pendiente)
- Jorge Torcigliani - 31619
- Mariana Gallo - 30919
- Alejandra Armas - 30990

## Stack

- React Native con Expo
- Expo Router (ruteo por archivos)
- TypeScript
- Styled Components (`styled-components/native`)
- TanStack Query (`@tanstack/react-query`) — pedidos de datos y caché
- Zustand — estado global de los filtros del listado y de la sesión
- `@expo/vector-icons` — íconos
- `expo-linear-gradient` — degradado del encabezado

## Features

| # | Feature | Estado |
|---|---------|--------|
| 0 | Inicio de sesión, recupero de contraseña y menú principal | En desarrollo — login simulado (acepta cualquier usuario) |
| 1 | Consultar profesionales disponibles | En desarrollo — listado con FlatList y pantalla de detalle |
| 2 | Buscar y filtrar profesionales por especialidad | En desarrollo — buscador por texto y chips de especialidad |
| 3 | Solicitar un turno | En desarrollo — calendario y agenda por hora, por especialidad o por profesional (reservas simuladas) |
| 4 | Consultar mis turnos | En desarrollo — listado de los turnos reservados, del más cercano al más lejano (reservas simuladas) |
| 5 | Cancelar un turno | Pendiente — ya figura en el menú como "Próximamente" |
| 6 | Registrar mi estado de ánimo diario | Pendiente |

La app arranca en el **inicio de sesión**: usuario, contraseña (con botón
para mostrarla) y el enlace "Olvidé mi contraseña", que lleva a la pantalla
de **recupero por correo**. Por ahora cualquier usuario y contraseña son
válidos; la validación real se hará contra la API. Una vez adentro se ve el
**menú** con las cuatro opciones del paciente: la de especialidades y
profesionales lleva al listado de la Feature 2, la de solicitar turno a la
Feature 3 y la de mis turnos a la Feature 4; la de cancelar turno todavía está
deshabilitada.

La Feature 1 muestra el listado de profesionales con `FlatList` y, al tocar
una card, navega a una pantalla de detalle con todos sus datos.

La Feature 2 suma, arriba del listado, un buscador por nombre o especialidad
(no distingue mayúsculas ni tildes) y una fila de chips para filtrar por
especialidad. Si no hay coincidencias, se ofrece limpiar los filtros.

La Feature 3 permite pedir un turno con la misma búsqueda del listado
(texto y chips de especialidad). Con una especialidad elegida, un calendario
marca los días con turnos libres de todos sus profesionales; al tocar un
profesional, se ven solo los suyos, empezando por el próximo libre. Al elegir
un día se despliega la agenda en franjas de una hora, con los turnos libres
y ocupados de cada profesional. También se llega desde el detalle de un
profesional con el botón "Solicitar turno". Los turnos se arman a partir de
la agenda semanal de cada profesional ([data/agendas.ts](data/agendas.ts)) y
las reservas se guardan en memoria ([services/turnos.ts](services/turnos.ts)).

La Feature 4 lista, en una `FlatList`, los turnos que reservó el paciente y
que todavía no pasaron, ordenados del más cercano al más lejano. Cada turno se
muestra en una [TurnoCard](components/TurnoCard.tsx) con la fecha, la hora, el
profesional y los badges de especialidad y modalidad; los de hoy llevan un
badge "Hoy". Se actualiza deslizando hacia abajo (`RefreshControl`) y, si no
hay turnos, ofrece ir a solicitar uno. Al confirmar un turno en la Feature 3,
`AgendaTurnos` invalida la consulta `['mis-turnos']`, así que la lista nunca
muestra datos viejos; la confirmación también tiene un enlace "Ver mis
turnos". Como las reservas viven en memoria, al recargar la app la lista
arranca vacía.

Los datos siguen siendo estáticos (`data/`), pero ya se consumen a través de
una capa de servicios asíncrona ([services/profesionales.ts](services/profesionales.ts))
que simula la latencia de una API; todavía no hay backend. Ninguna feature
está terminada.

## Cómo levantar el proyecto

### Requisitos previos

- [Node.js](https://nodejs.org/) (LTS)
- [Expo Go](https://expo.dev/go) en el celular (Android o iOS), o un emulador
  configurado

### Instalación

```bash
git clone https://github.com/Herrera48/YoSoy-VersionMobile.git
cd YoSoy-VersionMobile
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

## Pantallas y navegación

```
app/
├── _layout.tsx            Stack raíz + QueryClientProvider
├── index.tsx              /                   Inicio de sesión
├── recuperar-clave.tsx    /recuperar-clave    Recupero de contraseña
└── (app)/                 Grupo privado: requiere sesión
    ├── _layout.tsx        Redirige al login si no hay sesión
    ├── menu.tsx           /menu               Menú principal
    ├── profesionales.tsx  /profesionales      Listado con búsqueda y filtros
    ├── profesional/[id].tsx  /profesional/:id Detalle del profesional
    ├── solicitar-turno.tsx  /solicitar-turno  Calendario y agenda por hora
    └── mis-turnos.tsx     /mis-turnos         Turnos reservados del paciente
```

- **Login → menú con `router.replace`**: una vez adentro, "volver" no
  regresa al formulario de login.
- **El grupo `(app)` protege las pantallas privadas.** Su `_layout` lee la
  sesión del store de Zustand ([store/useSesionStore.ts](store/useSesionStore.ts))
  y, si no hay, devuelve `<Redirect href="/" />`. Cubre en un solo lugar la
  entrada por deep link, la recarga en web y el cierre de sesión.
- **La sesión vive en memoria**: al recargar la app hay que volver a iniciar
  sesión. Cuando exista la API se persistirá el token.
- **Autenticación simulada** en [services/auth.ts](services/auth.ts), con la
  misma firma async que tendrá con la API. Las pantallas ya manejan el error
  con `try/catch`, así que al conectar el backend no hay que tocarlas.
- **El recupero responde igual exista o no la cuenta**, para no revelar qué
  correos están registrados.
- **Los errores de formulario se muestran como texto** bajo los campos y no
  con `Alert.alert`, que en web no funciona.

## Contenidos aplicados por unidad

### Unidad I

| Contenido | Dónde |
|-----------|-------|
| `View` | `styled.View` en los 14 componentes de [components/](components/) y en las 7 pantallas |
| `Text` | `styled.Text` en los 14 componentes y en las 7 pantallas |
| `Image` | avatar del profesional en [ProfesionalCard.tsx](components/ProfesionalCard.tsx), [ProfesionalOpcion.tsx](components/ProfesionalOpcion.tsx) y el detalle; logo en [Header.tsx](components/Header.tsx) y en el login |
| `ScrollView` | envuelve el login, el recupero, el menú, el detalle y solicitar turno; en [FiltroEspecialidades.tsx](components/FiltroEspecialidades.tsx), horizontal para los chips. En el listado lo reemplazó `FlatList` (ver Unidad II) |
| Datos estáticos | [data/profesionales.ts](data/profesionales.ts) (8 profesionales) y [data/especialidades.ts](data/especialidades.ts) |
| Componentes reutilizables | [components/](components/) — 14 componentes: `AgendaTurnos`, `Badge`, `BotonPrimario`, `BuscadorProfesionales`, `Calendario`, `CampoTexto`, `Chip`, `FiltroEspecialidades`, `GrillaHorarios`, `Header`, `MenuOpcion`, `ProfesionalCard`, `ProfesionalOpcion` y `TurnoCard` |
| Props | interfaces de props explícitas en TypeScript en los 14 componentes; tipos de dominio en [types/index.ts](types/index.ts) |
| Styled Components | `styled-components/native` en todos los componentes y pantallas, con los valores de diseño centralizados en [constants/theme.ts](constants/theme.ts). No hay estilos inline ni colores sueltos |

**`ProfesionalCard` es un componente presentacional puro.** Recibe todos sus
datos por props y no importa nada de `data/`. Así el mismo componente sirve
para el listado de hoy, para un resultado de búsqueda filtrada (Feature 2) y
para datos que más adelante lleguen de una API, sin modificarlo.

**`TextInput`** entra con la Feature 2: es el buscador de
[BuscadorProfesionales.tsx](components/BuscadorProfesionales.tsx).

### Unidad II

| Contenido | Dónde |
|-----------|-------|
| `FlatList` | [profesionales.tsx](app/(app)/profesionales.tsx) — listado con `keyExtractor`, `ListHeaderComponent` (botón de volver, Header, buscador, chips de especialidad y título de sección) y `ListEmptyComponent` (carga, error, sin resultados). También en [mis-turnos.tsx](app/(app)/mis-turnos.tsx), con `RefreshControl` para actualizar deslizando hacia abajo |
| `TouchableOpacity` | [ProfesionalCard.tsx](components/ProfesionalCard.tsx) (toda la card es tocable) y botón de volver en el detalle |
| Expo Router — `Stack` | [_layout.tsx](app/_layout.tsx) — da la transición nativa y el gesto de volver |
| Ruta dinámica | [profesional/[id].tsx](app/(app)/profesional/[id].tsx) — lee el id con `useLocalSearchParams` y pide el profesional al servicio con `useQuery` (`['profesional', id]`). Si viene del listado, arranca con el dato que ya está en caché |
| `useRouter` | `router.push` al detalle desde el listado; `router.back()` para volver |
| Flexbox | `flex-direction`, `align-items`, `justify-content` y `align-self` en las cards y el detalle |
| `TextInput` | [BuscadorProfesionales.tsx](components/BuscadorProfesionales.tsx) — `value` + `onChangeText` sincronizados con el store |
| `ScrollView` horizontal | [FiltroEspecialidades.tsx](components/FiltroEspecialidades.tsx) — fila de chips con `horizontal` y sin indicador de scroll |
| `@expo/vector-icons` | `Ionicons` en 9 archivos: [menu.tsx](app/(app)/menu.tsx) (cerrar sesión) y [MenuOpcion.tsx](components/MenuOpcion.tsx) (ícono de cada opción y flecha); [index.tsx](app/index.tsx) (mostrar u ocultar la contraseña); [recuperar-clave.tsx](app/recuperar-clave.tsx) (confirmación de envío); [BuscadorProfesionales.tsx](components/BuscadorProfesionales.tsx) (lupa y borrar); [Calendario.tsx](components/Calendario.tsx) (flechas de mes); [ProfesionalOpcion.tsx](components/ProfesionalOpcion.tsx) (profesional elegido); [solicitar-turno.tsx](app/(app)/solicitar-turno.tsx) (turno confirmado); [TurnoCard.tsx](components/TurnoCard.tsx) (reloj de la hora) |
| `LinearGradient` | [Header.tsx](components/Header.tsx) — degradado azul → violeta con los colores del theme (`azulPrimario` y `violetaOscuro`), con texto en blanco. Lo usan el menú, el listado, solicitar turno y mis turnos |
| `ActivityIndicator` | carga del listado en [profesionales.tsx](app/(app)/profesionales.tsx) y de los chips de especialidad |
| TanStack Query — `useQuery` | `['profesionales', especialidad]` en [profesionales.tsx](app/(app)/profesionales.tsx) y `['especialidades']` en los chips. `QueryClientProvider` en [_layout.tsx](app/_layout.tsx) |
| Zustand — `create()` / `set()` | [store/useFiltrosStore.ts](store/useFiltrosStore.ts) — texto de búsqueda y especialidad elegida; [store/useSesionStore.ts](store/useSesionStore.ts) — usuario logueado |
| Grupos de rutas y `_layout` | [(app)/_layout.tsx](app/(app)/_layout.tsx) — agrupa las pantallas privadas |
| `router.replace` | login → menú, para que no se pueda volver al login |
| `Link` | "Olvidé mi contraseña" en el login |
| `TextInput` — `secureTextEntry`, `keyboardType` | contraseña en el login; `email-address` en el recupero |
| Componentes de formulario | [CampoTexto.tsx](components/CampoTexto.tsx) y [BotonPrimario.tsx](components/BotonPrimario.tsx), compartidos por login y recupero |

**El listado pasó de `.map()` a `FlatList`.** `FlatList` virtualiza: solo
renderiza las cards visibles. Por eso se quitó el `ScrollView` del listado:
anidar una `FlatList` dentro de un `ScrollView` anula el virtualizado.

**La navegación la decide la pantalla, no la card.** `ProfesionalCard` recibe
un `onPress` por props y el `router.push` vive en [profesionales.tsx](app/(app)/profesionales.tsx).
Así la card sigue sin saber nada de rutas.

**El botón de volver contempla que no haya historial.** Si se entra directo
al detalle por un deep link, no hay pantalla anterior; en ese caso vuelve al
listado con `router.replace('/profesionales')` en lugar de `router.back()`.

**La especialidad va en la `queryKey`, el texto no.** El filtro por
especialidad lo resuelve el "servidor" (el servicio), como lo haría un
`GET /profesionales?especialidad=...`: al cambiar la key TanStack vuelve a
pedir, y cada especialidad queda cacheada por separado, así que volver a una
ya consultada es instantáneo. La búsqueda por texto, en cambio, se filtra
localmente sobre lo que ya llegó: no justifica una petición por cada tecla.

**Zustand evita el prop drilling de los filtros.** El buscador y los chips
viven dentro del `ListHeaderComponent` de la `FlatList`, y la pantalla es la
que arma la consulta. Los tres leen el store directo, con suscripción
selectiva (`useFiltrosStore((state) => state.busqueda)`), sin pasarse props.

**El encabezado de la lista está definido fuera de la pantalla.** Si se
declarara adentro, cada letra tipeada crearía un componente nuevo, la
`FlatList` desmontaría el `TextInput` y el teclado se cerraría. Por el mismo
motivo, el spinner y los errores se muestran en el `ListEmptyComponent` y no
reemplazando a la lista.

### Pendiente de la Unidad II

- **`useInfiniteQuery`**: con 8 profesionales no hay paginación que hacer;
  entra cuando el listado venga de un backend.
