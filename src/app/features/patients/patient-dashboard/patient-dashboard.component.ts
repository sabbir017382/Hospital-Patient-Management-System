import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from 'src/app/core/models/patient';
import { PatientService } from 'src/app/core/service/patient.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppointmentModalComponent } from '../../Appointment/appointment-modal/appointment-modal.component';
import { Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-patient-detail-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
})
export class PatientDashboardComponent implements OnInit, OnDestroy {
  patient: Patient | null = null;
  appointmentCount = 0;
  selectedTab: 'info' | 'appointments' = 'info';
  isLoading = true;
  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.routeSub = this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            return this.patientService.getPatientById(id);
          }
          return this.patientService
            .getPatients()
            .pipe(map((patients) => patients[0] || null));
        }),
      )
      .subscribe((patient) => {
        this.patient = patient ?? null;
        this.refreshAppointmentCount();
        this.isLoading = false;
      });
  }

  ngOnDestroy() {
    this.routeSub?.unsubscribe();
  }

  refreshAppointmentCount() {
    if (!this.patient) {
      this.appointmentCount = 0;
      return;
    }
    this.appointmentCount = this.patientService.getAppointmentsByPatient(
      this.patient.id,
    ).length;
  }

  onAppointmentBooked() {
    this.refreshAppointmentCount();
  }

  editPatient() {
    if (!this.patient) {
      return;
    }
    this.router.navigate(['/patients', this.patient.id, 'edit']);
  }

  bookAppointment() {
    if (!this.patient) {
      return;
    }

    this.dialog.open(AppointmentModalComponent, {
      width: '520px',
      data: { patient: this.patient },
    });
  }

  deletePatient() {
    if (!this.patient) {
      return;
    }

    const confirmed = confirm(
      `Delete ${this.patient.fullName}? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    this.patientService.deletePatients([this.patient.id]);
    this.snackBar.open('Patient deleted', 'OK', {
      duration: 2000,
    });
    this.router.navigate(['/patients']);
  }
}
