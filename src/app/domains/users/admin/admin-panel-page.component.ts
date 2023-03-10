import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { AsyncPipe, NgIf, NgFor } from '@angular/common';
import { Observable, of, switchMap, take, tap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialog,
  MatDialogModule,
  MatDialogConfig,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import * as moment from 'moment';
import { FormsModule } from '@angular/forms';

import { Movie, Showing } from '../../movies/movie.interface';
import { MovieActions } from '../../movies/store/movie.actions';
import * as movieSelectors from '../../movies/store/movie.selectors';
import { MovieFormComponent } from '../../movies/movie-form/movie-form.component';
import {
  AddShowingFormComponent,
  ShowingFormValue,
} from '../../movies/showings/add-showing/add-showing-form.component';
import { ShowingsListComponent } from '../../movies/showings/showings-list/showings-list.component';
import {
  ShowingsState,
  ShowingsStore,
} from '../../movies/showings/store/showing.store';
import { ShowingTimeValidationService } from '../../movies/showings/showing-time-validation.service';
import { MovieRatingStateService } from '../../movies/movie-rating/movie-rating.state.service';

@Component({
  selector: 'app-admin-panel-page',
  templateUrl: './admin-panel-page.component.html',
  styleUrls: ['./admin-panel-page.component.css'],
  standalone: true,
  imports: [
    NgIf,
    AsyncPipe,
    NgFor,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MovieFormComponent,
    MatIconModule,
    AddShowingFormComponent,
    ShowingsListComponent,
  ],
  providers: [ShowingsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPanelPageComponent implements OnInit {
  private store = inject(Store);
  public dialog = inject(MatDialog);
  private showingsStore = inject(ShowingsStore);
  private showingTimeValidationService = inject(ShowingTimeValidationService);
  private ratingService = inject(MovieRatingStateService);

  selectedValue: Movie;
  allMovies$: Observable<Movie[]>;
  state$ = this.showingsStore.state$;
  showForm = false;
  overlappingShowings: Showing[];
  showingSt: ShowingsState;

  ngOnInit(): void {
    this.allMovies$ = this.store.select(movieSelectors.selectAllMovies);
    this.loadMovies();

    this.allMovies$
      .pipe(tap((movies: Movie[]) => (this.selectedValue = movies[0])))
      .subscribe();
  }

  loadMovies(): void {
    this.store.dispatch(MovieActions.getMovies());
  }

  openDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;

    const dialogRef = this.dialog.open(MovieFormComponent, dialogConfig);

    dialogRef.afterClosed().subscribe();
  }

  filterShowings(): Observable<Showing[]> {
    return this.state$.pipe(
      take(1),
      switchMap((showingsState: ShowingsState) => {
        if (showingsState !== undefined) {
          this.showingSt = showingsState;
        }
        const filteredShowings = showingsState.showings.filter(
          (s) => s.movieId === this.selectedValue.id
        );
        return of(filteredShowings);
      })
    );
  }

  getOveralRating(movieId: number): Observable<number> {
    return this.ratingService.getOverallRatingForMovie(movieId);
  }

  addShowing(res: ShowingFormValue) {
    const timeToInMinutes =
      moment.duration(res.hour).asMinutes() + this.selectedValue.duration;

    const timeToInHours = moment
      .utc()
      .startOf('day')
      .add(timeToInMinutes, 'minutes')
      .format('HH:mm');

    const formattedDate = moment(res.date).format('YYYY-MM-DD');

    this.showingTimeValidationService
      .canAddShowing(res, this.showingSt, this.selectedValue)
      .subscribe((canAdd) => {
        if (canAdd) {
          this.showingsStore.addShowing({
            movieId: this.selectedValue.id,
            hallId: res.hall.id,
            date: formattedDate,
            movieBreak: res.break,
            timeFrom: res.hour,
            timeTo: timeToInHours,
          });
          this.showForm = false;
          window.location.reload();
        }
      });
  }
}
