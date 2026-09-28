import { Agenda } from '../types';

// Agenda semanal de cada profesional. A partir de estos datos el servicio de
// turnos arma los turnos de las próximas semanas (ver services/turnos.ts).
// Los turnos duran una hora y empiezan en punto.
export const agendas: Agenda[] = [
  { profesionalId: '1', dias: [1, 3, 5], horarios: ['09:00', '10:00', '11:00', '17:00', '18:00'] },
  { profesionalId: '2', dias: [2, 4], horarios: ['08:00', '09:00', '10:00', '11:00'] },
  { profesionalId: '3', dias: [1, 4], horarios: ['18:00', '19:00', '20:00'] },
  { profesionalId: '4', dias: [2, 3, 5], horarios: ['14:00', '15:00', '16:00'] },
  { profesionalId: '5', dias: [1, 2, 3], horarios: ['09:00', '10:00', '11:00', '12:00'] },
  { profesionalId: '6', dias: [3, 5], horarios: ['16:00', '17:00', '18:00', '19:00'] },
  { profesionalId: '7', dias: [4, 6], horarios: ['10:00', '11:00', '12:00'] },
  { profesionalId: '8', dias: [1, 5], horarios: ['15:00', '16:00', '17:00'] },
];
