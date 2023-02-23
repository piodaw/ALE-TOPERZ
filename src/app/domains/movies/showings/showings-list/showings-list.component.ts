import { NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Observable } from 'rxjs';
import { Showing } from '../../movie.interface';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-showings-list',
  templateUrl: './showings-list.component.html',
  styleUrls: ['./showings-list.component.css'],
  standalone: true,
  imports: [MatDividerModule, MatListModule, NgFor, AsyncPipe],
})
export class ShowingsListComponent implements OnInit {
  @Input() showings: Observable<Showing[]>;

  ngOnInit() {
    this.showings.subscribe((el) => console.log(el));
  }
}