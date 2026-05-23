import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MaterialModule } from '../shared/material/material.module';
import { NgChartsModule } from 'ng2-charts';
import { PatientFormComponent } from './patients/patient-form/patient-form.component';
import { PatientDashboardComponent } from './patients/patient-dashboard/patient-dashboard.component';
import { PatientInfoComponent } from './patients/patient-info/patient-info.component';
import {
  PatientListComponent,
  DeleteConfirmDialog,
} from './patients/patient-list/patient-list.component';
import { PatientCardComponent } from './patients/patient-card/patient-card.component';
import { AppointmentModalComponent } from './Appointment/appointment-modal/appointment-modal.component';
import { AppointmentHistoryComponent } from './patients/appointment-history/appointment-history.component';
import { AnalyticsDashboardComponent } from './dashboard/analytics-dashboard/analytics-dashboard.component';
import {
  DashboardHomeComponent,
  DoctorsDialogComponent,
} from './dashboard/dashboard-home/dashboard-home.component';
import { CreateDoctorComponent } from './doctor/create-doctor/create-doctor.component';
import { DoctorListComponent } from './doctor/doctor-list/doctor-list.component';
import { DoctorCardDetailsComponent } from './doctor/doctor-card-details/doctor-card-details.component';
import { DoctorDashboardComponent } from './doctor/doctor-dashboard/doctor-dashboard.component';
import { CreatePrescriptionComponent } from './doctor/create-prescription/create-prescription.component';
import { DoctorSelectionComponent } from './doctor/doctor-selection/doctor-selection.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardHomeComponent },
  { path: 'patients', component: PatientListComponent },
  { path: 'patients/new', component: PatientFormComponent },
  { path: 'patients/:id', component: PatientDashboardComponent },
  { path: 'patients/:id/edit', component: PatientFormComponent },
  { path: 'analytics', component: AnalyticsDashboardComponent },
  { path: 'patient-dashboard', redirectTo: 'patients', pathMatch: 'full' },
  { path: 'patient-list', redirectTo: 'patients', pathMatch: 'full' },
  { path: 'patient-form', redirectTo: 'patients/new', pathMatch: 'full' },
  {
    path: 'patient-form/:id',
    redirectTo: 'patients/:id/edit',
    pathMatch: 'full',
  },
  { path: 'doctors/:id', component: DoctorCardDetailsComponent },
  { path: 'doctors', component: DoctorListComponent },
  { path: 'create-doctor', component: CreateDoctorComponent },
  { path: 'create-prescription', component: CreatePrescriptionComponent },
  { path: 'doctor-selection', component: DoctorSelectionComponent },
  { path: 'doctor-dashboard/:id', component: DoctorDashboardComponent },
  { path: 'doctor-dashboard', component: DoctorDashboardComponent },

  { path: 'appointment-booking', redirectTo: 'patients', pathMatch: 'full' },
];

@NgModule({
  declarations: [
    PatientFormComponent,
    PatientDashboardComponent,
    PatientInfoComponent,
    PatientListComponent,
    DeleteConfirmDialog,
    PatientCardComponent,
    AppointmentModalComponent,
    AppointmentHistoryComponent,
    AnalyticsDashboardComponent,
    DashboardHomeComponent,
    DoctorsDialogComponent,
    CreateDoctorComponent,
    DoctorListComponent,
    DoctorCardDetailsComponent,
    DoctorDashboardComponent,
    CreatePrescriptionComponent,
    DoctorSelectionComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    NgChartsModule,
  ],
})
export class FeaturesModule {}
