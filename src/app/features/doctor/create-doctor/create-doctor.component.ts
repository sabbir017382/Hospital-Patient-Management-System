import { Component, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService } from 'src/app/core/service/doctor.service';
import { Doctor } from 'src/app/core/models/doctor';

const DEFAULT_DOCTOR: Doctor = {
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
  name: '',
  availability: '',
};

@Component({
  selector: 'app-create-doctor',
  templateUrl: './create-doctor.component.html',
  styleUrls: ['./create-doctor.component.css'],
})
export class CreateDoctorComponent {
  doctor: Doctor = { ...DEFAULT_DOCTOR };
  duplicateErrorMessage = '';

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
    '07:00 PM',
    '08:00 PM',
    '09:00 PM',
    '10:00 PM',
  ];

  daysOfWeek = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  imageUploaded = false;
  imageUploadLoading = false;
  uploadedFileName = '';
  selectedFile: File | null = null;

  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(
    private doctorService: DoctorService,
    private router: Router,
  ) {}

  onFileSelected(event: any) {
    const file = event.target.files?.[0];

    if (!file) {
      this.imageUploaded = false;
      this.imageUploadLoading = false;
      this.uploadedFileName = '';
      this.selectedFile = null;
      this.doctor.imageUrl = '';
      return;
    }

    this.selectedFile = file;
    this.uploadedFileName = file.name;
    this.imageUploaded = false;
    this.imageUploadLoading = true;

    const reader = new FileReader();
    reader.onload = () => {
      this.doctor.imageUrl = reader.result as string;
      this.imageUploaded = true;
      this.imageUploadLoading = false;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    this.duplicateErrorMessage = '';
    const newDoctor: Doctor = {
      ...this.doctor,
      doctorId: undefined,
      name: this.doctor.doctorName,
      availability: this.getAvailability(),
    };

    if (this.doctorService.doctorExists(newDoctor)) {
      this.duplicateErrorMessage =
        'This doctor already exists. Please add a different doctor.';
      return;
    }
    this.doctorService.createDoctor(newDoctor);
    this.router.navigate(['/doctors']);
    this.resetForm(form);
  }

  onReset(form: NgForm) {
    this.resetForm(form);
  }

  private resetForm(form: NgForm) {
    this.doctor = { ...DEFAULT_DOCTOR };
    this.imageUploaded = false;
    this.selectedFile = null;

    form.resetForm();

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  private getAvailability(): string {
    const start = this.doctor.chamberTime.start.trim();
    const end = this.doctor.chamberTime.end.trim();
    return start && end ? `${start} — ${end}` : '';
  }
}
