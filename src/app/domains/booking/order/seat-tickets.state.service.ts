import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { SeatTicket, Seat } from '../hall/hall.interface';
import { Order } from './order.interface';
import { TicketType } from '../tickets';

@Injectable({
  providedIn: 'root',
})
export class SeatTicketsStateService {
  private http = inject(HttpClient);

  private seatTickets$$ = new BehaviorSubject<SeatTicket[]>([]);

  get seatTickets$() {
    return this.seatTickets$$.asObservable();
  }

  clickChosenSeat(seat: Seat, showingId: number, ticketType: TicketType) {
    const currentOrderItems = this.seatTickets$$.getValue();

    const indexOfSeat = currentOrderItems.findIndex(
      (el) => el.seat.column === seat.column && el.seat.row === seat.row
    );

    if (indexOfSeat === -1) {
      this.seatTickets$$.next([
        ...this.seatTickets$$.value,
        { seat, ticket: ticketType, showingId },
      ]);
    } else {
      currentOrderItems.splice(indexOfSeat, 1);
      this.deleteChosenSeatAndTicket({ seat, ticket: ticketType, showingId });
      this.seatTickets$$.next(currentOrderItems);
    }
  }

  checkIfSeatIsAvailable(
    showingId: number,
    seatId: number
  ): Observable<boolean> {
    return this.http.get<Order[]>(`orders?showingId=${showingId}`).pipe(
      map((orders) => {
        const occupiedSeats = orders.flatMap(({ orderItems }) =>
          orderItems.map(({ seatId }) => seatId)
        );

        return occupiedSeats.some(
          (occupiedSeatId) => occupiedSeatId === seatId
        );
      })
    );
  }

  getOccupiedSeats(showingId: number) {
    return this.http.get<Order[]>(`orders?showingId=${showingId}`).pipe(
      map((orders) => {
        return orders.flatMap(({ orderItems }) =>
          orderItems.map(({ seatId }) => seatId)
        );
      })
    );
  }

  selectTicket(seat: SeatTicket) {
    const currentOrderItems = this.seatTickets$$.getValue();

    const updated = currentOrderItems.map((el) => {
      if (el.seat === seat.seat) {
        el.seat === seat.seat;
      }
      return el;
    });
    this.seatTickets$$.next(updated);
  }

  deleteChosenSeatAndTicket(orderItem: SeatTicket) {
    const currentOrderItems = this.seatTickets$$.getValue();

    currentOrderItems.forEach((item, index) => {
      if (item === orderItem) {
        currentOrderItems.splice(index, 1);
      }
    });

    this.seatTickets$$.next(currentOrderItems);
  }

  sumTicketsValues() {
    return this.seatTickets$.pipe(
      map((pair) => {
        return pair
          .map((pair) => pair.ticket.price)
          .reduce((acc, value) => acc + value, 0);
      })
    );
  }

  clearSeatSelection() {
    this.seatTickets$$.next([]);
  }
}
