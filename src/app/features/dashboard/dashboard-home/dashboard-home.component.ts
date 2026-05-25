import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Appointment } from 'src/app/core/models/appoinment';
import { Patient } from 'src/app/core/models/patient';
import { PatientService } from 'src/app/core/service/patient.service';
import { DoctorService } from 'src/app/core/service/doctor.service';

interface Doctor {
  doctorId?: string;
  doctorName: string;
  specialty: string;
  availability: string;
}

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css'],
})
export class DashboardHomeComponent implements OnInit {
  totalPatients = 0;
  totalAppointments = 0;
  upcomingAppointments = 0;
  completionRate = 0;
  recentAppointments: Appointment[] = [];
  patientsMap: Record<string, Patient> = {};
  doctors: Doctor[] = [];

  constructor(
    private patientService: PatientService,
    private doctorService: DoctorService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.patientService.getPatients().subscribe((patients) => {
      this.totalPatients = patients.length;
      this.patientsMap = {};
      patients.forEach((patient) => {
        this.patientsMap[patient.id] = patient;
      });
    });

    this.patientService.getAppointments().subscribe((appointments) => {
      this.totalAppointments = appointments.length;
      this.upcomingAppointments =
        this.patientService.getUpcomingAppointments().length;
      this.completionRate = this.calculateCompletionRate(appointments);
      this.recentAppointments = [...appointments]
        .sort(
          (a, b) =>
            new Date(b.appointmentDate).getTime() -
            new Date(a.appointmentDate).getTime(),
        )
        .slice(0, 5);
    });

    this.doctorService.getDoctors().subscribe((doctors) => {
      this.doctors = doctors;
    });
  }

  getPatientName(id: string): string {
    return this.patientsMap[id]?.fullName || id;
  }

  openDoctorsDialog(): void {
    this.dialog.open(DoctorsDialogComponent, {
      width: '600px',
      data: { doctors: this.doctors },
    });
  }

  private calculateCompletionRate(appointments: Appointment[]): number {
    if (!appointments.length) {
      return 0;
    }
    const completed = appointments.filter(
      (appt) => appt.status === 'Completed',
    ).length;
    return Math.round((completed / appointments.length) * 100);
  }
}

@Component({
  selector: 'app-doctors-dialog',
  template: `
    <h2 mat-dialog-title>Available Doctors</h2>
    <mat-dialog-content>
      <div class="doctors-list">
        <mat-card class="doctor-card" *ngFor="let doctor of data.doctors">
          <mat-card-header>
            <mat-card-title>{{ doctor.doctorName }}</mat-card-title>
            <mat-card-subtitle>{{ doctor.specialty }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p><strong>ID:</strong> {{ doctor.doctorId }}</p>
            <p><strong>Availability:</strong> {{ doctor.availability }}</p>
          </mat-card-content>
          <mat-card-actions align="end">
            <button
              mat-stroked-button
              color="primary"
              [disabled]="!doctor.doctorId"
              (click)="viewProfile(doctor.doctorId)"
            >
              View Profile
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="true">Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .doctors-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
        max-height: 400px;
        overflow-y: auto;
      }
      .doctor-card {
        padding: 12px;
      }
    `,
  ],
})
export class DoctorsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { doctors: Doctor[] },
    private router: Router,
    private dialogRef: MatDialogRef<DoctorsDialogComponent>,
  ) {}

  viewProfile(doctorId: string | undefined) {
    if (!doctorId) {
      return;
    }
    this.dialogRef.close();
    this.router.navigate(['/doctors', doctorId]);
  }
}
