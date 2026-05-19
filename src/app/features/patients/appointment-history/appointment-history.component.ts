import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Appointment } from 'src/app/core/models/appoinment';
import { PatientService } from 'src/app/core/service/patient.service';
import { AppointmentModalComponent } from 'src/app/features/Appointment/appointment-modal/appointment-modal.component';

@Component({
  selector: 'app-appointment-history',
  templateUrl: './appointment-history.component.html',
  styleUrls: ['./appointment-history.component.css'],
})
export class AppointmentHistoryComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() patientId = '';
  @Output() appointmentBooked = new EventEmitter<void>();

  appointments: Appointment[] = [];
  private appointmentIds = new Set<string>();
  private appointmentsSub?: Subscription;

  constructor(
    private patientService: PatientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.appointmentsSub = this.patientService
      .getAppointments()
      .subscribe((appointments) => {
        if (!this.patientId) {
          return;
        }

        const filtered = appointments.filter(
          (appt) => appt.patientId === this.patientId,
        );
        const currentIds = new Set(filtered.map((appt) => appt.id));
        const newIds = filtered
          .map((appt) => appt.id)
          .filter((id) => !this.appointmentIds.has(id));

        if (this.appointmentIds.size > 0 && newIds.length > 0) {
          this.appointmentBooked.emit();
        }

        this.appointmentIds = currentIds;
        this.appointments = filtered;
      });

    this.refreshAppointments();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['patientId'] && !changes['patientId'].firstChange) {
      this.refreshAppointments();
    }
  }

  ngOnDestroy() {
    this.appointmentsSub?.unsubscribe();
  }

  refreshAppointments() {
    if (!this.patientId) {
      this.appointments = [];
      this.appointmentIds.clear();
      return;
    }

    const filtered = this.patientService.getAppointmentsByPatient(
      this.patientId,
    );
    this.appointments = filtered;
    this.appointmentIds = new Set(filtered.map((appt) => appt.id));
  }

  editAppointment(appointment: Appointment) {
    const dialogRef = this.dialog.open(AppointmentModalComponent, {
      width: '560px',
      data: { appointment },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.snackBar.open('Appointment updated', 'OK', {
          duration: 2000,
        });
        this.refreshAppointments();
      }
    });
  }
}
