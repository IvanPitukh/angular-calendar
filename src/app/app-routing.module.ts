import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LazyGuard } from './guard/lazy.guard';
import { CalendarComponent } from './module/calendar/calendar.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'calendar',
    pathMatch: 'full'
  },
  {
    path: 'calendar', 
    component: CalendarComponent,
    canLoad: [LazyGuard],
    loadChildren: () => import('./module/calendar/calendar.module').then(m => m.CalendarModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
