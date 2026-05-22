import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Doctor } from 'src/app/core/models/doctor';
import { DoctorService } from 'src/app/core/service/doctor.service';

@Component({
  selector: 'app-doctor-card-details',
  templateUrl: './doctor-card-details.component.html',
  styleUrls: ['./doctor-card-details.component.css'],
})
export class DoctorCardDetailsComponent implements OnInit, OnDestroy {
  doctor?: Doctor;
  isNotFound = false;
  subscription?: Subscription;
  defaultDoctorImage = 'https://via.placeholder.com/420x420.png?text=Doctor';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService,
  ) {}

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
