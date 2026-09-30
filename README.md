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
- Santiago Mantovani - 30937
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
| 0 | Inicio de sesión, recupero de contraseña y menú principal | Login simulado (acepta cualquier usuario) yy sa este para los turnos. incluye recuperacion de contraseña simulada |
| 1 | Consultar profesionales y especialidades disponibles | Listado con FlatList y pantalla de detalle|
| 2 | Buscar y filtrar profesionales por especialidad | Buscador por texto y chips de especialidad, modo yy por nombre de especialista |
| 3 | Solicitar un turno | Utiliza los mismos filtros de profesinales y especialidades — calendario y agenda por hora, por especialidad o por profesional (reservas simuladas) |
| 4 | Consultar mis turnos | Listado de los turnos reservados, del más cercano al más lejano, desde estos mismos se pueden cancelar o reprogramar (reservas simuladas) |
| 5 | Cancelar un turno o Reprogramarlo| Listo |
| 6 | Registrar mi estado de ánimo diario | Permite registrar por dia y horario el estado de animo del paciente atravez de preguntas ya definidas |

La app arranca en el **inicio de sesión**: usuario, contraseña (con botón
para mostrarla) y el enlace "Olvidé mi contraseña", que lleva a la pantalla
de **recupero por correo** Feature 0. Por ahora cualquier usuario y contraseña son
válidos; la validación real se hará contra la API. Una vez adentro se ve el
**menú** con las cuatro opciones del paciente: la de especialidades y
profesionales lleva al listado profesionales y especialidades Feature 1 y Faeatuure2, la de solicitar turno a la
Feature 3 y la de consultar mis turnos a la Feature 4 yya tiene integrada Feature 5.

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
