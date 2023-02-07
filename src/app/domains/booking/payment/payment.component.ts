import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ChoosenMovieShowingStateService } from '../../movies';
import { ShowingWithMovie } from '../../movies/movie.interface';
import { Order } from '../order';
import { OrderStateService } from '../order/order.service';
import { OrderItemsStateService } from '../order';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent {
  private router = inject(Router);
  private orderService = inject(OrderStateService);
  chosenMovieShowing$ = inject(ChoosenMovieShowingStateService)
    .chosenMovieShowing$;
  private orderItemService = inject(OrderItemsStateService);

  order$: Observable<Order> = this.orderService.order$;
  sumOfTickets: number;

  constructor() {
    this.orderItemService
      .sumTicketsValues()
      .pipe(
        tap((sum) => {
          this.sumOfTickets = sum;
        })
      )
      .subscribe();
  }

  cancelPayment(chosenMoving: ShowingWithMovie) {
    this.router.navigate([
      'booking/payment',
      chosenMoving.id,
      chosenMoving.movie.title,
      'cancel',
    ]);
  }

  approvePayment(chosenMoving: ShowingWithMovie, orderId: number) {
    this.orderService.changeOrderStatus(orderId);

    this.router.navigate([
      '/booking/summary',
      chosenMoving.id,
      chosenMoving.movie.title,
    ]);
  }
}
