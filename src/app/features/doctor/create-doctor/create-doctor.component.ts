import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService } from 'src/app/core/service/doctor.service';
import { Doctor } from 'src/app/core/models/doctor';

@Component({
  selector: 'app-create-doctor',
  templateUrl: './create-doctor.component.html',
  styleUrls: ['./create-doctor.component.css'],
})
export class CreateDoctorComponent {
  doctor: Doctor = {
    doctorName: '',
    qualification: '',
    specialty: '',
    email: '',
    phone: '',
    designation: '',
    institute: '',
    departmentName: '',
    consultationFee: 0,
    OffDays: [],
    availableDays: [],
    chamberTime: {
      start: '',
      end: '',
    },
    floorNumber: '',
    roomNumber: 0,
    branchName: '',
    branchAddress: '',
    imageUrl: '',
    doctorId: undefined,
    id: '',
    name: '',
    availability: '',
  };

  timeSlots = [
    '08:00 AM',
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
    '05:00 PM',
    '06:00 PM',
  ];

  daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  constructor(
    private doctorService: DoctorService,
    private router: Router,
  ) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.doctor.imageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const newDoctor: Doctor = {
      ...this.doctor,
      doctorId: undefined,
      id: '',
      name: this.doctor.doctorName,
      availability: this.getAvailability(),
      OffDays: this.doctor.OffDays || [],
      availableDays: this.doctor.availableDays || [],
      chamberTime: {
        start: this.doctor.chamberTime.start,
        end: this.doctor.chamberTime.end,
      },
    };

    this.doctorService.createDoctor(newDoctor);
    this.resetForm(form);
    this.router.navigate(['/doctors']);
  }

  private resetForm(form: NgForm) {
    this.doctor = {
      doctorName: '',
      qualification: '',
      specialty: '',
      email: '',
      phone: '',
      designation: '',
      institute: '',
      departmentName: '',
      consultationFee: 0,
      OffDays: [],
      availableDays: [],
      chamberTime: { start: '', end: '' },
      floorNumber: '',
      roomNumber: 0,
      branchName: '',
      branchAddress: '',
      imageUrl: '',
      doctorId: undefined,
      id: '',
      name: '',
      availability: '',
    };
    form.resetForm({
      doctorName: '',
      qualification: '',
      specialty: '',
      email: '',
      phone: '',
      designation: '',
      institute: '',
      departmentName: '',
      consultationFee: 0,
      chamberTime: { start: '', end: '' },
      floorNumber: '',
      roomNumber: 0,
      branchName: '',
      branchAddress: '',
      imageUrl: '',
      doctorId: undefined,
      id: '',
      name: '',
      availability: '',
    });
  }

  private getAvailability(): string {
    const start = this.doctor.chamberTime.start.trim();
    const end = this.doctor.chamberTime.end.trim();
    return start && end ? `${start} — ${end}` : '';
  }
}
