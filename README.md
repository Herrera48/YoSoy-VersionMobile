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

## Backend

La app ya habla con la API real de **YoSoy** (login, recupero de clave,
registro de pacientes, profesionales, turnos, agenda, horarios, pacientes,
casos, historia clínica, notificaciones, perfil y consentimiento informado):
toda la capa en [services/](services/) pasa por
[services/api.ts](services/api.ts), que agrega el token de sesión y apunta a
la URL que definas en `EXPO_PUBLIC_API_URL` (archivo `.env`). La única
excepción es el **registro de estado de ánimo**
([services/autorregistro.ts](services/autorregistro.ts)), que todavía guarda
los datos en memoria porque esa parte del backend no existe aún.

## Roles

El login devuelve el rol de la cuenta y el menú muestra opciones distintas
según corresponda:

- **Paciente**: especialidades y profesionales, solicitar turno, mis turnos,
  registrar estado de ánimo, notificaciones, mi perfil, solicitar cambio de
  profesional y consentimiento informado de telemedicina.
- **Profesional**: mis pacientes, agenda, horarios, mis casos y mi perfil.

Las videollamadas (sesión de video, cita urgente) son **exclusivas de la web**
y no se construyen en la app por decisión de producto.

## Features

Numeración original de la materia (features 1 a 6) más lo que se agregó
después de cerrar esas seis:

| # | Feature | Estado |
|---|---------|--------|
| 0 | Inicio de sesión, recupero de contraseña y registro | Contra la API real: `POST /login`, `POST /recuperacion-password`, `POST /pacientes` |
| 1 | Consultar profesionales y especialidades disponibles | Listado con FlatList y pantalla de detalle |
| 2 | Buscar y filtrar profesionales por especialidad | Buscador por texto y chips de especialidad |
| 3 | Solicitar un turno | Calendario y agenda por hora, por especialidad o por profesional, contra la agenda real del profesional |
| 4 | Consultar mis turnos | Listado de los turnos reservados, del más cercano al más lejano |
| 5 | Cancelar un turno o reprogramarlo | Integrado en Mis turnos |
| 6 | Registrar mi estado de ánimo diario | Preguntas guiadas; todavía simulado en memoria (sin endpoint en el backend) |
| 7 | Notificaciones | Avisos de turnos y tratamiento, marcado como leída |
| 8 | Mi perfil (paciente) | Consulta y edición de datos personales |
| 9 | Solicitar cambio de profesional | Pide una derivación al equipo de admisión |
| 10 | Consentimiento informado de telemedicina | Firma requerida antes de confirmar un turno (RN-02) |
| 11 | Mis pacientes (profesional) | Pacientes asignados y nuevos por confirmar, con acceso a su historia clínica |
| 12 | Historia clínica (solo lectura) | Datos, evoluciones y sesiones clínicas de un paciente |
| 13 | Agenda (profesional) | Turnos propios por día, con opción de cancelar |
| 14 | Horarios (profesional) | Alta, baja y edición de la disponibilidad semanal |
| 15 | Mis casos (profesional) | Seguimiento de los casos abiertos |
| 16 | Mi perfil (profesional) | Consulta y edición de datos profesionales |

La app arranca en el **inicio de sesión**: usuario, contraseña (con botón
para mostrarla) y el enlace "Olvidé mi contraseña", que lleva a la pantalla
de **recupero por correo**. El rol que devuelve la API decide si después se
entra al menú de paciente o al de profesional.

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
profesional con el botón "Solicitar turno". La disponibilidad y los turnos ya
ocupados se consultan en vivo contra la API
([services/turnos.ts](services/turnos.ts)).

La Feature 4 lista, en una `FlatList`, los turnos que reservó el paciente y
que todavía no pasaron, ordenados del más cercano al más lejano. Cada turno se
muestra en una [TurnoCard](components/TurnoCard.tsx) con la fecha, la hora, el
profesional y los badges de especialidad y modalidad; los de hoy llevan un
badge "Hoy". Se actualiza deslizando hacia abajo (`RefreshControl`) y, si no
hay turnos, ofrece ir a solicitar uno. Al confirmar un turno en la Feature 3,
`AgendaTurnos` invalida la consulta `['mis-turnos']`, así que la lista nunca
muestra datos viejos; la confirmación también tiene un enlace "Ver mis
turnos". Si el backend rechaza la confirmación por no tener firmado el
consentimiento informado (RN-02), la tarjeta ofrece un enlace directo a esa
pantalla.

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
