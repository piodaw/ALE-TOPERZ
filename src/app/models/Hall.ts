import { Ticket } from './Ticket';

export interface Hall {
  id: number;
  name: string;
  number: number;
  rows: number;
  columns: number;
}

export interface Seat {
  id: number;
  row: string;
  column: number;
  vip: boolean;
  hallId: number;
}

export interface ChosenSeatsAndTickets {
  seat: Seat;
  ticket: Ticket;
}

export interface UnavailableSeats {
  column: number;
  row: string;
}
