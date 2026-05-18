import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material/material.module';
import { PatientFormComponent } from './patients/patient-form/patient-form.component';
import { PatientDashboardComponent } from './dashboard/patient-dashboard/patient-dashboard.component';
import { PatientInfoComponent } from './patients/patient-info/patient-info.component';
import {
  PatientListComponent,
  DeleteConfirmDialog,
} from './patients/patient-list/patient-list.component';
import { PatientCardComponent } from './patients/patient-card/patient-card.component';
import { AppointmentModalComponent } from './Appointment/appointment-modal/appointment-modal.component';
import { AppointmentHistoryComponent } from './patients/appointment-history/appointment-history.component';
import { AnalyticsDashboardComponent } from './dashboard/analytics-dashboard/analytics-dashboard.component';

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
  ],
  imports: [CommonModule, MaterialModule, ReactiveFormsModule, FormsModule],
})
export class FeaturesModule {}
