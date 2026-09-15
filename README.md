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

- Nombre Apellido — legajo
- Nombre Apellido — legajo
- Nombre Apellido — legajo

## Stack

- React Native con Expo
- Expo Router (ruteo por archivos)
- TypeScript
- Styled Components (`styled-components/native`)

## Features

| # | Feature | Estado |
|---|---------|--------|
| 1 | Consultar profesionales disponibles | En desarrollo — vista estática |
| 2 | Buscar y filtrar profesionales por especialidad | Pendiente |
| 3 | Solicitar un turno | Pendiente |
| 4 | Consultar mis turnos | Pendiente |
| 5 | Cancelar un turno | Pendiente |
| 6 | Registrar mi estado de ánimo diario | Pendiente |

La Feature 1 muestra el listado completo de profesionales a partir de datos
estáticos definidos en `data/profesionales.ts`. Es una vista de solo lectura:
todavía no hay búsqueda, detalle del profesional ni conexión a un backend.
Ninguna feature está terminada.

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

## Unidad I

Contenidos de la unidad aplicados en el código, y dónde:

| Contenido | Dónde |
|-----------|-------|
| `View` | `styled.View` en [Badge.tsx](components/Badge.tsx), [Header.tsx](components/Header.tsx), [ProfesionalCard.tsx](components/ProfesionalCard.tsx) e [index.tsx](app/index.tsx) |
| `Text` | `styled.Text` en los tres componentes y en el título de sección de [index.tsx](app/index.tsx) |
| `Image` | avatar del profesional en [ProfesionalCard.tsx](components/ProfesionalCard.tsx) (`styled.Image` con `source={{ uri }}`) |
| `ScrollView` | [index.tsx](app/index.tsx) — envuelve todo el contenido de la pantalla, una sola vez |
| Datos estáticos | [data/profesionales.ts](data/profesionales.ts) (8 profesionales) y [data/especialidades.ts](data/especialidades.ts) |
| Componentes reutilizables | [components/](components/) — `ProfesionalCard`, `Badge` y `Header` |
| Props | interfaces de props explícitas en TypeScript en los tres componentes; tipos de dominio en [types/index.ts](types/index.ts) |
| Styled Components | `styled-components/native` en todos los componentes y en la pantalla. No quedan estilos inline |

### Decisiones de la unidad

**Listado con `.map()`.** El recorrido del arreglo de profesionales se hace
con `.map()` y `key={profesional.id}`, no con `FlatList`: las listas
optimizadas son contenido de la Unidad IV.

**`ProfesionalCard` es un componente presentacional puro.** Recibe todos sus
datos por props y no importa nada de `data/`. Así el mismo componente sirve
para el listado completo de hoy, para un resultado de búsqueda filtrada
(Feature 2) y para datos que en la Unidad V lleguen de una API, sin
modificarlo.

**Uso de Flexbox.** El layout usa tres propiedades flex básicas:
`flex-direction`, `align-items` y `flex`. En React Native todo `View` es un
contenedor flex por defecto, así que no existe layout posible sin ellas: son
parte del modelo de caja de la plataforma, no una técnica aparte. El dominio
de Flexbox —`justify-content`, `flex-wrap`, `gap` y alineaciones
compuestas— se trabaja en la Unidad II.

**Todavía no se usa `TextInput`.** Está habilitado en la Unidad I, pero la
pantalla actual es de solo lectura. Entra con la Feature 2 (búsqueda de
profesionales).

### Fuera de alcance en esta entrega

No se usan `FlatList`, `SectionList`, `SafeAreaView`, navegación entre
pantallas, `fetch`/Axios, manejo de estado global, persistencia local,
animaciones ni librerías de UI externas. Todo eso corresponde a unidades
posteriores.
