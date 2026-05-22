import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppointmentModalComponent } from 'src/app/features/Appointment/appointment-modal/appointment-modal.component';
import { DoctorService } from 'src/app/core/service/doctor.service';
import { Doctor } from 'src/app/core/models/doctor';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css'],
})
export class DoctorListComponent implements OnInit {
  doctors: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  searchName = '';
  searchSpecialty = '';
  defaultDoctorImage = 'https://via.placeholder.com/160x160.png?text=Doctor';

  constructor(
    private doctorService: DoctorService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  deleteDoctor(doctor: Doctor) {
    const doctorId = doctor.id || doctor.doctorId;
    if (!doctorId) {
      return;
    }

    this.doctorService.deleteDoctor(doctorId);
  }

  ngOnInit() {
    this.doctorService.getDoctors().subscribe((doctors) => {
      this.doctors = doctors;
      this.filteredDoctors = doctors;
    });
  }

  filterDoctors() {
    const name = this.searchName.trim().toLowerCase();
    const specialty = this.searchSpecialty.trim().toLowerCase();

    this.filteredDoctors = this.doctors.filter((doctor) => {
      const matchesName =
        !name ||
        doctor.doctorName.toLowerCase().includes(name) ||
        doctor.name.toLowerCase().includes(name);
      const matchesSpecialty =
        !specialty || doctor.specialty.toLowerCase().includes(specialty);
      return matchesName && matchesSpecialty;
    });
  }

  openAppointmentModal(doctor: Doctor) {
    const dialogRef = this.dialog.open(AppointmentModalComponent, {
      width: '520px',
      data: { doctorId: doctor.id || doctor.doctorId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // optionally show a snack bar or refresh state
      }
    });
  }

  openProfile(doctor: Doctor) {
    const doctorId = doctor.id || doctor.doctorId;
    if (doctorId) {
      this.router.navigate(['/doctors', doctorId]);
    }
  }
}
