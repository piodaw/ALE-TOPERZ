import { NgModule } from '@angular/core';
import { ADMIN_ROUTES } from './admin.routes';
import { AdminPanelPageComponent } from './admin-panel-page.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AdminPanelPageComponent],
  imports: [CommonModule,  RouterModule.forChild(ADMIN_ROUTES), ],
})
export class AdminModule {}
