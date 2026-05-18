import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AnalyticsDashboardComponent } from './features/dashboard/analytics-dashboard/analytics-dashboard.component';
import { PatientDashboardComponent } from './features/dashboard/patient-dashboard/patient-dashboard.component';
import { AppointmentModalComponent } from './features/Appointment/appointment-modal/appointment-modal.component';
import { LoginComponent } from './features/auth/login/login.component';
import { AuthGuardGuard } from './core/guard/auth-guard.guard';
import { PatientFormComponent } from './features/patients/patient-form/patient-form.component';
import { PatientListComponent } from './features/patients/patient-list/patient-list.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
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
    path: 'patient-form',
    component: PatientFormComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'patient-form/:id',
    component: PatientFormComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'patient-list',
    component: PatientListComponent,
    canActivate: [AuthGuardGuard],
  },
  {
    path: 'appointment-booking',
    component: AppointmentModalComponent,
    canActivate: [AuthGuardGuard],
  },
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
