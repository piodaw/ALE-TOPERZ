import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';

import { UserStateService } from 'src/app/core/user.state.service';
import { AuthResponse } from './auth.interface';
import { LocalStorageService } from 'src/app/shared/local-storage';
import { ChoosenMovieShowingStateService } from '../movies/choosen-movie.state.service';
import { OrderStateService } from '../booking/order/order.state.service';

@Injectable({ providedIn: 'root' })
export class AuthLoginStateService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private userStateService = inject(UserStateService);
  private localStorageService = inject(LocalStorageService);
  private choosenMovieService = inject(ChoosenMovieShowingStateService);
  private orderService = inject(OrderStateService);

  private auth$$ = new BehaviorSubject<{ hasAuth: boolean }>({
    hasAuth: false,
  });

  userRole: string;

  get auth$() {
    return this.auth$$.asObservable();
  }

  constructor() {
    this.manageLocalStorage();
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>('login', {
        email,
        password,
      })
      .pipe(
        tap({
          next: (response) => {
            const { accessToken, user } = response;

            this.userStateService.setUser(user);
            this.auth$$.next({ hasAuth: true });
            this.localStorageService.saveData(
              'token',
              JSON.stringify(accessToken)
            );
            localStorage.setItem('user', JSON.stringify(user));
            this.localStorageService.saveData('role', response.user.role);

            this.userRole = response.user.role;
            this.localStorageService.removeData('order');

            if (this.userRole === 'admin') {
              this.router.navigate(['/', 'admin']);
            } else if (this.userRole === 'user') {
              this.choosenMovieService.setChoosenMovieShowing(null);
              this.orderService.clearOrder();
              this.router.navigate(['/', 'user/home']);
            }
          },
        })
      );
  }

  logout() {
    localStorage.removeItem('user');
    this.localStorageService.removeData('token');
    this.localStorageService.removeData('role');

    this.choosenMovieService.setChoosenMovieShowing(null);
    this.orderService.clearOrder();
    this.localStorageService.removeData('order');
    this.auth$$.next({
      ...this.auth$$.value,
      hasAuth: false,
    });
  }

  private manageLocalStorage() {
    if (this.localStorageService.getData('token')) {
      this.auth$$.next({ hasAuth: true });
    }
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      this.userStateService.setUser(JSON.parse(storedUser));
    }
  }

  handleNonAuthUser() {
    this.router.navigate['login'];
  }
}
