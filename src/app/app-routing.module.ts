import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsDashboardComponent } from './features/dashboard/analytics-dashboard/analytics-dashboard.component';
import { PatientDashboardComponent } from './features/dashboard/patient-dashboard/patient-dashboard.component';
import { AppointmentModalComponent } from './features/Appointment/appointment-modal/appointment-modal.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AuthGuardGuard } from './core/guard/auth-guard.guard';

const routes: Routes = [
  { path: '', redirectTo: 'analytics', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuardGuard],
    data: { requiresGuest: true },
  },
  {
    path: 'analytics',
    component: AnalyticsDashboardComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'patient-dashboard',
    component: PatientDashboardComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'appointment-booking',
    component: AppointmentModalComponent,
    canActivate: [AuthGuardGuard],
  },
  { path: '**', redirectTo: 'analytics' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
