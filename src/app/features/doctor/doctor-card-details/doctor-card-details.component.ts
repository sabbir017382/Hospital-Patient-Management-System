import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Doctor } from 'src/app/core/models/doctor';
import { DoctorService } from 'src/app/core/service/doctor.service';
import { AppointmentModalComponent } from 'src/app/features/Appointment/appointment-modal/appointment-modal.component';

@Component({
  selector: 'app-doctor-card-details',
  templateUrl: './doctor-card-details.component.html',
  styleUrls: ['./doctor-card-details.component.css'],
})
export class DoctorCardDetailsComponent implements OnInit, OnDestroy {
  doctor?: Doctor;
  isNotFound = false;
  subscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
    private dialog: MatDialog,
  ) {}

  openAppointmentModal() {
    if (!this.doctor?.doctorId) {
      return;
    }

    this.dialog.open(AppointmentModalComponent, {
      width: '520px',
      data: {
        doctorId: this.doctor.doctorId,
      },
    });
  }

  ngOnInit() {
    this.subscription = this.route.paramMap.subscribe((params) => {
      const doctorId = params.get('id');
      if (!doctorId) {
        this.isNotFound = true;
        return;
      }

      const doctor = this.doctorService.getDoctorById(doctorId);
      if (!doctor) {
        this.isNotFound = true;
      } else {
        this.doctor = doctor;
        this.isNotFound = false;
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  goBack() {
    this.router.navigate(['/doctors']);
  }
}
