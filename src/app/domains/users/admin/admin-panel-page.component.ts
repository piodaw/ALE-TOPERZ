import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-panel-page',
  templateUrl: './admin-panel-page.component.html',
  styleUrls: ['./admin-panel-page.component.css'],
})
export class AdminPanelPageComponent implements OnInit {
  ngOnInit(): void {
    console.log('admin');
  }
}
