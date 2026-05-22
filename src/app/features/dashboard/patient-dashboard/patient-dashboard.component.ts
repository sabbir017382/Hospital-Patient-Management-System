import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AppointmentModalComponent } from 'src/app/features/Appointment/appointment-modal/appointment-modal.component';

@Component({
  selector: 'app-patient-dashboard',
  templateUrl: './patient-dashboard.component.html',
  styleUrls: ['./patient-dashboard.component.css'],
})
export class PatientDashboardComponent {
  constructor(
    private dialog: MatDialog,
    private router: Router,
  ) {}

  // openBooking() {
  //   const dialogRef = this.dialog.open(AppointmentModalComponent, {
  //     width: '560px',
  //     data: {},
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       this.router.navigate(['/patients']);
  //     }
  //   });
  // }
}
