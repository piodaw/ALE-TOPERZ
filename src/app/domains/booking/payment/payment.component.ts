import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { combineLatest, Observable, map } from 'rxjs';
import { NgIf, AsyncPipe, JsonPipe } from '@angular/common';

import { ChoosenMovieShowingStateService } from '../../movies';
import { ShowingWithMovie } from '../../movies/movie.interface';
import { Order } from '../order';
import { OrderStateService } from '../order/order.state.service';
import { ButtonComponent } from 'src/app/shared/components/button/button.component';
import { NumberDirective } from 'src/app/shared/directives/numbers-only.directive';
import { DiscountCodesStateService } from '../order/discountCodes/discount-codes.state.service';
import { DiscountCode } from '../order/discountCodes/discount-codes.interface';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  imports: [
    NgIf,
    ButtonComponent,
    AsyncPipe,
    NumberDirective,
    JsonPipe,
    RouterModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentComponent {
  private router = inject(Router);
  private orderService = inject(OrderStateService);
  chosenMovieShowing$ = inject(ChoosenMovieShowingStateService)
    .chosenMovieShowing$;
  private discountCodeService = inject(DiscountCodesStateService);

  order$: Observable<Order> = this.orderService.order$;
  regularPrice$: Observable<string>;
  discountedPrice$: Observable<string>;

  discountCode$: Observable<DiscountCode> =
    this.discountCodeService.discountCode$;

  constructor() {
    this.regularPrice$ = this.orderService
      .sumTicketsValues()
      .pipe(map((price) => price.toFixed(2)));

    this.discountedPrice$ = combineLatest([
      this.orderService.sumTicketsValues(),
      this.discountCodeService.discountCode$,
    ]).pipe(
      map(([regularPrice, discountCode]) => {
        if (!discountCode) {
          return null;
        }
        return (regularPrice * (100 - discountCode.discount)) / 100;
      }),
      map((price) => price?.toFixed(2))
    );
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
    this.orderService.changeOrderPaidStatus(orderId);

    this.discountCodeService.markDiscountCodeAsUsed();
    this.orderService.clearOrder();

    this.router.navigate([
      '/booking/summary',
      orderId,
      chosenMoving.movie.title,
    ]);
  }
}
