import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, map } from 'rxjs';
import { Seat } from './hall.interface';

@Injectable({
  providedIn: 'root',
})
export class HallStateService {
  private seatsBehaviorSubject$$ = new BehaviorSubject<{
    [key: string]: { [key: number]: Seat };
  }>({});

  get seats$() {
    return this.seatsBehaviorSubject$$.asObservable();
  }

  constructor(private http: HttpClient) {}

  fetchSeats(hallId: number) {
    return this.http.get<Seat[]>(`seats?hallId=${hallId}`).pipe(
      map((seats) => {
        const seatsMap = {} as {
          [key: string]: { [key: number]: typeof seats[number] };
        };

        seats.forEach((seat) => {
          if (seatsMap[seat.row]) {
            seatsMap[seat.row][seat.column] = seat;
          } else {
            seatsMap[seat.row] = {
              [seat.column]: seat,
            };
          }
        });
        return seatsMap;
      }),
      tap((response) => {
        this.seatsBehaviorSubject$$.next(response);
      })
    );
  }
}