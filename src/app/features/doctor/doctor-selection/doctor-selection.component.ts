import { Component, OnInit } from '@angular/core';
import { DoctorService } from 'src/app/core/service/doctor.service';
import { Router } from '@angular/router';
import { Doctor } from 'src/app/core/models/doctor';

@Component({
  selector: 'app-doctor-selection',
  templateUrl: './doctor-selection.component.html',
  styleUrls: ['./doctor-selection.component.css'],
})
export class DoctorSelectionComponent implements OnInit {
  doctors: Doctor[] = [];

  constructor(
    private doctorService: DoctorService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.doctorService.getDoctors().subscribe((doctors) => {
      this.doctors = doctors;
      console.log('Loaded doctors:', doctors);
    });
  }

  //   selectDoctor(doctor: Doctor) {
  //     const selectedDoctor = {
  //       doctorId: doctor.doctorId || doctor.id,
  //       name: doctor.doctorName || doctor.name,
  //       specialty: doctor.specialty,
  //       imageUrl: doctor.imageUrl || '',
  //       role: 'doctor',
  //       token: 'session-token',
  //     };
  //     localStorage.setItem('selectedDoctor', JSON.stringify(selectedDoctor));
  //     this.router.navigate(['/doctor-dashboard', selectedDoctor.doctorId]);
  //   }

  selectDoctor(doctor: Doctor) {
    const doctorId = doctor.doctorId || doctor.id;

    if (!doctorId) {
      console.error('Doctor ID missing!');
      return;
    }

    const selectedDoctor = {
      doctorId,
      name: doctor.doctorName || doctor.name,
      specialty: doctor.specialty,
      imageUrl: doctor.imageUrl || '',
      role: 'doctor',
      token: 'session-token',
    };

    localStorage.setItem('selectedDoctor', JSON.stringify(selectedDoctor));
  }
}
