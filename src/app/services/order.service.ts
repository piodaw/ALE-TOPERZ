import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TicketsService } from './tickets.service';
import { SeatsService } from './seats.service';
import { ChoosenMovieService } from './choosen-movie.service';
import { UnavailableSeats } from '../models/Hall';
import { Ticket } from '../models/Ticket';
import { Seat, ChosenSeatsAndTickets } from '../models/Hall';
import { ChoosenMovieShowing } from '../models/Movie';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  unavailableSeats: UnavailableSeats[];

  rows: {[key: string]: { [key: number]: Seat }};
  listOfTickets: Ticket[];


  private order$$ = new BehaviorSubject<{}>(null);
  private tickets$$ = new BehaviorSubject<Ticket[]>([]);
  private rows$$ = new BehaviorSubject<{[key: string]: { [key: number]: Seat }}>({});
  private chosenShowing$$ = new BehaviorSubject<ChoosenMovieShowing>(null);

  get order$() {
    return this.order$$.asObservable();
  }

  get tickets$() {
    return this.tickets$$.asObservable();
  }

  get rows$() {
    return this.rows$$.asObservable();
  }

  get chosenShowing$() {
    return this.chosenShowing$$.asObservable();
  }

  constructor(
    private ticketsService: TicketsService,
    private seatsService: SeatsService,
    private choosenMovieService: ChoosenMovieService
  ) {
    this.choosenMovieService.chosenMovieShowing$.subscribe((chosenMovie) => {
      this.chosenShowing$$.next(chosenMovie);
    });

    this.chosenShowing$$
      .pipe(
        tap((chosenShowing) => {
          this.unavailableSeats = [
            ...chosenShowing.bookedSeats,
            ...chosenShowing.paidSeats,
          ]
          .map((unavailableSeat) => {
            return { column: unavailableSeat.column, row: unavailableSeat.row };
          });
          const hallId = chosenShowing.hallId;

          this.fetchOrderedSeats(hallId).subscribe((rows) =>
            this.rows$$.next(rows)
          );
          this.rows$$
            .pipe(
              tap((rows) => {
                this.rows = rows;
              })
            )
            .subscribe();
        })
      )
      .subscribe();

    this.ticketsService
      .getAllTickets()
      .subscribe((tickets) => this.tickets$$.next(tickets));
    this.tickets$$
      .pipe(
        tap((listOfTickets) => {
          this.listOfTickets = listOfTickets;
        })
      )
      .subscribe();
  }

  fetchOrderedSeats(hallId: number) {
    return this.seatsService.fetchSeats(hallId);
  }

  checkIfSeatIsAvailable(seat: Seat): boolean {
    return this.unavailableSeats.some(
      (el) => el.column === seat.column && el.row === seat.row
    );
  }

  clickChosenSeat(seat: Seat, chosenSeatsAndTickets: ChosenSeatsAndTickets[]) {
    const indexOfSeat = chosenSeatsAndTickets.findIndex(
      (el) => el.seat.column === seat.column && el.seat.row === seat.row
    );
    if (indexOfSeat === -1) {
      chosenSeatsAndTickets.push({
        seat: seat,
        ticket:  null,
      });
    } else {
      chosenSeatsAndTickets.splice(indexOfSeat, 1);
    }
  }

  checkIfSeatIsChosen(
    seat: Seat,
    chosenSeatsAndTickets: ChosenSeatsAndTickets[]
  ) {
    return chosenSeatsAndTickets.some((el) => el.seat === seat);
  }

  selectTicket(
    seat: ChosenSeatsAndTickets,
    chosenSeatsAndTickets: ChosenSeatsAndTickets[],
    ticket: Ticket
  ) {
    const foundSeat = chosenSeatsAndTickets.find((el) => {
      return el.seat === seat.seat;
    });
    foundSeat.ticket = ticket;
  }

  deleteChosenTicket(
    ticket: ChosenSeatsAndTickets,
    chosenSeatsAndTickets: ChosenSeatsAndTickets[]
  ) {
    const indexOfTicket = chosenSeatsAndTickets.indexOf(ticket);
    chosenSeatsAndTickets.splice(indexOfTicket, 1);
  }
}
